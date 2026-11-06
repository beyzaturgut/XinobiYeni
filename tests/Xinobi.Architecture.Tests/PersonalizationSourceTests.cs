using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class PersonalizationSourceTests
{
    private const string Root = "/api/v1/local-commerce/personalization-sources/DEMO-P101";
    private static byte[] Photo(int width = 73, int height = 41)
    {
        using var bitmap = new SKBitmap(width, height); bitmap.Erase(SKColors.Red);
        using var image = SKImage.FromBitmap(bitmap); using var data = image.Encode(SKEncodedImageFormat.Png, 100); return data.ToArray();
    }
    private static async Task<string> Upload(IsolatedApiFactory factory, byte[] bytes)
    {
        var key = Guid.NewGuid().ToString("N") + ".png";
        await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Media, key, new MemoryStream(bytes), "image/png");
        return "/api/v1/local-commerce/media/" + key;
    }
    private static async Task<PersonalizationSourceView> Read(HttpResponseMessage response)
    { Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync()); return (await response.Content.ReadFromJsonAsync<PersonalizationSourceView>())!; }
    private static SavePersonalizationSource Request(string image, byte[] bytes, int revision) => new(image, Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(), revision);

    [Fact]
    public async Task SourceIsIndependentOfColourAndPersistsExactBytesAndHistory()
    {
        using var factory = new IsolatedApiFactory(); using var client = await TestStaff.Client(factory);
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>();
        await catalog.Update(state => state with { Products = state.Products.Select(p => p.Id != "DEMO-P101" ? p : p with { Personalizable = true, Variants = p.Variants.Select(v => v with { Color = "", Hex = null }).ToArray() }).ToArray() });
        var before = JsonSerializer.Serialize(await catalog.Read());
        var files = factory.Services.GetRequiredService<IFileStore>();
        await files.Save(FileAreas.Designs, "order-sentinel-0-source", new MemoryStream([1, 2, 3]), "image/png");
        var empty = await Read(await client.GetAsync(Root)); Assert.Equal("none", empty.Status);
        var bytes = Photo(); var image = await Upload(factory, bytes);
        var candidate = (await client.GetFromJsonAsync<PersonalizationSourceAsset>(Root + "/candidate?image=" + Uri.EscapeDataString(image)))!;
        Assert.Equal(73, candidate.Width); Assert.Equal(41, candidate.Height);
        var first = await Read(await client.PutAsJsonAsync(Root, Request(image, bytes, 0)));
        Assert.Equal(1, first.Revision); Assert.Equal("pending", first.SurfaceStatus); Assert.NotEqual(image, first.Source!.Image);
        Assert.Equal(bytes, await client.GetByteArrayAsync(first.Source.Image));
        var secondBytes = Photo(7001, 5); var secondImage = await Upload(factory, secondBytes);
        var second = await Read(await client.PutAsJsonAsync(Root, Request(secondImage, secondBytes, 1)));
        Assert.Equal(2, second.Revision); Assert.Equal(7001, second.Source!.Width); Assert.Equal(5, second.Source.Height);
        Assert.Equal(bytes, await client.GetByteArrayAsync(first.Source.Image));
        Assert.Equal(secondBytes, await client.GetByteArrayAsync(second.Source!.Image));
        Assert.Equal(before, JsonSerializer.Serialize(await catalog.Read()));
        await using var sentinel = (await files.Open(FileAreas.Designs, "order-sentinel-0-source"))!;
        using var copy = new MemoryStream(); await sentinel.Content.CopyToAsync(copy); Assert.Equal(new byte[] { 1, 2, 3 }, copy.ToArray());
        var persisted = await File.ReadAllTextAsync(Path.Combine(catalog.DataDirectory, "personalization/personalization-profiles.json"));
        Assert.Contains(first.Source.Sha256, persisted); Assert.Contains(second.Source.Sha256, persisted);
        using var restarted = new IsolatedApiFactory(catalog.DataDirectory);
        using var anotherClient = await TestStaff.Client(restarted);
        Assert.Equal(2, (await Read(await anotherClient.GetAsync(Root))).Revision);
    }

    [Fact]
    public async Task StaleRevisionAndChangedCandidateCannotOverwriteSource()
    {
        using var factory = new IsolatedApiFactory(); using var client = await TestStaff.Client(factory);
        var bytes = Photo(); var image = await Upload(factory, bytes);
        await Read(await client.PutAsJsonAsync(Root, Request(image, bytes, 0)));
        var responses = await Task.WhenAll(client.PutAsJsonAsync(Root, Request(image, bytes, 1)), client.PutAsJsonAsync(Root, Request(image, bytes, 1)));
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Conflict);
        var bad = await client.PutAsJsonAsync(Root, new SavePersonalizationSource(image, new string('0', 64), 2));
        Assert.Equal(HttpStatusCode.Conflict, bad.StatusCode);
        Assert.Equal(2, (await Read(await client.GetAsync(Root))).Revision);
    }

    [Fact]
    public async Task MissingOrReplacedStoredSourceIsStaleNotSuccessfulEmptyData()
    {
        using var factory = new IsolatedApiFactory(); using var client = await TestStaff.Client(factory);
        var bytes = Photo(); var image = await Upload(factory, bytes);
        var saved = await Read(await client.PutAsJsonAsync(Root, Request(image, bytes, 0)));
        var files = factory.Services.GetRequiredService<IFileStore>();
        await files.Save(FileAreas.Media, Path.GetFileName(saved.Source!.Image), new MemoryStream(Photo(15, 17)), "image/png");
        Assert.Equal("stale", (await Read(await client.GetAsync(Root))).Status);
        await files.Delete(FileAreas.Media, Path.GetFileName(saved.Source.Image));
        var missing = await Read(await client.GetAsync(Root)); Assert.Equal("stale", missing.Status); Assert.NotNull(missing.Source);
    }

    [Fact]
    public async Task InvalidSourcesAndNonPersonalizableProductsAreRejected()
    {
        using var factory = new IsolatedApiFactory(); using var client = await TestStaff.Client(factory);
        foreach (var image in new[] { "https://example.invalid/test.png", "/assets/../../secret.png", "/api/v1/local-commerce/media/invalid.png" })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root, new SavePersonalizationSource(image, "invalid", 0))).StatusCode);
        var invalid = await Upload(factory, [137, 80, 78, 71, 13, 10, 26, 10]);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(Root, Request(invalid, [137, 80, 78, 71, 13, 10, 26, 10], 0))).StatusCode);
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>();
        await catalog.Update(state => state with { Products = state.Products.Select(p => p.Id == "DEMO-P101" ? p with { Personalizable = false } : p).ToArray() });
        Assert.Equal(HttpStatusCode.Conflict, (await client.GetAsync(Root)).StatusCode);
    }

    [Fact]
    public async Task NullOrUnknownProfileDocumentIsUnavailableNotEmptyAndCannotBeOverwritten()
    {
        using var factory = new IsolatedApiFactory(); using var client = await TestStaff.Client(factory);
        var catalog = factory.Services.GetRequiredService<LocalCommerceStore>();
        var file = Path.Combine(catalog.DataDirectory, "personalization/personalization-profiles.json");
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        var bytes = Photo(); var image = await Upload(factory, bytes);
        foreach (var invalid in new[] { "null", "{\"schemaVersion\":2,\"profiles\":{}}", "{\"schemaVersion\":1,\"profiles\":null}" })
        {
            await File.WriteAllTextAsync(file, invalid);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync(Root)).StatusCode);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.PutAsJsonAsync(Root, Request(image, bytes, 0))).StatusCode);
            Assert.Equal(invalid, await File.ReadAllTextAsync(file));
        }
    }

    [Fact]
    public async Task AnonymousAndCustomerCannotReadOrWriteStaffSources()
    {
        using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(Root)).StatusCode);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Test", "source-test@example.invalid", "guclu-parola-1");
        var tokens = await accounts.IssueTokens(customer.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(Root)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync(Root, new SavePersonalizationSource("", "", 0))).StatusCode);
    }
}
