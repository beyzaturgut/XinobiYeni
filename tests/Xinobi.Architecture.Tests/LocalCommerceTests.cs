using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class LocalCommerceTests : IDisposable
{
    private readonly string dataDirectory = Path.Combine(Path.GetTempPath(), "xinobi-commerce-test-" + Guid.NewGuid());
    private WebApplicationFactory<Program> CreateFactory(string environment = "Development") => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment(environment);
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = dataDirectory }));
    });
    private const string Root = "/api/v1/local-commerce";

    [Fact]
    public async Task HomepageCategorySelectionPersistsAndRejectsWrongCategoryOrVariant()
    {
        string category, variant;
        using (var factory = CreateFactory())
        using (var client = factory.CreateClient())
        {
            var seed = (await client.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
            category = seed.Products[0].Category; variant = seed.Products[0].Variants[1].Id;
            foreach (var selection in new[] { new Dictionary<string, string> { [category] = "unknown" }, new Dictionary<string, string> { ["Unknown category"] = variant }, new Dictionary<string, string> { [seed.Products[1].Category] = variant } })
                Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root + "/content", seed.Content with { CategoryProducts = selection })).StatusCode);
            (await client.PutAsJsonAsync(Root + "/content", seed.Content with { CategoryProducts = new() { [category] = variant, [seed.Products[1].Category] = "" } })).EnsureSuccessStatusCode();
        }
        using var restarted = CreateFactory();
        using var second = restarted.CreateClient();
        var saved = (await second.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
        Assert.Equal(variant, saved.Content.CategoryProducts![category]);
        Assert.Equal("", saved.Content.CategoryProducts[saved.Products[1].Category]);
    }

    [Fact]
    public async Task CategoriesPersistRejectDuplicatesAndCanBeAssignedToProducts()
    {
        using (var factory = CreateFactory())
        using (var client = factory.CreateClient())
        {
            (await client.PostAsJsonAsync(Root + "/categories", new CategoryCreate("  Blenderlar  "))).EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(Root + "/categories", new CategoryCreate("blenderlar"))).StatusCode);
            foreach (var name in new[] { "", "Tümü", new string('a', 81) })
                Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(Root + "/categories", new CategoryCreate(name))).StatusCode);
            var state = (await client.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
            var product = state.Products[0] with { Category = "Blenderlar" };
            (await client.PutAsJsonAsync(Root + "/products/" + product.Id, product)).EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root + "/products/" + product.Id, product with { Category = "Bilinmeyen" })).StatusCode);
        }
        using var restarted = CreateFactory();
        using var second = restarted.CreateClient();
        var saved = (await second.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
        Assert.Contains("Blenderlar", saved.Categories!);
        Assert.Equal("Blenderlar", saved.Products[0].Category);
    }

    [Fact]
    public async Task ProductPriceStockAndContentSurviveRestart()
    {
        using (var factory = CreateFactory())
        using (var client = factory.CreateClient())
        {
            var seed = (await client.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
            var product = seed.Products[0] with { Name = "Kaydedilen ürün", OriginalImage = "/assets/products/original.webp", Variants = [seed.Products[0].Variants[0] with { Stock = 17, Hex = "#123456" }] };
            (await client.PutAsJsonAsync(Root + "/products/" + product.Id, product)).EnsureSuccessStatusCode();
            (await client.PutAsJsonAsync(Root + "/prices/" + product.Variants[0].Id, new PriceUpdate(345678))).EnsureSuccessStatusCode();
            (await client.PutAsJsonAsync(Root + "/content", seed.Content with { Slides = [], XinobiBanner = "", ButtonColor = "#112233" })).EnsureSuccessStatusCode();
        }
        using var restarted = CreateFactory();
        using var secondClient = restarted.CreateClient();
        var state = (await secondClient.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
        var saved = state.Products.Single(p => p.Name == "Kaydedilen ürün");
        Assert.Equal(17, saved.Variants[0].Stock);
        Assert.Equal("#123456", saved.Variants[0].Hex);
        Assert.Equal("/assets/products/original.webp", saved.OriginalImage);
        Assert.Equal(345678, state.Prices[saved.Variants[0].Id]);
        Assert.Empty(state.Content.Slides);
        Assert.Equal("", state.Content.XinobiBanner);
        (await secondClient.DeleteAsync(Root + "/products/" + saved.Id)).EnsureSuccessStatusCode();
        state = (await secondClient.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
        Assert.DoesNotContain(state.Products, p => p.Id == saved.Id);
        Assert.False(state.Prices.ContainsKey(saved.Variants[0].Id));
    }

    [Fact]
    public async Task InvalidStockAndUntrustedOriginsCannotWrite()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var seed = (await client.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
        var invalid = seed.Products[0] with { Variants = [seed.Products[0].Variants[0] with { Stock = -1 }] };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root + "/products/" + invalid.Id, invalid)).StatusCode);
        foreach (var variant in new[] { seed.Products[0].Variants[0] with { Hex = "red" } })
        {
            var invalidMedia = seed.Products[0] with { Variants = [variant] };
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root + "/products/" + invalidMedia.Id, invalidMedia)).StatusCode);
        }
        var invalidOriginal = seed.Products[0] with { OriginalImage = "https://untrusted.example/photo.jpg" };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root + "/products/" + invalidOriginal.Id, invalidOriginal)).StatusCode);
        client.DefaultRequestHeaders.Add("Origin", "https://untrusted.example");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync(Root + "/content", seed.Content)).StatusCode);
        client.DefaultRequestHeaders.Remove("Origin");
        Assert.Equal(seed.Products[0].Variants[0].Stock, (await client.GetFromJsonAsync<CommerceState>(Root + "/state"))!.Products[0].Variants[0].Stock);
    }

    [Fact]
    public async Task UploadedMediaIsSharedAndInvalidContentIsRejected()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var bytes = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");
        using var form = new MultipartFormDataContent();
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        form.Add(file, "file", "test.png");
        var upload = await client.PostAsync(Root + "/media", form);
        upload.EnsureSuccessStatusCode();
        using var document = System.Text.Json.JsonDocument.Parse(await upload.Content.ReadAsStringAsync());
        var src = document.RootElement.GetProperty("src").GetString()!;
        Assert.Equal(bytes, await client.GetByteArrayAsync(src));
        using var invalidForm = new MultipartFormDataContent();
        var invalid = new ByteArrayContent(System.Text.Encoding.UTF8.GetBytes("not a PNG image"));
        invalid.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        invalidForm.Add(invalid, "file", "fake.png");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsync(Root + "/media", invalidForm)).StatusCode);
    }

    [Fact]
    public async Task ProductionDoesNotExposeLocalCommerce()
    {
        using var factory = CreateFactory("Production");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Root + "/state")).StatusCode);
    }

    public void Dispose() { if (Directory.Exists(dataDirectory)) Directory.Delete(dataDirectory, true); }
}
