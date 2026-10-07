using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.EmailVerification;

namespace Xinobi.Architecture.Tests;

public sealed class EmailVerificationTests
{
    private sealed class Sender : IVerificationEmailSender
    {
        public bool IsConfigured { get; set; } = true;
        public bool Fail { get; set; }
        public string Code { get; private set; } = "";
        public int Calls { get; private set; }
        public Task Send(string email, string code, CancellationToken token)
        {
            if (Fail) throw new EmailVerificationException("Gönderim başarısız.", 503);
            Code = code; Calls++; return Task.CompletedTask;
        }
    }
    private sealed class Clock : TimeProvider
    {
        public DateTimeOffset Now = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => Now;
    }
    [Fact]
    public async Task CodesAreEmailBoundSingleUseAndResendingInvalidatesOldCode()
    {
        var sender = new Sender(); var clock = new Clock(); var store = new EmailVerificationStore(sender, clock);
        var first = await store.Start("Person@Example.com"); var code = sender.Code;
        Assert.Equal("person@example.com", first.Email);
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Confirm(new(first.Id, "other@example.com", code)));
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Start(first.Email));
        clock.Now = clock.Now.AddMinutes(1);
        var second = await store.Start(first.Email);
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Confirm(new(first.Id, first.Email, code)));
        await store.Confirm(new(second.Id, second.Email, sender.Code));
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Confirm(new(second.Id, second.Email, sender.Code)));
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Start(first.Email));
    }
    [Fact]
    public async Task ExpirationAndAttemptLimitAreEnforced()
    {
        var sender = new Sender(); var clock = new Clock(); var store = new EmailVerificationStore(sender, clock);
        var challenge = await store.Start("person@example.com");
        for (var i = 0; i < 5; i++) await Assert.ThrowsAsync<EmailVerificationException>(() => store.Confirm(new(challenge.Id, challenge.Email, "bad")));
        var error = await Assert.ThrowsAsync<EmailVerificationException>(() => store.Confirm(new(challenge.Id, challenge.Email, sender.Code)));
        Assert.Equal(429, error.Status);
        clock.Now = clock.Now.AddMinutes(1);
        challenge = await store.Start(challenge.Email);
        clock.Now = clock.Now.AddMinutes(10);
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Confirm(new(challenge.Id, challenge.Email, sender.Code)));
    }
    [Fact]
    public async Task MissingConfigurationInvalidEmailAndFailedDeliveryNeverIssueAChallenge()
    {
        var sender = new Sender { IsConfigured = false }; var store = new EmailVerificationStore(sender, TimeProvider.System);
        var error = await Assert.ThrowsAsync<EmailVerificationException>(() => store.Start("person@example.com"));
        Assert.Equal(503, error.Status);
        sender.IsConfigured = true;
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Start("invalid"));
        sender.Fail = true;
        await Assert.ThrowsAsync<EmailVerificationException>(() => store.Start("person@example.com"));
        sender.Fail = false;
        await store.Start("person@example.com");
        Assert.Equal(1, sender.Calls);
    }
    [Fact]
    public async Task HttpFlowDoesNotExposeCodeAndRejectsUntrustedOrigins()
    {
        var sender = new Sender();
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.ConfigureServices(services => { services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(sender); });
        });
        using var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/email-verification/start", new { email = "person@example.com" });
        response.EnsureSuccessStatusCode();
        Assert.DoesNotContain(sender.Code, await response.Content.ReadAsStringAsync());
        var challenge = (await response.Content.ReadFromJsonAsync<VerificationChallenge>())!;
        var confirm = await client.PostAsJsonAsync("/api/v1/email-verification/confirm", new { id = challenge.Id, email = challenge.Email, code = sender.Code });
        confirm.EnsureSuccessStatusCode();
        client.DefaultRequestHeaders.Add("Origin", "https://untrusted.example");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/email-verification/start", new { email = "other@example.com" })).StatusCode);
    }
    [Fact]
    public async Task DemoVerificationIsUnavailableInProduction()
    {
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder => builder.UseEnvironment("Production"));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/v1/email-verification/start", new { email = "person@example.com" })).StatusCode);
    }
}
