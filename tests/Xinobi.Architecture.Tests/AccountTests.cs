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

namespace Xinobi.Architecture.Tests;

/// <summary>
/// Shared account contract (/api/v1/auth, /api/v1/me). The e-mail sender is replaced in DI, because the developer's
/// appsettings.Local.json (loaded after test configuration) may select real SMTP delivery. Nothing is ever sent.
/// </summary>
public sealed class AccountTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-account-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory(string environment = "Development") => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment(environment);
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVerificationEmailSender>();
            services.AddSingleton<IVerificationEmailSender>(sender);
        });
    });

    private readonly RecordingPreviewSender sender = new();

    /// <summary>Preview delivery that also proves no real sender was used.</summary>
    private sealed class RecordingPreviewSender : IVerificationEmailSender
    {
        public int Sent;
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) { Interlocked.Increment(ref Sent); return Task.CompletedTask; }
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    private static async Task<AccountEmailVerification> Verify(HttpClient client, string email)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification(email));
        response.EnsureSuccessStatusCode();
        var challenge = (await response.Content.ReadFromJsonAsync<AccountEmailVerification>())!;
        Assert.Matches("^[0-9]{6}$", challenge.PreviewCode);
        return challenge;
    }

    private static async Task<AuthSession> Register(HttpClient client, string email = "ayse@example.com", string password = "guclu-parola-1")
    {
        var challenge = await Verify(client, email);
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe Yılmaz", email, password, challenge.VerificationId, challenge.PreviewCode!));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<AuthSession>())!;
    }

    private static async Task<HttpResponseMessage> Me(HttpClient client, string? token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/me");
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    [Fact]
    public async Task RegistrationRequiresTheEmailCode()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var challenge = await Verify(client, "ayse@example.com");
        var wrong = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe", "ayse@example.com", "guclu-parola-1", challenge.VerificationId, "000000" == challenge.PreviewCode ? "111111" : "000000"));
        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        Assert.Equal("verification_failed", await Code(wrong));
        var weak = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe", "ayse@example.com", "kisa", challenge.VerificationId, challenge.PreviewCode!));
        Assert.Equal("weak_password", await Code(weak));
    }

    [Fact]
    public async Task RegisterLoginAndProfile()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var session = await Register(client);
        Assert.Equal("ayse@example.com", session.Account.Email);
        Assert.True(session.AccessTokenExpiresAt < session.RefreshTokenExpiresAt);
        var profile = (await (await Me(client, session.AccessToken)).Content.ReadFromJsonAsync<AccountProfile>())!;
        Assert.Equal("Ayşe Yılmaz", profile.Name);

        // A second code for the same address within a minute is rate limited, so ask a fresh API instance over the same data.
        using var other = Factory();
        using var otherClient = other.CreateClient();
        var duplicate = await Verify(otherClient, "AYSE@example.com");
        var again = await otherClient.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Başka", "AYSE@example.com", "baska-parola-1", duplicate.VerificationId, duplicate.PreviewCode!));
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal("email_taken", await Code(again));

        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount(" Ayse@Example.com ", "guclu-parola-1"));
        login.EnsureSuccessStatusCode();
        // Wrong password and unknown e-mail look identical.
        foreach (var attempt in new[] { new LoginAccount("ayse@example.com", "yanlis-parola"), new LoginAccount("yok@example.com", "guclu-parola-1"), new LoginAccount("gecersiz", "x") })
        {
            var response = await client.PostAsJsonAsync("/api/v1/auth/login", attempt);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            Assert.Equal("invalid_credentials", await Code(response));
        }
    }

    [Fact]
    public async Task RefreshRotatesAndReuseRevokesTheFamily()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var first = await Register(client);
        var second = (await (await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshSession(first.RefreshToken))).Content.ReadFromJsonAsync<AuthSession>())!;
        Assert.NotEqual(first.RefreshToken, second.RefreshToken);
        Assert.Equal(HttpStatusCode.OK, (await Me(client, second.AccessToken)).StatusCode);

        var replay = await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshSession(first.RefreshToken));
        Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);
        Assert.Equal("invalid_refresh_token", await Code(replay));
        // The legitimate newer token is revoked too, and the family's access token stops working.
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshSession(second.RefreshToken))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Me(client, second.AccessToken)).StatusCode);
    }

    [Fact]
    public async Task LogoutEndsTheSessionAndProfileNeedsAToken()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var session = await Register(client);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/logout", new LogoutSession(session.RefreshToken))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshSession(session.RefreshToken))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Me(client, session.AccessToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Me(client, null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Me(client, "made-up-token")).StatusCode);
    }

    [Fact]
    public async Task AccountsSurviveARestartAndStoreNoPlainSecrets()
    {
        string refresh;
        using (var factory = Factory())
        using (var client = factory.CreateClient())
            refresh = (await Register(client, password: "kalici-parola-9")).RefreshToken;
        using var restarted = Factory();
        using var again = restarted.CreateClient();
        (await again.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "kalici-parola-9"))).EnsureSuccessStatusCode();
        var stored = await File.ReadAllTextAsync(Path.Combine(directory, "identity", "accounts.json"));
        Assert.DoesNotContain("kalici-parola-9", stored);
        Assert.DoesNotContain(refresh, stored);
    }

    [Fact]
    public async Task ProductionAnswersUnavailable()
    {
        using var factory = Factory("Production");
        using var client = factory.CreateClient();
        foreach (var response in new[]
                 {
                     await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification("ayse@example.com")),
                     await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "guclu-parola-1")),
                 })
        {
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            Assert.Equal("account_unavailable", await Code(response));
        }
    }

    [Fact]
    public async Task TestsNeverUseARealEmailSender()
    {
        using var factory = Factory();
        Assert.Same(sender, factory.Services.GetRequiredService<IVerificationEmailSender>());
        using var client = factory.CreateClient();
        await Verify(client, "ayse@example.com");
        Assert.Equal(1, sender.Sent);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, recursive: true);
    }
}
