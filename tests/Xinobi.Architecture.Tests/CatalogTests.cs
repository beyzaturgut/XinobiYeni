using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Catalog;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

/// <summary>Public catalog/content contract (/api/v1/catalog, /api/v1/content) shared by web and mobile.</summary>
public sealed class CatalogTests : IDisposable
{
    private readonly string dataDirectory = Path.Combine(Path.GetTempPath(), "xinobi-catalog-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> CreateFactory(string environment = "Development") => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment(environment);
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = dataDirectory }));
    });

    [Fact]
    public async Task ProductionAnswersUnavailableInsteadOfServingDevelopmentData()
    {
        using var factory = CreateFactory("Production");
        using var client = factory.CreateClient();
        foreach (var route in new[] { "/api/v1/catalog/products", "/api/v1/catalog/categories", "/api/v1/catalog/products/DEMO-P101", "/api/v1/content/home", "/api/v1/content/announcements" })
        {
            var response = await client.GetAsync(route);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal("catalog_unavailable", problem.RootElement.GetProperty("code").GetString());
        }
    }

    [Fact]
    public async Task ProductListHidesInactiveProductsAndPaginates()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var all = (await client.GetFromJsonAsync<ProductPage>("/api/v1/catalog/products"))!;
        Assert.Equal(5, all.Total);
        Assert.DoesNotContain(all.Items, product => product.Id == "DEMO-P103");
        var second = (await client.GetFromJsonAsync<ProductPage>("/api/v1/catalog/products?page=2&pageSize=2"))!;
        Assert.Equal([all.Items[2].Id, all.Items[3].Id], second.Items.Select(product => product.Id));
        Assert.Equal(5, second.Total);
        foreach (var invalid in new[] { "?page=0", "?pageSize=0", "?pageSize=101", "?q=" + new string('a', 101) })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/v1/catalog/products" + invalid)).StatusCode);
    }

    [Fact]
    public async Task ProductListFiltersByCategorySearchAndPersonalization()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var coffee = (await client.GetFromJsonAsync<ProductPage>("/api/v1/catalog/products?category=" + Uri.EscapeDataString("KAHVE MAKİNELERİ")))!;
        Assert.Equal(["DEMO-P102", "DEMO-P104"], coffee.Items.Select(product => product.Id));
        var personalizable = (await client.GetFromJsonAsync<ProductPage>("/api/v1/catalog/products?personalizable=true"))!;
        Assert.Equal(["DEMO-P101", "DEMO-P102", "DEMO-P104"], personalizable.Items.Select(product => product.Id));
        var search = (await client.GetFromJsonAsync<ProductPage>("/api/v1/catalog/products?q=" + Uri.EscapeDataString("ÇAY")))!;
        Assert.Contains(search.Items, product => product.Id == "DEMO-P101");
    }

    [Fact]
    public async Task ProductDetailCarriesPriceAvailabilityAndAbsoluteImages()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var product = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P101"))!;
        var blue = product.Variants.Single(variant => variant.Id == "DEMO-V101-B");
        Assert.Equal(new Money(240000, "TRY"), blue.Price);
        Assert.Equal(AvailabilityStatuses.InStock, blue.Availability.Status);
        Assert.Null(blue.Availability.Remaining);
        Assert.True(blue.Purchasable);
        Assert.Equal(8, blue.MaxQuantity);
        Assert.StartsWith("http://localhost:3000/assets/", blue.ImageUrl);
        var unpriced = product.Variants.Single(variant => variant.Id == "DEMO-V101-S");
        Assert.Null(unpriced.Price);
        Assert.False(unpriced.Purchasable);
        Assert.Equal(0, unpriced.MaxQuantity);
        var coffee = (await client.GetFromJsonAsync<ProductDetail>("/api/v1/catalog/products/DEMO-P102"))!;
        Assert.Equal(new Availability(AvailabilityStatuses.LowStock, 4), coffee.Variants.Single(variant => variant.Id == "DEMO-V102-R").Availability);
        foreach (var missing in new[] { "unknown", "DEMO-P103" })
        {
            var response = await client.GetAsync("/api/v1/catalog/products/" + missing);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Contains("product_not_found", await response.Content.ReadAsStringAsync());
        }
    }

    [Fact]
    public async Task AdminChangesAppearInTheCatalogContract()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        (await client.PutAsJsonAsync("/api/v1/local-commerce/prices/DEMO-V101-S", new PriceUpdate(199900))).EnsureSuccessStatusCode();
        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var tea = state.Products.Single(product => product.Id == "DEMO-P101");
        (await client.PutAsJsonAsync("/api/v1/local-commerce/products/DEMO-P101", tea with { Personalizable = false })).EnsureSuccessStatusCode();
        var summary = (await client.GetFromJsonAsync<ProductPage>("/api/v1/catalog/products?category=" + Uri.EscapeDataString("Çay makineleri")))!.Items.Single();
        Assert.Equal(new Money(199900, "TRY"), summary.PriceFrom);
        Assert.False(summary.Personalizable);
    }

    [Fact]
    public async Task HomeContentAppliesHomepageRules()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var content = state.Content with
        {
            Slides = [.. state.Content.Slides.Select((slide, index) => slide with { Active = index != 1 })],
            FeaturedProducts = ["DEMO-P104", "DEMO-P101"],
            CategoryProducts = new Dictionary<string, string> { ["Hava temizleme"] = "", ["Kahve makineleri"] = "DEMO-V102-R" },
        };
        (await client.PutAsJsonAsync("/api/v1/local-commerce/content", content)).EnsureSuccessStatusCode();
        var home = (await client.GetFromJsonAsync<HomeContent>("/api/v1/content/home"))!;
        Assert.Equal(state.Content.Slides.Length - 1, home.Slides.Length);
        Assert.All(home.Slides, slide => Assert.Equal("image", slide.Type));
        Assert.Equal(["DEMO-P104", "DEMO-P101"], home.FeaturedProducts.Select(product => product.Id));
        Assert.DoesNotContain(home.Categories, category => category.Category == "Hava temizleme");
        Assert.Equal("Kahve Makinesi 101 · Kırmızı", home.Categories.Single(category => category.Category == "Kahve makineleri").ImageAlt);
    }

    [Theory]
    [InlineData(0, "out_of_stock", 0)]
    [InlineData(1, "low_stock", 1)]
    [InlineData(5, "low_stock", 5)]
    [InlineData(6, "in_stock", null)]
    public void AvailabilityOnlyDisclosesLowStockCounts(int stock, string status, int? remaining) =>
        Assert.Equal(new Availability(status, remaining), CatalogProjection.AvailabilityFor(stock));

    [Theory]
    [InlineData(-3, 0)]
    [InlineData(0, 0)]
    [InlineData(8, 8)]
    [InlineData(250, 99)]
    public void CartLimitFollowsStockUpTo99(int stock, int expected) => Assert.Equal(expected, CatalogProjection.MaxQuantityFor(stock));

    [Theory]
    [InlineData("/api/v1/local-commerce/media/a.png", null, "http://api.test:5003/api/v1/local-commerce/media/a.png")]
    [InlineData("/assets/p.webp", null, "http://api.test:3000/assets/p.webp")]
    [InlineData("/assets/p.webp", "https://www.xinobi.com/", "https://www.xinobi.com/assets/p.webp")]
    [InlineData("https://cdn.example/x.png", null, "https://cdn.example/x.png")]
    [InlineData("javascript:alert(1)", null, null)]
    [InlineData("", null, null)]
    public void ImageUrlsResolveToAbsoluteSafeAddresses(string path, string? assetBase, string? expected)
    {
        var request = new Microsoft.AspNetCore.Http.DefaultHttpContext().Request;
        request.Scheme = "http";
        request.Host = new Microsoft.AspNetCore.Http.HostString("api.test", 5003);
        Assert.Equal(expected, CatalogEndpoints.ResolveUrl(path, request, assetBase, development: true));
    }

    public void Dispose()
    {
        if (Directory.Exists(dataDirectory)) Directory.Delete(dataDirectory, recursive: true);
    }
}
