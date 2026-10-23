using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Designs;
using Xinobi.Api.DesignStudio;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Architecture.Tests;

/// <summary>Designs kept in the account (K-21): copied from a finished XINOBI U session or uploaded, visible to their owner only.</summary>
public sealed class SavedDesignTests : IDisposable
{
    private static readonly byte[] Png = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-saved-design-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Notifications:WorkerEnabled", "false");
        builder.UseSetting("DesignStudio:WorkerEnabled", "true");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory, ["DesignStudio:ExternalInferenceEnabled"] = "false", ["ProductSurfaces:PublishedRoot"] = Path.Combine(directory, "published") }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(new PreviewSender());
            services.RemoveAll<IImageGenerationProvider>(); services.AddSingleton<IImageGenerationProvider>(new FakeProvider());
        });
    });

    private sealed class PreviewSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeProvider : IImageGenerationProvider
    {
        public bool IsConfigured => true;
        public Task<GeneratedImage> GenerateAsync(string prompt, CancellationToken token) => Task.FromResult(new GeneratedImage(Png, "image/png", "test", "test"));
    }

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, HttpContent? content = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = content };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    private static async Task<T> Read<T>(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task<string> Register(HttpClient client, string email)
    {
        var challenge = await Read<AccountEmailVerification>(await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification(email)));
        return (await Read<AuthSession>(await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe Yılmaz", email, "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!)))).AccessToken;
    }

    private static MultipartFormDataContent Upload(byte[] bytes, string productId = "DEMO-P101")
    {
        var form = new MultipartFormDataContent { { new ByteArrayContent(bytes), "file", "desen.png" }, { new StringContent(productId), "productId" }, { new StringContent("DEMO-V101-B"), "variantId" } };
        return form;
    }

    [Fact]
    public async Task ConfigurationCanReplaceColourAndSourceWithoutRewritingOldRevisions()
    {
        using var factory = Factory();
        var store = factory.Services.GetRequiredService<SavedDesignStore>();
        var original = await store.Add("owner", "upload", "Original", "P1", "Product", "blue", "Blue", [], Png);
        var replacement = await store.Add("owner", "upload", "Replacement", "P1", "Product", "red", "Red", [], [.. Png, 0]);
        var placement = new DesignPlacement(100, 100, new string('a', 64), 50, 50, 1, 0, .5, Mode: "artwork");
        var first = await store.SaveConfiguration("owner", original.Id, new("blue", placement, Favorite: true));
        var next = await store.SaveConfiguration("owner", replacement.Id, new("red", placement with { X = 65 }, first.Id, 1, true));
        Assert.Equal((first.Id, 2, replacement.Id, "red", true), (next.Id, next.Revision, next.DesignId, next.VariantId, next.Favorite));
        Assert.NotEqual(first.SourceSha256, next.SourceSha256);
        Assert.Equal(first, await store.Configuration("owner", first.Id, 1));
        var otherProduct = await store.Add("owner", "upload", "Other", "P2", "Other product", "red", "Red", [], Png);
        Assert.Equal("configuration_changed", (await Assert.ThrowsAsync<ProblemException>(() => store.SaveConfiguration("owner", otherProduct.Id, new("red", placement, first.Id, 2)))).Code);
        Assert.Equal("configuration_changed", (await Assert.ThrowsAsync<ProblemException>(() => store.SaveConfiguration("owner", original.Id, new("blue", placement, first.Id, 1)))).Code);
        Assert.Equal("design_not_found", (await Assert.ThrowsAsync<ProblemException>(() => store.SaveConfiguration("other", replacement.Id, new("red", placement, first.Id, 2)))).Code);
        await store.SavePreview("owner", first.Id, 1, [255, 216, 255, 217]);
        await store.SavePreview("owner", next.Id, 2, [255, 216, 255, 217]);
        // Removing the old upload leaves the replacement and its current favorite intact.
        Assert.True(await store.Delete("owner", original.Id));
        Assert.Equal(next, Assert.Single(await store.Configurations("owner")));
        Assert.NotNull(await store.Find("owner", replacement.Id));
        // Removing the current source retires its lineage, so an older favorite cannot reappear.
        Assert.True(await store.Delete("owner", replacement.Id));
        Assert.Empty(await store.Configurations("owner"));
        Assert.Empty(Directory.GetFiles(directory, "preview-*.jpg", SearchOption.AllDirectories));

        var remaining = await store.Add("owner", "upload", "Remaining", "P1", "Product", "blue", "Blue", [], Png);
        var latest = await store.SaveConfiguration("owner", remaining.Id, new("blue", placement, Favorite: true));
        var final = await store.Add("owner", "upload", "Final", "P1", "Product", "red", "Red", [], Png);
        await store.SaveConfiguration("owner", final.Id, new("red", placement, latest.Id, 1, true));
        await store.Delete("owner", final.Id);
        Assert.Empty(await store.Configurations("owner"));
        await Assert.ThrowsAsync<ProblemException>(() => store.Configuration("owner", latest.Id, 1));
        Assert.NotNull(await store.Find("owner", remaining.Id));
    }

    [Fact]
    public void GeneratedDesignNamesFitTheCartWithoutRejectingTheDesign()
    {
        Assert.Equal(60, SavedDesignStore.CleanName(null, new string('a', 90)).Length);
        Assert.DoesNotContain('\n', SavedDesignStore.CleanName(null, "Uzun\nürün adı"));
        var unicode = SavedDesignStore.CleanName(null, new string('a', 59) + "😀 tasarımı");
        Assert.Equal(59, unicode.Length);
        Assert.Equal("invalid_name", Assert.Throws<ProblemException>(() => SavedDesignStore.CleanName(new string('a', 90), "Tasarım")).Code);
    }

    [Fact]
    public void OnlyImageContentIsAccepted()
    {
        Assert.Equal(("image/png", ".png"), SavedDesignStore.DetectImage(Png));
        Assert.Equal("invalid_image", Assert.Throws<ProblemException>(() => SavedDesignStore.DetectImage("<svg/>"u8)).Code);
    }

    [Fact]
    public async Task AFinishedSessionIsCopiedIntoTheAccount()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client, "ayse@example.com");
        var session = await Read<SessionView>(await client.PostAsJsonAsync("/api/v1/design-studio/sessions", new CreateDesignSession("DEMO-P101", "DEMO-V101-B", Guid.NewGuid().ToString())));
        // Not generated yet.
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, "/api/v1/me/designs", token, JsonContent.Create(new SaveDesignFromSession(session.Id, null)))).StatusCode);
        (await client.PostAsJsonAsync($"/api/v1/design-studio/sessions/{session.Id}/generation", new GenerateDesignRequest(session.Questions.Select(q => new DesignAnswer(q.Id, q.Options[0].Id)).ToArray()))).EnsureSuccessStatusCode();
        for (var i = 0; i < 100 && (await client.GetFromJsonAsync<SessionView>($"/api/v1/design-studio/sessions/{session.Id}"))!.Status != "ready"; i++) await Task.Delay(30);

        var saved = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs", token, JsonContent.Create(new SaveDesignFromSession(session.Id, "  Mavi dalgalar "))));
        Assert.Equal(("ai", "Mavi dalgalar", 5), (saved.Kind, saved.Name, saved.Profile.Length));
        Assert.Equal(Png, await (await Send(client, HttpMethod.Get, saved.ImageUrl, token)).Content.ReadAsByteArrayAsync());
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Post, "/api/v1/me/designs", token, JsonContent.Create(new SaveDesignFromSession("missing", null)))).StatusCode);
    }

    [Fact]
    public async Task UploadsBelongToTheirOwner()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client, "ayse@example.com");
        var other = await Register(client, "other@example.com");
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, Upload("not an image"u8.ToArray()))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, Upload(Png, "missing"))).StatusCode);
        var design = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, Upload(Png)));
        Assert.Equal("upload", design.Kind);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Get, design.ImageUrl, null)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, design.ImageUrl, other)).StatusCode);
        Assert.Empty(await Read<MyDesign[]>(await Send(client, HttpMethod.Get, "/api/v1/me/designs", other)));
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Delete, $"/api/v1/me/designs/{design.Id}", other)).StatusCode);

        var renamed = await Read<MyDesign>(await Send(client, HttpMethod.Patch, $"/api/v1/me/designs/{design.Id}", token, JsonContent.Create(new RenameDesign("Logom"))));
        Assert.Equal("Logom", renamed.Name);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/me/designs/{design.Id}", token)).StatusCode);
        Assert.Empty(await Read<MyDesign[]>(await Send(client, HttpMethod.Get, "/api/v1/me/designs", token)));
    }

    [Fact]
    public async Task ASavedDesignIsOrderedOnAPersonalisableProduct()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        using var staff = await TestStaff.Client(factory);
        var token = await Register(client, "ayse@example.com");
        var other = await Register(client, "other@example.com");
        var address = await Read<CustomerAddress>(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token,
            JsonContent.Create(new SaveCustomerAddress("Ev", "Ayşe Yılmaz", "0532 123 45 67", "İstanbul", "Kadıköy", "Moda Cad. No: 1 D: 2", "34710", true))));
        var design = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, Upload(Png)));
        PlaceOrder Order(string request, params PlaceOrderItem[] items) => new(address.Id, items, request);

        // Someone else's design, a design for another product, or an unknown id never reaches an order.
        var foreign = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", other, Upload(Png)));
        Assert.Equal("design_not_found", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, JsonContent.Create(Order("request-0001", new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1, foreign.Id))))));
        var state = (await staff.GetFromJsonAsync<Xinobi.Api.LocalCommerce.CommerceState>("/api/v1/local-commerce/state"))!;
        var otherProduct = state.Products.First(product => product.Id != "DEMO-P101" && product.Variants.Length > 0);
        Assert.Equal("design_product_mismatch", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token,
            JsonContent.Create(Order("request-0002", new PlaceOrderItem(otherProduct.Id, otherProduct.Variants[0].Id, 1, design.Id))))));

        // Same colour plain and personalised: two lines.
        var order = await Read<CustomerOrder>(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token,
            JsonContent.Create(Order("request-0003", new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 2, design.Id), new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1)))));
        Assert.Equal(2, order.Lines.Length);
        var line = Array.FindIndex(order.Lines, item => item.Personalization is not null);
        var personalization = order.Lines[line].Personalization!;
        Assert.Equal((design.Id, "upload", 2), (personalization.DesignId, personalization.Kind, order.Lines[line].Quantity));
        Assert.Equal($"/api/v1/me/orders/{order.Id}/lines/{line}/design", personalization.ImageUrl);

        // The order keeps its own copy: deleting the saved design does not change it.
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/me/designs/{design.Id}", token)).StatusCode);
        Assert.Equal(Png, await (await Send(client, HttpMethod.Get, personalization.ImageUrl!, token)).Content.ReadAsByteArrayAsync());
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, personalization.ImageUrl!, other)).StatusCode);
        var panel = (await staff.GetFromJsonAsync<StaffOrder[]>("/api/v1/local-commerce/orders"))!.Single(item => item.Order.Id == order.Id);
        var panelImage = panel.Order.Lines[line].Personalization!.ImageUrl!;
        Assert.StartsWith("/api/v1/local-commerce/orders/", panelImage);
        Assert.Equal(Png, await staff.GetByteArrayAsync(panelImage));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(panelImage)).StatusCode);

        // A product the store turned off for personalisation refuses designs.
        var again = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, Upload(Png)));
        var tea = state.Products.First(product => product.Id == "DEMO-P101");
        (await staff.PutAsJsonAsync("/api/v1/local-commerce/products/DEMO-P101", tea with { Personalizable = false })).EnsureSuccessStatusCode();
        Assert.Equal("personalization_not_available", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token,
            JsonContent.Create(Order("request-0004", new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1, again.Id))))));
    }

    [Fact]
    public async Task ConfigurationRevisionsReachImmutableOrdersAndProtectedDownloads()
    {
        using var factory = Factory(); using var client = factory.CreateClient(); using var staff = await TestStaff.Client(factory);
        var token = await Register(client, "configuration@example.com"); var other = await Register(client, "configuration-other@example.com");
        var design = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, Upload(Png)));
        var state = (await staff.GetFromJsonAsync<Xinobi.Api.LocalCommerce.CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.First(p => p.Id == design.ProductId);
        (await staff.PutAsJsonAsync("/api/v1/local-commerce/products/" + product.Id, product with { Personalizable = true })).EnsureSuccessStatusCode();
        var root = Path.Combine(directory, "published", product.Id, design.VariantId!); Directory.CreateDirectory(root);
        var version = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(Png)).ToLowerInvariant();
        var mediaVersion = Guid.NewGuid().ToString("D");
        Directory.CreateDirectory(Path.Combine(root, mediaVersion));
        await File.WriteAllBytesAsync(Path.Combine(root, mediaVersion, "source.webp"), Png);
        await File.WriteAllBytesAsync(Path.Combine(root, mediaVersion, "mask.png"), Png);
        var prefix = $"/assets/product-previews/{product.Id}/{design.VariantId}/{mediaVersion}/";
        await File.WriteAllTextAsync(Path.Combine(root, "inputs.json"), System.Text.Json.JsonSerializer.Serialize(new {
            productReference = product.Id, variantReference = design.VariantId, sourceImage = product.Variants.First(v => v.Id == design.VariantId).Image,
            inputs = new { width = 100, height = 100, surfaceVersion = version,
                source = new { url = prefix + "source.webp?v=" + version, sha256 = version },
                mask = new { url = prefix + "mask.png?v=" + version, sha256 = version }, branding = (object?)null }
        }));
        var placement = new DesignPlacement(100, 100, version, 25, 35, 1.2, 15, .4,
            new() { ["upper-body"] = new(2, 3, .8, 4) }, "artwork", false);
        var route = $"/api/v1/me/designs/{design.Id}/configurations";
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Post, route, other, JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement)))).StatusCode);
        Assert.Equal("invalid_placement", await Code(await Send(client, HttpMethod.Post, route, token, JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement with { Scale = -1 })))));
        Assert.Equal("surface_changed", await Code(await Send(client, HttpMethod.Post, route, token, JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement with { SurfaceVersion = new string('b',64) })))));
        await File.WriteAllBytesAsync(Path.Combine(root, mediaVersion, "mask.png"), [0, 1, 2]);
        Assert.Equal("surface_unavailable", await Code(await Send(client, HttpMethod.Post, route, token, JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement)))));
        await File.WriteAllBytesAsync(Path.Combine(root, mediaVersion, "mask.png"), Png);
        var first = await Read<MyDesignConfiguration>(await Send(client, HttpMethod.Post, route, token, JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement, Favorite: true))));
        Assert.Equal(1, first.Revision); Assert.Equal(64, first.SourceSha256.Length);
        var previewRoute = $"/api/v1/me/design-configurations/{first.Id}/revisions/1/preview";
        byte[] jpegPreview = [255, 216, 255, 217];
        using var previewUpload = new MultipartFormDataContent { { new ByteArrayContent(jpegPreview), "file", "preview.jpg" } };
        (await Send(client, HttpMethod.Put, previewRoute, token, previewUpload)).EnsureSuccessStatusCode();
        Assert.Equal(jpegPreview, await (await Send(client, HttpMethod.Get, previewRoute, token)).Content.ReadAsByteArrayAsync());
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, previewRoute, other)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(previewRoute)).StatusCode);

        Assert.Single(await Read<MyDesignConfiguration[]>(await Send(client, HttpMethod.Get, "/api/v1/me/design-configurations", token)));
        Assert.Empty(await Read<MyDesignConfiguration[]>(await Send(client, HttpMethod.Get, "/api/v1/me/design-configurations", other)));
        var address = await Read<CustomerAddress>(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token,
            JsonContent.Create(new SaveCustomerAddress("Ev", "Test Kullanıcı", "05321234567", "İstanbul", "Kadıköy", "Test sokak no 12", "34710", true))));
        var request = new PlaceOrder(address.Id, [new(product.Id, design.VariantId!, 2, design.Id, first.Id, first.Revision)], "configuration-request-1");
        var order = await Read<CustomerOrder>(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, JsonContent.Create(request)));
        Assert.Equal(placement, order.Lines[0].Personalization!.Placement! with { BodyAdjustments = placement.BodyAdjustments });
        var secondResponse = await Send(client, HttpMethod.Post, route, token,
            JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement with { X = 60, BodyAdjustments = null, Mode = null, FillMask = null }, first.Id, 1, true)));
        using(var json=System.Text.Json.JsonDocument.Parse(await secondResponse.Content.ReadAsStringAsync()))
        {
            var output=json.RootElement.GetProperty("placement");
            Assert.False(output.TryGetProperty("bodyAdjustments",out _));
            Assert.False(output.TryGetProperty("mode",out _));
            Assert.False(output.TryGetProperty("fillMask",out _));
        }
        var second = await Read<MyDesignConfiguration>(secondResponse);
        Assert.Equal(2, second.Revision);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, previewRoute.Replace("/1/", "/2/"), token)).StatusCode);
        Assert.Equal(jpegPreview, await (await Send(client, HttpMethod.Get, previewRoute, token)).Content.ReadAsByteArrayAsync());
        Assert.Equal("configuration_changed", await Code(await Send(client, HttpMethod.Post, route, token,
            JsonContent.Create(new SaveDesignConfiguration(design.VariantId!, placement, first.Id, 1)))));
        var old = await Read<MyDesignConfiguration>(await Send(client, HttpMethod.Get, $"/api/v1/me/design-configurations/{first.Id}/revisions/1", token));
        Assert.Equal(25, old.Placement.X);
        var conflict = request with { Items = [request.Items[0] with { ConfigurationRevision = 2 }] };
        Assert.Equal("idempotency_conflict", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, JsonContent.Create(conflict))));
        Assert.Equal(order.Id, (await Read<CustomerOrder>(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, JsonContent.Create(request)))).Id);
        var download = await staff.GetAsync($"/api/v1/local-commerce/orders/{order.Id}/lines/0/design?download=true");
        Assert.Equal("attachment", download.Content.Headers.ContentDisposition?.DispositionType); Assert.Equal(Png, await download.Content.ReadAsByteArrayAsync());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/api/v1/local-commerce/orders/{order.Id}/lines/0/design?download=true")).StatusCode);
        (await Send(client, HttpMethod.Delete, $"/api/v1/me/designs/{design.Id}", token)).EnsureSuccessStatusCode();
        Assert.Null(await factory.Services.GetRequiredService<IFileStore>().Open(FileAreas.Designs, $"preview-{first.Id}-1.jpg"));
        var retained = await Read<CustomerOrder>(await Send(client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}", token));
        Assert.Equal(25, retained.Lines[0].Personalization!.Placement!.X);
        Assert.Equal(Png, await (await Send(client, HttpMethod.Get, retained.Lines[0].Personalization!.ImageUrl!, token)).Content.ReadAsByteArrayAsync());
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
