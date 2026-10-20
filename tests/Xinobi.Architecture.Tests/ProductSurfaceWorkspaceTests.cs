using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using SkiaSharp;
using Xinobi.Api.Catalog;
using Xinobi.Api.Features.ProductSurfaces.Catalog;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

/// <summary>
/// Admin surface masking for every variant (/api/v1/local-commerce/surfaces): WebP uploads only, no inference.
/// Seed variant DEMO-V101-B uses the real 1066×1600 Tea Maker photo.
/// </summary>
public sealed class ProductSurfaceWorkspaceTests : IDisposable
{
    private const string Root = "/api/v1/local-commerce/surfaces";
    private const string Tea = Root + "/DEMO-P101/DEMO-V101-B";
    private readonly string data = Path.Combine(Path.GetTempPath(), "xinobi-surfaces-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory(bool experimental = true) => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ProductSurfaces:ExperimentalCatalogWorkspace:Enabled", experimental.ToString());
        builder.UseSetting("LocalCommerce:DataDirectory", data);
        builder.UseSetting("DesignStudio:WorkerEnabled", "false");
        // Local settings are loaded after UseSetting; override them last so local flags cannot enter this fixture.
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"] = experimental.ToString()
        }));
    });

    [Fact]
    public async Task DisabledExperimentalWorkspaceDoesNotExposeMaskingEndpoints()
    {
        using var factory = Factory(experimental: false);
        using var client = factory.CreateClient();
        var response = await client.GetAsync(Root);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task<SurfaceDetail> Ok(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<SurfaceDetail>())!;
    }

    [Fact]
    public async Task SurfaceListIncludesOnlyExplicitlyPersonalizableProducts()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.First(p => p.Id == "DEMO-P101");
        foreach (bool? enabled in new bool?[] { true, false, null })
        {
            (await client.PutAsJsonAsync("/api/v1/local-commerce/products/" + product.Id, product with { Personalizable = enabled })).EnsureSuccessStatusCode();
            var items = (await client.GetFromJsonAsync<SurfaceSummary[]>(Root))!;
            Assert.Equal(enabled == true, items.Any(item => item.ProductId == product.Id));
            var current = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
            Assert.All(items, item => Assert.True(current.Products.Single(p => p.Id == item.ProductId).Personalizable == true));
        }
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    private static (int Inside, int Total) Coverage(byte[] png)
    {
        using var bitmap = SKBitmap.Decode(png);
        var inside = bitmap.Pixels.Count(pixel => pixel.Alpha == 255);
        return (inside, bitmap.Pixels.Length);
    }

    /// <summary>A same-sized WebP whose white rectangle is the designable area.</summary>
    private static byte[] Mask(bool transparent = true, int width = 1066)
    {
        using var bitmap = new SKBitmap(width, 1600);
        bitmap.Erase(transparent ? SKColors.Transparent : SKColors.Black);
        using var canvas = new SKCanvas(bitmap);
        using var paint = new SKPaint { Color = SKColors.White };
        canvas.DrawRect(100, 500, 500, 600, paint);
        using var pixels = bitmap.PeekPixels();
        using var png = pixels.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless, 100))!;
        return png.ToArray();
    }

    private static async Task<SurfaceDetail> Draft(HttpClient client, string path = Tea)
    {
        var source = await Ok(await client.GetAsync(path));
        return await Ok(await client.PostAsJsonAsync(path + "/mask", new SurfaceWebpRequest(source.Image, source.SourceSha256, Convert.ToBase64String(Mask()), "alpha")));
    }

    [Fact]
    public async Task WebpDraftIsApprovedAndReachesTheCatalogue()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.Single(p => p.Id == "DEMO-P101");
        (await client.PutAsJsonAsync("/api/v1/local-commerce/products/" + product.Id, product with { Personalizable = true })).EnsureSuccessStatusCode();
        var list = await client.GetFromJsonAsync<JsonElement>(Root);
        Assert.Contains(list.EnumerateArray(), item => item.GetProperty("variantId").GetString() == "DEMO-V101-B" && item.GetProperty("status").GetString() == "none");
        var drafted = await Draft(client);
        Assert.Equal("draft", drafted.Status);
        Assert.Equal((1066, 1600), (drafted.Width, drafted.Height));
        Assert.Equal(500 * 600, Coverage(await client.GetByteArrayAsync(Tea + "/draft.png")).Inside);

        var approved = await Ok(await client.PostAsync(Tea + "/approval", null));
        Assert.Equal("approved", approved.Status);
        Assert.Null(approved.Draft);
        Assert.StartsWith("/api/v1/local-commerce/media/", approved.ApprovedMask);
        var detail = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P101"))!;
        Assert.Equal("http://localhost" + approved.ApprovedMask, detail.Variants.Single(v => v.Id == "DEMO-V101-B").SurfaceMaskUrl);
        Assert.Null(detail.Variants.Single(v => v.Id == "DEMO-V101-R").SurfaceMaskUrl);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(approved.ApprovedMask)).StatusCode);
        Assert.Equal("none", (await Ok(await client.DeleteAsync(Tea + "/approval"))).Status);
    }

    [Theory]
    [InlineData("segment")]
    [InlineData("strokes")]
    [InlineData("curves")]
    public async Task RetiredMaskingToolsAreNotMapped(string tool)
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(Tea + "/" + tool, new { })).StatusCode);
    }

    [Fact]
    public async Task ANewPhotoRetiresTheMaskAndSavesCannotForgeOne()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        await Draft(client);
        var approved = await Ok(await client.PostAsync(Tea + "/approval", null));

        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var tea = state.Products.Single(product => product.Id == "DEMO-P101");
        // An admin save keeps the stored mask even if the client sends something else.
        var forged = tea with { Variants = [.. tea.Variants.Select(v => v with { SurfaceMask = "/api/v1/local-commerce/media/" + new string('a', 32) + ".png", SurfaceImage = v.Image })] };
        (await client.PutAsJsonAsync("/api/v1/local-commerce/products/DEMO-P101", forged)).EnsureSuccessStatusCode();
        var detail = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P101"))!;
        Assert.EndsWith(approved.ApprovedMask!, detail.Variants.Single(v => v.Id == "DEMO-V101-B").SurfaceMaskUrl);
        Assert.All(detail.Variants.Where(v => v.Id != "DEMO-V101-B"), v => Assert.Null(v.SurfaceMaskUrl));

        // A different photo: the mask no longer applies and the workspace marks it stale.
        state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        tea = state.Products.Single(product => product.Id == "DEMO-P101");
        var changed = tea with { Variants = [.. tea.Variants.Select(v => v.Id == "DEMO-V101-B" ? v with { Image = "/assets/products/tea-maker-101-red.webp" } : v)] };
        (await client.PutAsJsonAsync("/api/v1/local-commerce/products/DEMO-P101", changed)).EnsureSuccessStatusCode();
        detail = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P101"))!;
        Assert.Null(detail.Variants.Single(v => v.Id == "DEMO-V101-B").SurfaceMaskUrl);
        Assert.Equal("stale", (await Ok(await client.GetAsync(Tea))).Status);

        Assert.Equal("none", (await Ok(await client.DeleteAsync(Tea + "/approval"))).Status);
        Assert.Equal("variant_not_found", await Code(await client.GetAsync(Root + "/DEMO-P101/missing")));
    }

    [Fact]
    public async Task OneApprovalSharesTheWebpMaskWithSamePlacementColors()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        // Same model and placement: use the source photograph for a second test colour.
        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.Single(p => p.Id == "DEMO-P101");
        var reference = product.Variants.Single(v => v.Id == "DEMO-V101-B");
        var redId = "DEMO-V101-R";
        (await client.PutAsJsonAsync("/api/v1/local-commerce/products/DEMO-P101", product with
        { Variants = [.. product.Variants.Select(v => v.Id == redId ? v with { Image = reference.Image } : v)] })).EnsureSuccessStatusCode();
        var refined = await Draft(client);
        var colors = refined.Colors.Where(c => c.VariantId == reference.Id || c.VariantId == redId).ToArray();
        var approval = await Ok(await client.PostAsJsonAsync(Tea + "/approval/colors", new SurfaceApprovalRequest(colors, true, refined.Draft!.UpdatedAt)));
        var detail = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P101"))!;
        Assert.All(detail.Variants.Where(v => colors.Any(c => c.VariantId == v.Id)), v => Assert.EndsWith(approval.ApprovedMask!, v.SurfaceMaskUrl));
        using var visitor = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        Assert.Equal(HttpStatusCode.Unauthorized, (await visitor.GetAsync(Tea)).StatusCode);
        foreach (var color in colors)
        {
            var bundle = await visitor.GetFromJsonAsync<JsonElement>($"/api/v1/dev/product-surfaces/commerce-mask/DEMO-P101/{color.VariantId}/rendering-inputs");
            Assert.Equal(color.VariantId, bundle.GetProperty("variantReference").GetString());
            Assert.True(bundle.GetProperty("previewAvailable").GetBoolean());
            var input = bundle.GetProperty("inputs");
            Assert.StartsWith(approval.ApprovedMask!, input.GetProperty("mask").GetProperty("url").GetString());
            Assert.Equal(1066, input.GetProperty("width").GetInt32());
        }
    }

    [Fact]
    public async Task UnconfirmedOrMismatchedColorApprovalIsRejectedWithoutPartialUpdate()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        var manual = await Draft(client);
        Assert.Equal("draft_changed", await Code(await client.PostAsJsonAsync(Tea + "/approval/colors", new SurfaceApprovalRequest(manual.Colors.Where(c => c.VariantId == "DEMO-V101-B").ToArray(), true, manual.Draft!.UpdatedAt.AddSeconds(-1)))));
        var colors = manual.Colors.Where(c => c.VariantId == "DEMO-V101-B").ToArray();
        Assert.Equal("same_placement_required", await Code(await client.PostAsJsonAsync(Tea + "/approval/colors", new SurfaceApprovalRequest(colors, false, manual.Draft.UpdatedAt))));
        Assert.Equal("color_dimensions_mismatch", await Code(await client.PostAsJsonAsync(Tea + "/approval/colors", new SurfaceApprovalRequest([colors[0] with { Width = 1 }], true, manual.Draft.UpdatedAt))));
        Assert.Equal("image_changed", await Code(await client.PostAsJsonAsync(Tea + "/approval/colors", new SurfaceApprovalRequest([colors[0] with { Image = "/changed.png" }], true, manual.Draft.UpdatedAt))));
        var unchanged = await Ok(await client.GetAsync(Tea));
        Assert.Null(unchanged.ApprovedMask);
        Assert.NotNull(unchanged.Draft);
    }

    [Fact]
    public async Task WebpImportSupportsAlphaAndBlackWhiteAndRejectsBadSizeWithoutChangingDraft()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        var source = await Ok(await client.GetAsync(Tea));
        async Task<HttpResponseMessage> Import(byte[] png, string mode) => await client.PostAsJsonAsync(Tea + "/mask", new SurfaceWebpRequest(source.Image, source.SourceSha256, Convert.ToBase64String(png), mode));
        var alpha = await Ok(await Import(Mask(), "alpha"));
        var expected = await client.GetByteArrayAsync(Tea + "/draft.png");
        Assert.Equal("webp-alpha", alpha.Draft!.Method);
        await Ok(await Import(Mask(transparent: false), "luminance"));
        Assert.Equal(Coverage(expected), Coverage(await client.GetByteArrayAsync(Tea + "/draft.png")));
        var before = await client.GetByteArrayAsync(Tea + "/draft.png");
        Assert.Equal("mask_dimensions_mismatch", await Code(await Import(Mask(width: 500), "alpha")));
        Assert.Equal("mask_empty_or_full", await Code(await Import(Mask(transparent: false), "alpha")));
        Assert.Equal("invalid_mask_webp", await Code(await Import([1, 2, 3], "alpha")));
        var missing = await client.PostAsJsonAsync(Tea + "/mask", new { image = source.Image, sourceSha256 = source.SourceSha256, mode = "alpha" });
        Assert.Equal(HttpStatusCode.BadRequest, missing.StatusCode);
        Assert.Contains("verisi eksik", await missing.Content.ReadAsStringAsync());
        using var pngBitmap = SKBitmap.Decode(Mask());
        using var pngData = pngBitmap.Encode(SKEncodedImageFormat.Png, 100);
        Assert.Equal("invalid_mask_webp", await Code(await Import(pngData.ToArray(), "alpha")));
        Assert.Equal("invalid_mask_webp", await Code(await Import(pngData.ToArray(), "luminance")));
        using var jpegData = pngBitmap.Encode(SKEncodedImageFormat.Jpeg, 100);
        Assert.Equal("invalid_mask_webp", await Code(await Import(jpegData.ToArray(), "luminance")));
        using var exported = await client.GetAsync(Tea + "/draft.webp");
        Assert.Equal("image/webp", exported.Content.Headers.ContentType!.MediaType);
        var exportedBytes = await exported.Content.ReadAsByteArrayAsync();
        Assert.Equal(Coverage(before), Coverage(exportedBytes));
        using var storedBitmap = SKBitmap.Decode(before);
        using var exportedBitmap = SKBitmap.Decode(exportedBytes);
        Assert.Equal(storedBitmap.Width, exportedBitmap.Width);
        Assert.Equal(storedBitmap.Height, exportedBitmap.Height);
        Assert.Equal(storedBitmap.Pixels.Select(pixel => pixel.Alpha), exportedBitmap.Pixels.Select(pixel => pixel.Alpha));
        Assert.Equal("WEBP", System.Text.Encoding.ASCII.GetString(exportedBytes, 8, 4));
        Assert.Equal(before, await client.GetByteArrayAsync(Tea + "/draft.png"));
    }

    public void Dispose()
    {
        if (Directory.Exists(data)) Directory.Delete(data, recursive: true);
    }
}
