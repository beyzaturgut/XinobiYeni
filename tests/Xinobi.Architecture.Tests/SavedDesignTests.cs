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
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory, ["DesignStudio:ExternalInferenceEnabled"] = "false" }));
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
