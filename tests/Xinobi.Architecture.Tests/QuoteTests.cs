using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;
using Xinobi.Api.Quotes;

namespace Xinobi.Architecture.Tests;

/// <summary>Corporate quote requests: public form, tracking by code + e-mail, panel offer, customer decision. No mail leaves (worker off, example.com).</summary>
public sealed class QuoteTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-quote-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
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

    private static CreateQuote Request(int quantity = 25, string email = "satin.alma@example.com") =>
        new("Örnek Teknoloji A.Ş.", "Ayşe Yılmaz", email, "0532 123 45 67", "1234567890", [new("DEMO-P101", quantity)], true, "Logo ön yüzde", DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(2)), "Kurumsal hediye", "Aralık başında teslim");

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    private static async Task<T> Read<T>(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    [Fact]
    public async Task RequestsAreValidated()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        Assert.Equal("invalid_quantity", await Code(await client.PostAsJsonAsync("/api/v1/quotes", Request(quantity: 5))));
        Assert.Equal("invalid_email", await Code(await client.PostAsJsonAsync("/api/v1/quotes", Request(email: "yok"))));
        Assert.Equal("invalid_items", await Code(await client.PostAsJsonAsync("/api/v1/quotes", Request() with { Items = [new("missing", 20)] })));
        Assert.Equal("invalid_date", await Code(await client.PostAsJsonAsync("/api/v1/quotes", Request() with { DesiredDate = new DateOnly(2020, 1, 1) })));
        Assert.Equal("invalid_purpose", await Code(await client.PostAsJsonAsync("/api/v1/quotes", Request() with { Purpose = "Başka" })));
    }

    [Fact]
    public async Task AQuoteIsTrackedOfferedAndAccepted()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var quote = await Read<Quote>(await client.PostAsJsonAsync("/api/v1/quotes", Request()));
        Assert.Matches("^Q-[0-9]{6}-[0-9]{4}$", quote.Code);
        Assert.Equal((QuoteStatuses.Received, "+905321234567", 25), (quote.Status, quote.Phone, quote.Items.Single().Quantity));

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/quotes/{quote.Code}?email=baskasi@example.com")).StatusCode);
        var tracked = await Read<Quote>(await client.GetAsync($"/api/v1/quotes/{quote.Code.ToLowerInvariant()}?email=SATIN.ALMA@example.com"));
        Assert.Equal(quote.Id, tracked.Id);
        Assert.Equal("no_offer", await Code(await client.PostAsJsonAsync($"/api/v1/quotes/{quote.Code}/decision", new QuoteDecision(quote.Email, "accept", null))));
        await Read<Quote>(await client.PostAsJsonAsync($"/api/v1/quotes/{quote.Code}/messages", new TrackQuoteMessage(quote.Email, "Renk seçenekleri neler?")));

        // Panel: review, answer, offer.
        Assert.Single(await Read<Quote[]>(await client.GetAsync("/api/v1/local-commerce/quotes?status=received")));
        await Read<Quote>(await client.PostAsJsonAsync($"/api/v1/local-commerce/quotes/{quote.Id}/status", new SetQuoteStatus(QuoteStatuses.Reviewing, null)));
        await Read<Quote>(await client.PostAsJsonAsync($"/api/v1/local-commerce/quotes/{quote.Id}/messages", new StoreQuoteMessage("Dört renk sunabiliriz.")));
        var missingPrice = await client.PostAsJsonAsync($"/api/v1/local-commerce/quotes/{quote.Id}/offer", new MakeQuoteOffer([], DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)), null));
        Assert.Equal(HttpStatusCode.BadRequest, missingPrice.StatusCode);
        var offered = await Read<Quote>(await client.PostAsJsonAsync($"/api/v1/local-commerce/quotes/{quote.Id}/offer", new MakeQuoteOffer([new("DEMO-P101", 199_000)], DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)), "Logo baskı dahil")));
        Assert.Equal((QuoteStatuses.Offered, 25 * 199_000L), (offered.Status, offered.Offer!.Total.AmountMinor));
        Assert.Equal(["customer", "store"], offered.Messages.Select(message => message.From));

        var accepted = await Read<Quote>(await client.PostAsJsonAsync($"/api/v1/quotes/{quote.Code}/decision", new QuoteDecision(quote.Email, "accept", "Onaylıyoruz")));
        Assert.Equal(QuoteStatuses.Accepted, accepted.Status);
        Assert.Equal("quote_closed", await Code(await client.PostAsJsonAsync($"/api/v1/quotes/{quote.Code}/messages", new TrackQuoteMessage(quote.Email, "Bir sorum daha var"))));
        Assert.Equal([QuoteStatuses.Received, QuoteStatuses.Reviewing, QuoteStatuses.Offered, QuoteStatuses.Accepted], accepted.History.Select(item => item.Status));
    }

    [Fact]
    public async Task SignedInRequestsAppearInTheAccount()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var challenge = await Read<AccountEmailVerification>(await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification("ayse@example.com")));
        var token = (await Read<AuthSession>(await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe Yılmaz", "ayse@example.com", "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!)))).AccessToken;
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/quotes") { Content = JsonContent.Create(Request(email: "farkli@example.com")) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        await Read<Quote>(await client.SendAsync(request));
        await Read<Quote>(await client.PostAsJsonAsync("/api/v1/quotes", Request(email: "ayse@example.com")));
        await Read<Quote>(await client.PostAsJsonAsync("/api/v1/quotes", Request(email: "baskasi@example.com")));
        using var mine = new HttpRequestMessage(HttpMethod.Get, "/api/v1/me/quotes");
        mine.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        Assert.Equal(2, (await Read<Quote[]>(await client.SendAsync(mine))).Length);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
