using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Features.ProductSurfaces.Catalog;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class ProductSurfaceWorkspaceTests
{
    private const string Root = "/api/v1/local-commerce/surfaces";
    private const string Tea = Root + "/DEMO-P101/DEMO-V101-B";
    private static WebApplicationFactory<Program> Factory(bool enabled = true) => new IsolatedApiFactory().WithWebHostBuilder(builder =>
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        { ["ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"] = enabled.ToString() })));

    [Fact]
    public async Task DisabledExperimentalWorkspaceDoesNotExposeMaskingEndpoints()
    {
        using var factory = Factory(false); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Root)).StatusCode);
    }

    [Fact]
    public async Task LegacyReadsRetainExactVariantIdentityWithoutChangingCatalog()
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory); using var visitor = factory.CreateClient();
        var store = factory.Services.GetRequiredService<LocalCommerceStore>(); var before = JsonSerializer.Serialize(await store.Read());
        var detail = (await client.GetFromJsonAsync<SurfaceDetail>(Tea))!;
        Assert.Equal("DEMO-V101-B", detail.VariantId); Assert.Equal("none", detail.Status);
        Assert.Equal(HttpStatusCode.Unauthorized, (await visitor.GetAsync(Tea)).StatusCode);
        var published = await visitor.GetFromJsonAsync<JsonElement>("/api/v1/dev/product-surfaces/commerce-mask/DEMO-P101/DEMO-V101-B/rendering-inputs");
        Assert.False(published.GetProperty("previewAvailable").GetBoolean());
        Assert.Equal(before, JsonSerializer.Serialize(await store.Read()));
    }

    [Theory]
    [InlineData("POST", "mask")]
    [InlineData("POST", "approval")]
    [InlineData("POST", "approval/colors")]
    [InlineData("DELETE", "approval")]
    [InlineData("DELETE", "draft")]
    public async Task LegacyWritesAreGoneWithoutReadingPayloadOrMutatingData(string method, string suffix)
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory);
        var store = factory.Services.GetRequiredService<LocalCommerceStore>(); var before = JsonSerializer.Serialize(await store.Read());
        var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), Tea + "/" + suffix)
        { Content = JsonContent.Create(new { samePlacementConfirmed = true, colors = new[] { "DEMO-V101-B", "DEMO-V101-R" } }) });
        Assert.Equal(HttpStatusCode.Gone, response.StatusCode);
        Assert.Contains("variant_surface_retired", await response.Content.ReadAsStringAsync());
        Assert.Equal(before, JsonSerializer.Serialize(await store.Read()));
    }

    [Theory]
    [InlineData("segment")]
    [InlineData("strokes")]
    [InlineData("curves")]
    public async Task RetiredMaskingToolsAreNotMapped(string tool)
    {
        using var factory = Factory(); using var client = await TestStaff.Client(factory);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(Tea + "/" + tool, new { })).StatusCode);
    }
}
