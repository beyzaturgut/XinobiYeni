using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using SkiaSharp;
using Xinobi.Api.Catalog;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Features.ProductSurfaces.Catalog;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

/// <summary>
/// Admin surface masking for every variant (/api/v1/local-commerce/surfaces). Roboflow is replaced by a recording handler:
/// no network call is made. Seed variant DEMO-V101-B uses the real 1066×1600 Tea Maker photo.
/// </summary>
public sealed class ProductSurfaceWorkspaceTests : IDisposable
{
    private const string Root = "/api/v1/local-commerce/surfaces";
    private const string Tea = Root + "/DEMO-P101/DEMO-V101-B";
    private readonly string data = Path.Combine(Path.GetTempPath(), "xinobi-surfaces-" + Guid.NewGuid());
    private readonly FakeRoboflow roboflow = new();

    private WebApplicationFactory<Program> Factory(string? key = "test-key", int limit = 50) => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("LocalCommerce:DataDirectory", data);
        builder.UseSetting("DesignStudio:WorkerEnabled", "false");
        // Explicit values override the developer's user-secrets, so a real key is never used here.
        builder.UseSetting("ProductSurfaces:Roboflow:ApiKey", key ?? "");
        builder.UseSetting("ProductSurfaces:Roboflow:DailyLimit", limit.ToString());
        builder.ConfigureServices(services => services.Configure<HttpClientFactoryOptions>("roboflow", options =>
            options.HttpMessageHandlerBuilderActions.Add(handler => handler.PrimaryHandler = roboflow)));
    });

    /// <summary>Answers SAM3 like Roboflow does: one RLE prediction covering a band of columns.</summary>
    private sealed class FakeRoboflow : HttpMessageHandler
    {
        public readonly List<(string Path, string? Auth, string Body)> Calls = [];
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Calls.Add((request.RequestUri!.AbsolutePath, request.Headers.Authorization?.ToString(), await request.Content!.ReadAsStringAsync(cancellationToken)));
            const int width = 1066, height = 1600;
            // Column-major runs: background, then columns 400–699 inside, then background.
            long before = 400L * height, inside = 300L * height, after = (long)width * height - before - inside;
            var prediction = new { format = "rle", confidence = 0.84, masks = new { size = new[] { height, width }, counts = new[] { before, inside, after } } };
            object body = request.RequestUri.AbsolutePath.EndsWith("concept_segment")
                ? new { prompt_results = new[] { new { prompt_index = 0, predictions = new[] { prediction } } } }
                : new { predictions = new[] { prediction } };
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json") };
        }
    }

    private static async Task<SurfaceDetail> Ok(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<SurfaceDetail>())!;
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

    private static readonly object[] Strokes = [new { operation = "add", radius = 20, points = new[] { new { x = 100, y = 100 }, new { x = 200, y = 200 } } }];
    private static readonly object Stroke = new { strokes = Strokes };

    [Fact]
    public async Task RoboflowDraftCanBeCorrectedApprovedAndReachesTheCatalogue()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        var list = (await client.GetFromJsonAsync<JsonElement>(Root));
        Assert.Contains(list.EnumerateArray(), item => item.GetProperty("variantId").GetString() == "DEMO-V101-B" && item.GetProperty("status").GetString() == "none");

        var drafted = await Ok(await client.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest("kettle body", null)));
        Assert.Equal("draft", drafted.Status);
        Assert.Equal((1066, 1600), (drafted.Width, drafted.Height));
        Assert.Equal("roboflow-text", drafted.Draft!.Method);
        var call = Assert.Single(roboflow.Calls);
        Assert.Equal("/sam3/concept_segment", call.Path);
        Assert.Equal("Bearer test-key", call.Auth);
        Assert.Contains("kettle body", call.Body);
        Assert.Equal(300 * 1600, Coverage(await client.GetByteArrayAsync(Tea + "/draft.png")).Inside);

        var painted = await Ok(await client.PostAsJsonAsync(Tea + "/strokes", Stroke));
        Assert.Equal("roboflow-text+brush", painted.Draft!.Method);
        Assert.True(Coverage(await client.GetByteArrayAsync(Tea + "/draft.png")).Inside > 300 * 1600, "The brush adds to the Roboflow mask.");

        var approved = await Ok(await client.PostAsync(Tea + "/approval", null));
        Assert.Equal("approved", approved.Status);
        Assert.Null(approved.Draft);
        Assert.StartsWith("/api/v1/local-commerce/media/", approved.ApprovedMask);
        var detail = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P101"))!;
        Assert.Equal("http://localhost" + approved.ApprovedMask, detail.Variants.Single(v => v.Id == "DEMO-V101-B").SurfaceMaskUrl);
        Assert.Null(detail.Variants.Single(v => v.Id == "DEMO-V101-R").SurfaceMaskUrl);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(approved.ApprovedMask)).StatusCode);
    }

    [Fact]
    public async Task PointsUseVisualSegmentAndTheBrushAloneCanDrawAMask()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        var pointed = await Ok(await client.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest(null, [new SurfacePoint(500, 800, true), new SurfacePoint(100, 100, false)])));
        Assert.Equal("roboflow-points", pointed.Draft!.Method);
        Assert.Equal("/sam3/visual_segment", roboflow.Calls.Single().Path);
        Assert.Equal("invalid_point", await Code(await client.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest(null, [new SurfacePoint(5000, 1, true)]))));

        var manual = await Ok(await client.PostAsJsonAsync(Tea + "/strokes", new { strokes = Strokes, @base = "empty" }));
        Assert.Equal("brush", manual.Draft!.Method);
        var (inside, _) = Coverage(await client.GetByteArrayAsync(Tea + "/draft.png"));
        Assert.InRange(inside, 1, 300 * 1600 - 1);
        Assert.Equal("none", (await Ok(await client.DeleteAsync(Tea + "/draft"))).Status);
    }

    [Fact]
    public async Task WithoutAKeyOnlyTheBrushWorksAndTheDailyLimitHolds()
    {
        using (var noKey = Factory(key: null))
        using (var client = await TestStaff.Client(noKey))
        {
            var refused = await client.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest("kettle body", null));
            Assert.Equal(HttpStatusCode.ServiceUnavailable, refused.StatusCode);
            Assert.Equal("provider_not_configured", await Code(refused));
            Assert.False((await Ok(await client.GetAsync(Tea))).Provider.Configured);
            Assert.Empty(roboflow.Calls);
        }
        using var limited = Factory(limit: 1);
        using var limitedClient = await TestStaff.Client(limited);
        await Ok(await limitedClient.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest("kettle body", null)));
        var second = await limitedClient.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest("kettle body", null));
        Assert.Equal(HttpStatusCode.TooManyRequests, second.StatusCode);
        Assert.Single(roboflow.Calls);
    }

    [Fact]
    public async Task ANewPhotoRetiresTheMaskAndSavesCannotForgeOne()
    {
        using var factory = Factory();
        using var client = await TestStaff.Client(factory);
        await Ok(await client.PostAsJsonAsync(Tea + "/segment", new SurfaceSegmentRequest("kettle body", null)));
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

    public void Dispose()
    {
        if (Directory.Exists(data)) Directory.Delete(data, recursive: true);
    }
}
