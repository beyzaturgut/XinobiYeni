using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Catalog;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.Orders;
using Xinobi.Api.Reviews;

namespace Xinobi.Architecture.Tests;

/// <summary>Verified-purchase reviews with moderation, and product specs used by comparison. No mail leaves (worker off, example.com).</summary>
public sealed class ReviewTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-review-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory() => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Notifications:WorkerEnabled", "false");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services => { services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(new PreviewSender()); });
    });

    private sealed class PreviewSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, object? body = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    private static async Task<T> Read<T>(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task<string> Register(HttpClient client, string email, string name = "Ayşe Nur Yılmaz")
    {
        var challenge = await Read<AccountEmailVerification>(await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification(email)));
        return (await Read<AuthSession>(await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount(name, email, "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!)))).AccessToken;
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    [Fact]
    public void AuthorsAreShownWithFirstNameAndInitial()
    {
        Assert.Equal("Ayşe Y.", ReviewStore.DisplayName("Ayşe Nur yılmaz"));
        Assert.Equal("Ayşe", ReviewStore.DisplayName(" Ayşe "));
        Assert.Equal("Xinobi müşterisi", ReviewStore.DisplayName(""));
    }

    [Fact]
    public async Task OnlyDeliveredBuyersReviewAndOnlyApprovedReviewsArePublic()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client, "ayse@example.com");
        var request = new SubmitReview("DEMO-P101", 5, "Çok şık", "Rengi fotoğraftaki gibi, çay hızlı demleniyor.");
        var early = await Send(client, HttpMethod.Post, "/api/v1/me/reviews", token, request);
        Assert.Equal(HttpStatusCode.Forbidden, early.StatusCode);
        Assert.Equal("not_purchased", await Code(early));

        var address = await Read<CustomerAddress>(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token,
            new SaveCustomerAddress("Ev", "Ayşe Yılmaz", "0532 123 45 67", "İstanbul", "Kadıköy", "Moda Cad. No: 1 D: 2", "34710", true)));
        var order = await Read<CustomerOrder>(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, new PlaceOrder(address.Id, [new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1)], "request-0001")));
        await Read<CustomerOrder>(await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/shipment", new ShipOrder("Aras Kargo", "AR123456", null)));
        Assert.Equal("not_purchased", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/reviews", token, request)));
        await Read<CustomerOrder>(await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/status", new SetOrderStatus(OrderStatuses.Delivered, null)));

        Assert.Equal("invalid_rating", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/reviews", token, request with { Rating = 6 })));
        Assert.Equal("invalid_body", await Code(await Send(client, HttpMethod.Post, "/api/v1/me/reviews", token, request with { Body = "kısa" })));
        var mine = await Read<MyReview>(await Send(client, HttpMethod.Post, "/api/v1/me/reviews", token, request));
        Assert.Equal(ReviewStatuses.Pending, mine.Status);
        Assert.Empty((await client.GetFromJsonAsync<ReviewPage>("/api/v1/catalog/products/DEMO-P101/reviews"))!.Items);

        var panel = await client.GetFromJsonAsync<ProductReview[]>("/api/v1/local-commerce/reviews?status=pending");
        Assert.Equal("Ayşe Y.", panel!.Single().AuthorName);
        await Read<ProductReview>(await client.PostAsJsonAsync($"/api/v1/local-commerce/reviews/{mine.Id}/moderation", new ModerateReview(ReviewStatuses.Approved, null, "Teşekkür ederiz!")));

        var page = (await client.GetFromJsonAsync<ReviewPage>("/api/v1/catalog/products/DEMO-P101/reviews"))!;
        var item = page.Items.Single();
        Assert.Equal(("Ayşe Y.", 5, "Teşekkür ederiz!"), (item.AuthorName, item.Rating, item.StoreReply));
        Assert.Equal((5.0, 1), (page.Summary.Average, page.Summary.Count));
        Assert.Equal([0, 0, 0, 0, 1], page.Summary.Distribution);
        var summaries = (await client.GetFromJsonAsync<ReviewSummaryList>("/api/v1/catalog/review-summaries?ids=DEMO-P101,missing"))!;
        Assert.Equal([1, 0], summaries.Items.Select(summary => summary.Count));

        // A second submission replaces the first and waits for moderation again.
        var again = await Read<MyReview>(await Send(client, HttpMethod.Post, "/api/v1/me/reviews", token, request with { Rating = 4, Body = "Bir süre kullandım, hâlâ memnunum." }));
        Assert.Equal(mine.Id, again.Id);
        Assert.Empty((await client.GetFromJsonAsync<ReviewPage>("/api/v1/catalog/products/DEMO-P101/reviews"))!.Items);
        Assert.Single(await Read<MyReview[]>(await Send(client, HttpMethod.Get, "/api/v1/me/reviews", token)));

        var inbox = await Read<Xinobi.Api.Notifications.Inbox>(await Send(client, HttpMethod.Get, "/api/v1/me/notifications", token));
        Assert.Contains(inbox.Items, notification => notification.Kind == "review_approved");
    }

    [Fact]
    public async Task ProductSpecsAreValidatedAndPublished()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var state = (await client.GetFromJsonAsync<CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.First(item => item.Id == "DEMO-P101");
        var duplicate = await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", product with { Specs = [new("Güç", "1650 W"), new("güç", "1700 W")] });
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        var empty = await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", product with { Specs = [new("Güç", " ")] });
        Assert.Equal(HttpStatusCode.BadRequest, empty.StatusCode);
        (await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", product with { Specs = [new(" Güç ", "1650 W"), new("Kapasite", "1,7 L")] })).EnsureSuccessStatusCode();
        var detail = (await client.GetFromJsonAsync<ProductDetail>($"/api/v1/catalog/products/{product.Id}"))!;
        Assert.Equal([new ProductSpec("Güç", "1650 W"), new ProductSpec("Kapasite", "1,7 L")], detail.Specs);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
