using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkiaSharp;
using Xinobi.Api.Designs;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Identity;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

// All writes target IsolatedApiFactory's disposable file stores; never the owner's data or a provider.
public sealed class SingleSourceAcceptanceTests
{
    const string Product = "DEMO-P101", Variant = "DEMO-V101-B";
    const string SourceRoute = "/api/v1/local-commerce/personalization-sources/" + Product;
    const string MaskRoute = "/api/v1/local-commerce/surfaces/products/" + Product;
    static string Sha(byte[] bytes) => Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
    static byte[] Image(int width, int height, bool mask = false)
    {
        using var bitmap = new SKBitmap(width, height); bitmap.Erase(mask ? SKColors.Transparent : SKColors.Teal);
        if (mask) { using var canvas = new SKCanvas(bitmap); using var paint = new SKPaint { Color = SKColors.White }; canvas.DrawRect(width / 4, 0, width / 2, height, paint); }
        using var pixels = bitmap.PeekPixels();
        using var data = mask ? pixels.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless, 100)) : pixels.Encode(SKEncodedImageFormat.Png, 100);
        return data!.ToArray();
    }
    static async Task<T> Read<T>(HttpResponseMessage response)
    {
        using (response) { Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync()); return (await response.Content.ReadFromJsonAsync<T>())!; }
    }
    static async Task<PersonalizationSourceView> Source(HttpClient staff, byte[] bytes)
    {
        using var form = new MultipartFormDataContent(); var part = new ByteArrayContent(bytes); part.Headers.ContentType = new("image/png"); form.Add(part, "file", "synthetic-source.png");
        var uploaded = await Read<JsonElement>(await staff.PostAsync("/api/v1/local-commerce/media", form));
        var image = uploaded.GetProperty("src").GetString()!;
        var candidate = await staff.GetFromJsonAsync<PersonalizationSourceAsset>(SourceRoute + "/candidate?image=" + Uri.EscapeDataString(image));
        Assert.Equal(Sha(bytes), candidate!.Sha256);
        var before = await staff.GetFromJsonAsync<PersonalizationSourceView>(SourceRoute);
        var saved = await Read<PersonalizationSourceView>(await staff.PutAsJsonAsync(SourceRoute, new SavePersonalizationSource(image, candidate.Sha256, before!.Revision)));
        Assert.Equal(bytes, await staff.GetByteArrayAsync(saved.Source!.Image));
        return saved;
    }

    [Theory]
    [InlineData(73, 41)]
    [InlineData(41, 73)]
    [InlineData(79, 79)]
    [InlineData(5001, 4000)]
    public async Task UploadedSourceToRevisionedDemoOrderAndThreeImmutableDownloads(int width, int height)
    {
        using var factory = new IsolatedApiFactory().WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string, string?> { ["ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"] = "true" })));
        using var staff = await TestStaff.Client(factory); using var customer = factory.CreateClient(); using var anonymous = factory.CreateClient();
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>(); var baseline = JsonSerializer.Serialize(await catalog.Read());
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var owner = await accounts.Register("Synthetic acceptance", "acceptance@example.invalid", "synthetic-strong-password");
        var tokens = await accounts.IssueTokens(owner.Id); customer.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        var photo = Image(width, height); await Source(staff, photo);
        var detail = (await staff.GetFromJsonAsync<SingleSourceMaskDetail>(MaskRoute))!;
        SingleSourceMaskUpload Upload(byte[] bytes) => new(detail.Source!.Image, detail.Source.Sha256, detail.SourceRevision, detail.ProfileRevision, Convert.ToBase64String(bytes), "alpha");
        // An AI/provider result on a different canvas must not silently resize or become approved.
        using (var wrong = await staff.PostAsJsonAsync(MaskRoute + "/mask", Upload(Image(37, 29, true)))) Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        detail = await Read<SingleSourceMaskDetail>(await staff.PostAsJsonAsync(MaskRoute + "/mask", Upload(Image(width, height, true))));
        var webp = await staff.GetByteArrayAsync(MaskRoute + $"/draft.webp?sourceRevision={detail.SourceRevision}&maskId={detail.Draft!.Id}");
        using (var codec = SKCodec.Create(SKData.CreateCopy(webp))) { Assert.Equal(width, codec.Info.Width); Assert.Equal(height, codec.Info.Height); Assert.Equal(SKEncodedImageFormat.Webp, codec.EncodedFormat); }
        detail = await Read<SingleSourceMaskDetail>(await staff.PostAsJsonAsync(MaskRoute + "/approval", new SingleSourceMaskAction(detail.Source!.Sha256, detail.SourceRevision, detail.ProfileRevision, detail.Draft.Id)));
        await Read<PersonalizationSourceView>(await staff.PutAsJsonAsync(SourceRoute + "/fulfillment", new SaveFulfillmentBinding(Variant, detail.ProfileRevision)));
        var purchase = (await anonymous.GetFromJsonAsync<SingleSourcePurchase>($"/api/v1/product-surfaces/{Product}/purchase"))!;
        Assert.Equal("ready", purchase.Status); var binding = purchase.Binding!; Assert.Equal(width, binding.Width); Assert.Equal(height, binding.Height); Assert.Equal(Sha(photo), binding.ProductSourceSha256);
        var pattern = Image(23, 17); using var patternForm = new MultipartFormDataContent(); var file = new ByteArrayContent(pattern); file.Headers.ContentType = new("image/png");
        patternForm.Add(file, "file", "synthetic-pattern.png"); patternForm.Add(new StringContent(Product), "productId");
        var design = await Read<MyDesign>(await customer.PostAsync("/api/v1/me/designs/upload", patternForm));
        var placement = new DesignPlacement(width, height, binding.MaskSha256, width / 2.0, height / 2.0, 1, 0, .4, Mode: "pattern");
        var route = $"/api/v1/me/designs/{design.Id}/configurations";
        var config = await Read<MyDesignConfiguration>(await customer.PostAsJsonAsync(route, new SaveDesignConfiguration(Variant, placement, SurfaceBinding: binding)));
        var revision = await Read<MyDesignConfiguration>(await customer.PostAsJsonAsync(route, new SaveDesignConfiguration(Variant, placement with { Rotation = 12 }, config.Id, config.Revision, SurfaceBinding: binding)));
        Assert.Equal(config.Revision + 1, revision.Revision);
        Assert.Equal(placement, (await customer.GetFromJsonAsync<MyDesignConfiguration>($"/api/v1/me/design-configurations/{config.Id}/revisions/{config.Revision}"))!.Placement);
        var composition = SingleSourceOrderFilesTests.Jpeg(); using var previewForm = new MultipartFormDataContent { { new ByteArrayContent(composition), "file", "preview.jpg" } };
        using (var preview = await customer.PutAsync($"/api/v1/me/design-configurations/{revision.Id}/revisions/{revision.Revision}/preview", previewForm)) Assert.Equal(HttpStatusCode.NoContent, preview.StatusCode);
        var address = await Read<CustomerAddress>(await customer.PostAsJsonAsync("/api/v1/me/addresses", new SaveCustomerAddress("Test", "Synthetic acceptance", "05321234567", "İstanbul", "Kadıköy", "SYNTHETIC TEST - no shipment", null, true)));
        // Personalised and normal colour SKU lines share the actual stock source but stay distinct.
        var request = new PlaceOrder(address.Id, [new(Product, Variant, 1, design.Id, revision.Id, revision.Revision), new(Product, Variant, 1)], "acceptance-demo-order");
        var order = await Read<CustomerOrder>(await customer.PostAsJsonAsync("/api/v1/me/orders", request));
        Assert.Equal(2, order.Lines.Length); Assert.Null(order.Lines[1].Personalization); Assert.Equal(revision.Revision, order.Lines[0].Personalization!.ConfigurationRevision);
        var duplicate = await Read<CustomerOrder>(await customer.PostAsJsonAsync("/api/v1/me/orders", request)); Assert.Equal(order.Id, duplicate.Id); Assert.Single(await accounts.Orders(owner.Id));
        using (var changed = await customer.PostAsJsonAsync("/api/v1/me/orders", request with { Items = [new(Product, Variant, 2, design.Id, revision.Id, revision.Revision)] })) Assert.Equal(HttpStatusCode.Conflict, changed.StatusCode);
        await Source(staff, Image(31, 43));
        using (var unavailable = await customer.PostAsJsonAsync("/api/v1/me/orders", request with { ClientRequestId = "unapproved-source" }))
        {
            Assert.Equal(HttpStatusCode.NotFound, unavailable.StatusCode);
            Assert.Contains("surface_not_available", await unavailable.Content.ReadAsStringAsync());
        }
        // Once the replacement is approved, the old binding must still require explicit repositioning.
        detail = (await staff.GetFromJsonAsync<SingleSourceMaskDetail>(MaskRoute))!;
        detail = await Read<SingleSourceMaskDetail>(await staff.PostAsJsonAsync(MaskRoute + "/mask", Upload(Image(31, 43, true))));
        await Read<SingleSourceMaskDetail>(await staff.PostAsJsonAsync(MaskRoute + "/approval", new SingleSourceMaskAction(detail.Source!.Sha256, detail.SourceRevision, detail.ProfileRevision, detail.Draft!.Id)));
        using (var stale = await customer.PostAsJsonAsync("/api/v1/me/orders", request with { ClientRequestId = "stale-source" })) Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        foreach (var (kind, expected) in new[] { ("pattern", pattern), ("source", photo), ("composition", composition) })
        {
            var download = $"/api/v1/admin/orders/{order.Id}/lines/0/{kind}";
            using var result = await staff.GetAsync(download); Assert.Equal(HttpStatusCode.OK, result.StatusCode); Assert.Equal(expected, await result.Content.ReadAsByteArrayAsync());
            Assert.Equal("sha256", result.Headers.GetValues("X-Xinobi-File-Check").Single());
            using var denied = await customer.GetAsync(download); Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
            using var unauthenticated = await anonymous.GetAsync(download); Assert.Equal(HttpStatusCode.Unauthorized, unauthenticated.StatusCode);
        }
        Assert.Equal(baseline, JsonSerializer.Serialize(await catalog.Read()));
        Assert.Single(await accounts.Orders(owner.Id));
    }
}
