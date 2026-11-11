using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class SingleSourceMaskTests
{
    private const string Root = "/api/v1/local-commerce/surfaces/products";
    private const string Product = "DEMO-P101";
    private const string Item = Root + "/" + Product;
    private static WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"] = "true" })));
    private static byte[] Image(int w, int h, bool mask = false)
    {
        using var bitmap = new SKBitmap(w, h); bitmap.Erase(mask ? SKColors.Transparent : SKColors.Gray);
        if (mask) { using var canvas = new SKCanvas(bitmap); using var paint = new SKPaint { Color = SKColors.White }; canvas.DrawRect(w / 4, 0, w / 2, h, paint); }
        if (mask) { using var pixels = bitmap.PeekPixels(); using var encoded = pixels.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless, 100)); return encoded!.ToArray(); }
        using var image = SKImage.FromBitmap(bitmap); using var png = image.Encode(SKEncodedImageFormat.Png, 100); return png.ToArray();
    }
    private static async Task<SingleSourceMaskDetail> Ok(HttpResponseMessage response)
    { Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync()); return (await response.Content.ReadFromJsonAsync<SingleSourceMaskDetail>())!; }
    private static SingleSourceMaskAction Action(SingleSourceMaskDetail detail) => new(detail.Source!.Sha256, detail.SourceRevision, detail.ProfileRevision, detail.Draft?.Id);
    private static SingleSourceMaskUpload Upload(SingleSourceMaskDetail detail, byte[] bytes) => new(detail.Source!.Image, detail.Source.Sha256, detail.SourceRevision, detail.ProfileRevision, Convert.ToBase64String(bytes), "alpha");
    private static async Task<SingleSourceMaskDetail> Source(WebApplicationFactory<Program> factory, HttpClient client, int w = 113, int h = 67)
    {
        var store = factory.Services.GetRequiredService<PersonalizationSourceStore>(); var current = await store.Get(Product);
        var key = Guid.NewGuid().ToString("N") + ".png"; var bytes = Image(w, h);
        await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Media, key, new MemoryStream(bytes), "image/png");
        var path = "/api/v1/local-commerce/media/" + key; var candidate = await store.Candidate(Product, path);
        await store.Save(Product, new(path, candidate.Sha256, current.Revision));
        return await Ok(await client.GetAsync(Item));
    }
    private static async Task<HttpResponseMessage> Delete(HttpClient client, string path, SingleSourceMaskAction request) =>
        await client.SendAsync(new HttpRequestMessage(HttpMethod.Delete, path) { Content = JsonContent.Create(request) });

    [Fact]
    public async Task ProductListOffersCataloguePhotosWithoutCreatingProfile()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory);
        var list = (await client.GetFromJsonAsync<SingleSourceMaskDetail[]>(Root))!;
        Assert.Equal(list.Length, list.Select(x => x.ProductId).Distinct().Count());
        var item = Assert.Single(list, x => x.ProductId == Product); Assert.NotNull(item.CatalogPhotos); Assert.Equal("none", item.Status);
        Assert.Equal(0,item.ProfileRevision);Assert.Equal("none",(await factory.Services.GetRequiredService<PersonalizationSourceStore>().Get(Product)).Status);
        var response = await client.PostAsJsonAsync(Item + "/mask", new SingleSourceMaskUpload("", "", 0, 0, "", "alpha"));
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task UploadApproveDownloadRevokeRetainsHistoryWithoutChangingVariantOrOrderFiles()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory);
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>(); var baseline = JsonSerializer.Serialize(await catalog.Read());
        var files = factory.Services.GetRequiredService<IFileStore>(); await files.Save(FileAreas.Designs, "order-sentinel", new MemoryStream([1,2,3]), "image/png");
        var source = await Source(factory, client, 7001, 5);
        var draft = await Ok(await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(7001, 5, true))));
        Assert.Equal("draft", draft.Status); Assert.NotNull(draft.Draft); Assert.Null(draft.Approved);
        var webp = await client.GetByteArrayAsync(Item + $"/draft.webp?sourceRevision={draft.SourceRevision}&maskId={draft.Draft.Id}");
        using var codec = SKCodec.Create(SKData.CreateCopy(webp)); Assert.Equal(SKEncodedImageFormat.Webp, codec.EncodedFormat); Assert.Equal(7001, codec.Info.Width); Assert.Equal(5, codec.Info.Height);
        var approved = await Ok(await client.PostAsJsonAsync(Item + "/approval", Action(draft))); Assert.Equal("approved", approved.Status); Assert.Null(approved.Draft);
        var current = await factory.Services.GetRequiredService<PersonalizationSourceStore>().Get(Product); Assert.Equal("approved", current.SurfaceStatus); Assert.Equal(1, current.SourceRevision);
        var originalMask = await client.GetByteArrayAsync(approved.Approved!.Image);
        var revoked = await Ok(await Delete(client, Item + "/approval", Action(approved))); Assert.Null(revoked.Approved);
        Assert.Equal(originalMask, await client.GetByteArrayAsync(approved.Approved.Image));
        Assert.Equal(baseline, JsonSerializer.Serialize(await catalog.Read()));
        await using var sentinel = (await files.Open(FileAreas.Designs, "order-sentinel"))!; using var buffer = new MemoryStream(); await sentinel.Content.CopyToAsync(buffer); Assert.Equal(new byte[] {1,2,3}, buffer.ToArray());
    }

    [Fact]
    public async Task SourceChangeInvalidatesOldMaskActionsAndPreservesOldAssets()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory);
        var source = await Source(factory, client); var draft = await Ok(await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true))));
        var approved = await Ok(await client.PostAsJsonAsync(Item + "/approval", Action(draft))); var previous = await client.GetByteArrayAsync(approved.Approved!.Image);
        var changed = await Source(factory, client, 71, 93); Assert.Equal("stale", changed.Status); Assert.Null(changed.Approved);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(Item + "/approval", Action(draft))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.GetAsync(Item + $"/draft.webp?sourceRevision={draft.SourceRevision}&maskId={draft.Draft!.Id}")).StatusCode);
        Assert.Equal(previous, await client.GetByteArrayAsync(approved.Approved.Image));
        var fresh = await Ok(await client.PostAsJsonAsync(Item + "/mask", Upload(changed, Image(71, 93, true)))); Assert.Equal("draft", fresh.Status);
        var cleared = await Ok(await Delete(client, Item + "/draft", Action(fresh))); Assert.Null(cleared.Draft);
    }

    [Fact]
    public async Task WrongDimensionsFormatHashAndStaleRevisionCannotOverwriteDraft()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory);
        var source = await Source(factory, client);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(112, 67, true)))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67)))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true)) with { SourceSha256 = new string('0',64) })).StatusCode);
        var draft = await Ok(await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true))));
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true)))).StatusCode);
        Assert.Equal(draft.Draft!.Id, (await Ok(await client.GetAsync(Item))).Draft!.Id);
    }

    [Fact]
    public async Task ExistingMediaMaskIsReadableOnlyThroughStaffAliasWithoutRewritingHistory()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory); using var anonymous = factory.CreateClient();
        var source = await Source(factory, client); var draft = await Ok(await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true))));
        var original = await client.GetByteArrayAsync(draft.Draft!.Image);
        await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Media, draft.Draft.Id + ".png", new MemoryStream(original), "image/png");
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>();
        var path = Path.Combine(catalog.DataDirectory, "personalization/personalization-profiles.json");
        var json = System.Text.Json.Nodes.JsonNode.Parse(await File.ReadAllTextAsync(path))!;
        var mask = json["profiles"]![Product]!["masks"]![0]!.AsObject(); mask.Remove("storageArea"); mask["image"] = "/api/v1/local-commerce/media/" + draft.Draft.Id + ".png";
        var legacy = json.ToJsonString(); await File.WriteAllTextAsync(path, legacy);
        var read = await Ok(await client.GetAsync(Item)); Assert.StartsWith(Item + "/masks/", read.Draft!.Image);
        Assert.Equal(original, await client.GetByteArrayAsync(read.Draft.Image));
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync(read.Draft.Image)).StatusCode);
        Assert.Equal(legacy, await File.ReadAllTextAsync(path));
    }

    [Fact]
    public async Task CorruptMaskIsAnErrorAndAnonymousCannotReadWorkspace()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory); using var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync(Root)).StatusCode);
        var source = await Source(factory, client); var draft = await Ok(await client.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true))));
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync(draft.Draft!.Image)).StatusCode);
        await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Designs, "surface-mask-" + draft.Draft.Id + ".png", new MemoryStream([1,2,3]), "image/png");
        var unavailable = await Ok(await client.GetAsync(Item));
        Assert.Equal("unavailable", unavailable.Status); Assert.Null(unavailable.Draft);
        Assert.Equal("mask_corrupt", Assert.Single(unavailable.MaskIssues!).Code);
        Assert.Contains((await client.GetFromJsonAsync<SingleSourceMaskDetail[]>(Root))!, x => x.ProductId == Product);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.PostAsJsonAsync(Item + "/approval", Action(draft))).StatusCode);
    }

    [Fact]
    public async Task MissingApprovedMaskDoesNotHideOtherProductsAndCanBeReplacedWithoutChangingHistory()
    {
        using var factory = Factory(); using var staff = await TestStaff.Client(factory); using var visitor = factory.CreateClient();
        var source = await Source(factory, staff);
        var draft = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113,67,true))));
        var approved = await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(draft)));
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>(); var before = JsonSerializer.Serialize(await catalog.Read());
        var profilePath = Path.Combine(catalog.DataDirectory, "personalization/personalization-profiles.json");
        var history = await File.ReadAllTextAsync(profilePath);
        await factory.Services.GetRequiredService<IFileStore>().Delete(FileAreas.Designs, "surface-mask-" + approved.Approved!.Id + ".png");
        var list = (await staff.GetFromJsonAsync<SingleSourceMaskDetail[]>(Root))!;
        Assert.True(list.Length > 1); Assert.Contains(list, x => x.ProductId != Product);
        var broken = Assert.Single(list, x => x.ProductId == Product);
        Assert.Equal("unavailable", broken.Status); Assert.Equal("ready", broken.SourceStatus); Assert.Null(broken.Approved);
        Assert.Equal("mask_missing", Assert.Single(broken.MaskIssues!).Code);
        Assert.Equal(history, await File.ReadAllTextAsync(profilePath));
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(Public)).StatusCode);
        var replacement = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(broken, Image(113,67,true))));
        Assert.NotNull(replacement.Draft); Assert.Equal("unavailable", replacement.Status);
        var repaired = await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(replacement)));
        Assert.Equal("approved", repaired.Status); Assert.Null(repaired.MaskIssues);
        Assert.Equal(HttpStatusCode.OK, (await visitor.GetAsync(Public)).StatusCode);
        Assert.Equal(before, JsonSerializer.Serialize(await catalog.Read()));
        Assert.Contains(approved.Approved.Id, await File.ReadAllTextAsync(profilePath));
    }

    private const string Public = "/api/v1/product-surfaces/" + Product + "/rendering-inputs";

    [Theory]
    [InlineData(113, 67)]
    [InlineData(67, 113)]
    [InlineData(71, 71)]
    public async Task OnlyApprovedSingleSourcePublishesOriginalDimensionsAndExactBytes(int width, int height)
    {
        using var factory = Factory(); using var staff = await TestStaff.Client(factory); using var visitor = factory.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(Public)).StatusCode);
        var source = await Source(factory, staff, width, height);
        var draft = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(source, Image(width, height, true))));
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(Public)).StatusCode);
        var approved = await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(draft)));
        var response = await visitor.GetAsync(Public); response.EnsureSuccessStatusCode();
        Assert.Equal("no-store", response.Headers.CacheControl!.ToString());
        var bundle = (await response.Content.ReadFromJsonAsync<SingleSourcePublication>())!;
        Assert.Equal("single-source-preview", bundle.Scope); Assert.Equal(Product, bundle.ProductReference);
        Assert.Equal((width,height), (bundle.Inputs.Width,bundle.Inputs.Height));
        Assert.Equal(approved.SourceRevision, bundle.SourceRevision);
        Assert.Equal(approved.Source!.Sha256, bundle.Inputs.SourceMediaVersion);
        Assert.Equal(approved.Approved!.Sha256, bundle.Inputs.SurfaceVersion);
        Assert.Equal(await staff.GetByteArrayAsync(approved.Source.Image), await visitor.GetByteArrayAsync(bundle.Inputs.Source.Url));
        Assert.Equal(await staff.GetByteArrayAsync(approved.Approved.Image), await visitor.GetByteArrayAsync(bundle.Inputs.Mask.Url));
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(bundle.Inputs.Mask.Url.Replace("v=", "v=0"))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(bundle.Inputs.Mask.Url.Replace(Product, "other-product"))).StatusCode);
        // A newer draft never replaces the approved publication before explicit approval.
        await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(approved, Image(width, height, true))));
        Assert.Equal(bundle.SurfaceId, (await visitor.GetFromJsonAsync<SingleSourcePublication>(Public))!.SurfaceId);
    }

    [Fact]
    public async Task RevokedOrStaleMediaIsNotPublicButHistoricalStaffFilesRemainUnchanged()
    {
        using var factory = Factory(); using var staff = await TestStaff.Client(factory); using var visitor = factory.CreateClient();
        var source = await Source(factory, staff);
        var draft = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113, 67, true))));
        var approved = await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(draft)));
        var bundle = (await visitor.GetFromJsonAsync<SingleSourcePublication>(Public))!;
        var bytes = await staff.GetByteArrayAsync(approved.Approved!.Image);
        var revoked = await Ok(await Delete(staff, Item + "/approval", Action(approved)));
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(Public)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(bundle.Inputs.Mask.Url)).StatusCode);
        Assert.Equal(bytes, await staff.GetByteArrayAsync(approved.Approved.Image));
        var again = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(revoked, Image(113,67,true))));
        await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(again)));
        bundle = (await visitor.GetFromJsonAsync<SingleSourcePublication>(Public))!;
        await Source(factory, staff, 71,93);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(Public)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync(bundle.Inputs.Source.Url)).StatusCode);
        Assert.Equal(bytes, await staff.GetByteArrayAsync(approved.Approved.Image));
    }

    [Fact]
    public async Task InactiveProductOrCorruptApprovedAssetsCannotPublishOrFallBackToVariant()
    {
        using var factory = Factory(); using var staff = await TestStaff.Client(factory); using var visitor = factory.CreateClient();
        var source = await Source(factory, staff);
        var draft = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(source, Image(113,67,true))));
        var approved = await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(draft)));
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>();
        foreach (var enabled in new[] { false, true })
        {
            await catalog.Update(state => state with { Products = [..state.Products.Select(p => p.Id == Product ? p with { Active = enabled } : p)] });
            Assert.Equal(enabled ? HttpStatusCode.OK : HttpStatusCode.NotFound, (await visitor.GetAsync(Public)).StatusCode);
        }
        await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Designs, "surface-mask-" + approved.Approved!.Id + ".png", new MemoryStream([1,2,3]), "image/png");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await visitor.GetAsync(Public)).StatusCode);
    }

    [Fact]
    public async Task MemoryBudgetIsExplicitAndDoesNotResizeOrReplaceSource()
    {
        using var factory = Factory().WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string,string?> { ["ProductSurfaces:MaskProcessingMemoryMiB"] = "16" })));
        using var staff = await TestStaff.Client(factory);
        var source = await Source(factory, staff, 1100,1100);
        var response = await staff.PostAsJsonAsync(Item + "/mask", Upload(source, Image(1100,1100,true)));
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        Assert.Contains("mask_processing_capacity", await response.Content.ReadAsStringAsync());
        Assert.Equal(source.Source, (await Ok(await staff.GetAsync(Item))).Source);
    }

    [Fact]
    public async Task SourceLargerThanOldTwentyMegapixelLimitKeepsItsActualCanvas()
    {
        using var factory = Factory(); using var staff = await TestStaff.Client(factory);
        var source = await Source(factory, staff, 5001,4000);
        var draft = await Ok(await staff.PostAsJsonAsync(Item + "/mask", Upload(source, Image(5001,4000,true))));
        await Ok(await staff.PostAsJsonAsync(Item + "/approval", Action(draft)));
        using var visitor = factory.CreateClient();
        var bundle = (await visitor.GetFromJsonAsync<SingleSourcePublication>(Public))!;
        Assert.Equal((5001,4000), (bundle.Inputs.Width,bundle.Inputs.Height));
    }
}
