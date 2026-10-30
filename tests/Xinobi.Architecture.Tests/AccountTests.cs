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

    private WebApplicationFactory<Program> Factory(string environment = "Development") => new IsolatedApiFactory(directory).WithWebHostBuilder(builder =>
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
        public VerificationPurpose? LastPurpose;
        public Task Send(string email, string code, CancellationToken cancellationToken) { Interlocked.Increment(ref Sent); return Task.CompletedTask; }
        public Task Send(string email, string code, VerificationPurpose purpose, CancellationToken cancellationToken) { LastPurpose = purpose; return Send(email, code, cancellationToken); }
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
    public async Task PasswordResetSetsTheNewPasswordAndSignsOutEveryDevice()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Ayşe Yılmaz", "ayse@example.com", "eski-parola-1");
        var oldSession = await accounts.IssueTokens(account.Id);

        var start = await client.PostAsJsonAsync("/api/v1/auth/password-reset", new StartPasswordReset("Ayse@Example.com"));
        start.EnsureSuccessStatusCode();
        var challenge = (await start.Content.ReadFromJsonAsync<AccountEmailVerification>())!;
        Assert.Equal(1, sender.Sent);
        Assert.Equal(VerificationPurpose.PasswordReset, sender.LastPurpose);

        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/password-reset/confirm",
            new ConfirmPasswordReset("ayse@example.com", challenge.VerificationId, challenge.PreviewCode!, "kisa"))).StatusCode);
        var confirm = await client.PostAsJsonAsync("/api/v1/auth/password-reset/confirm",
            new ConfirmPasswordReset("ayse@example.com", challenge.VerificationId, challenge.PreviewCode!, "yeni-parola-12"));
        Assert.Equal(HttpStatusCode.NoContent, confirm.StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized, (await Me(client, oldSession.AccessToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshSession(oldSession.RefreshToken))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "eski-parola-1"))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "yeni-parola-12"))).StatusCode);
        // The code is single use.
        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync("/api/v1/auth/password-reset/confirm",
            new ConfirmPasswordReset("ayse@example.com", challenge.VerificationId, challenge.PreviewCode!, "baska-parola-12"))).StatusCode);
    }

    [Fact]
    public async Task PasswordResetForAnUnknownAddressLooksTheSameAndSendsNothing()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        await factory.Services.GetRequiredService<IAccountStore>().Register("Ayşe Yılmaz", "ayse@example.com", "eski-parola-1");

        var unknown = await client.PostAsJsonAsync("/api/v1/auth/password-reset", new StartPasswordReset("kimse@example.com"));
        Assert.Equal(HttpStatusCode.OK, unknown.StatusCode);
        var challenge = (await unknown.Content.ReadFromJsonAsync<AccountEmailVerification>())!;
        Assert.Equal("kimse@example.com", challenge.Email);
        Assert.Null(challenge.PreviewCode);
        Assert.Equal(0, sender.Sent);

        // Known and unknown addresses share the one-minute cooldown, so a repeat cannot tell them apart either.
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/password-reset", new StartPasswordReset("ayse@example.com"))).StatusCode);
        foreach (var email in new[] { "kimse@example.com", "ayse@example.com" })
        {
            var repeat = await client.PostAsJsonAsync("/api/v1/auth/password-reset", new StartPasswordReset(email));
            Assert.Equal(HttpStatusCode.TooManyRequests, repeat.StatusCode);
            Assert.Equal("verification_rate_limited", await Code(repeat));
        }

        var guess = await client.PostAsJsonAsync("/api/v1/auth/password-reset/confirm", new ConfirmPasswordReset("kimse@example.com", challenge.VerificationId, "123456", "yeni-parola-12"));
        Assert.Equal(HttpStatusCode.BadRequest, guess.StatusCode);
        Assert.Equal("verification_failed", await Code(guess));
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

    private static async Task<HttpResponseMessage> Authorized(HttpClient client, HttpMethod method, string path, string token, object? body = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    [Fact]
    public async Task AccountHolderCanRenameThemselves()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var session = await Register(client);
        var renamed = await Authorized(client, HttpMethod.Patch, "/api/v1/me", session.AccessToken, new UpdateMyAccount("  Ayşe Kaya "));
        renamed.EnsureSuccessStatusCode();
        Assert.Equal("Ayşe Kaya", (await renamed.Content.ReadFromJsonAsync<AccountProfile>())!.Name);
        Assert.Equal("Ayşe Kaya", (await (await Me(client, session.AccessToken)).Content.ReadFromJsonAsync<AccountProfile>())!.Name);
        var empty = await Authorized(client, HttpMethod.Patch, "/api/v1/me", session.AccessToken, new UpdateMyAccount("  "));
        Assert.Equal("invalid_name", await Code(empty));
        using var anonymous = new HttpRequestMessage(HttpMethod.Patch, "/api/v1/me") { Content = JsonContent.Create(new UpdateMyAccount("X")) };
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(anonymous)).StatusCode);
    }

    [Fact]
    public async Task PasswordChangeSignsOutOtherSessionsAndKeepsTheCurrentOne()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var session = await Register(client, password: "eski-parola-1");
        var other = (await (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "eski-parola-1"))).Content.ReadFromJsonAsync<AuthSession>())!;

        var wrong = await Authorized(client, HttpMethod.Put, "/api/v1/me/password", session.AccessToken, new ChangeMyPassword("yanlis-parola", "yeni-parola-1"));
        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        Assert.Equal("wrong_password", await Code(wrong));
        Assert.Equal("weak_password", await Code(await Authorized(client, HttpMethod.Put, "/api/v1/me/password", session.AccessToken, new ChangeMyPassword("eski-parola-1", "kisa"))));

        var changed = await Authorized(client, HttpMethod.Put, "/api/v1/me/password", session.AccessToken, new ChangeMyPassword("eski-parola-1", "yeni-parola-1"));
        changed.EnsureSuccessStatusCode();
        var fresh = (await changed.Content.ReadFromJsonAsync<AuthSession>())!;
        Assert.Equal(HttpStatusCode.OK, (await Me(client, fresh.AccessToken)).StatusCode);
        foreach (var stale in new[] { session.AccessToken, other.AccessToken })
            Assert.Equal(HttpStatusCode.Unauthorized, (await Me(client, stale)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshSession(other.RefreshToken))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "eski-parola-1"))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "yeni-parola-1"))).StatusCode);
    }

    [Fact]
    public async Task WebPasswordChangeRenewsCookiesAndNeedsTheCsrfHeader()
    {
        using var factory = Factory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        await Register(client, password: "web-parola-12");
        using var login = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/web/login") { Content = JsonContent.Create(new LoginAccount("ayse@example.com", "web-parola-12")) };
        login.Headers.Add("X-Xinobi-Csrf", "1");
        var access = (await client.SendAsync(login)).Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("xinobi_customer_at=")).Split(';')[0];

        async Task<HttpResponseMessage> Change(bool csrf)
        {
            using var message = new HttpRequestMessage(HttpMethod.Put, "/api/v1/me/password") { Content = JsonContent.Create(new ChangeMyPassword("web-parola-12", "web-parola-34")) };
            message.Headers.Add("Cookie", access);
            if (csrf) message.Headers.Add("X-Xinobi-Csrf", "1");
            return await client.SendAsync(message);
        }

        Assert.Equal(HttpStatusCode.Unauthorized, (await Change(csrf: false)).StatusCode);
        var changed = await Change(csrf: true);
        Assert.Equal(HttpStatusCode.NoContent, changed.StatusCode);
        Assert.Contains(changed.Headers.GetValues("Set-Cookie"), c => c.StartsWith("xinobi_customer_at=") && c.Contains("httponly", StringComparison.OrdinalIgnoreCase));
        Assert.Empty(await changed.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task WebSessionUsesHttpOnlyCookiesWithCsrfHeader()
    {
        using var factory = Factory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        await Register(client, password: "web-parola-12");
        var login = new LoginAccount("ayse@example.com", "web-parola-12");

        var noHeader = await client.PostAsJsonAsync("/api/v1/auth/web/login", login);
        Assert.Equal(HttpStatusCode.Forbidden, noHeader.StatusCode);
        Assert.Equal("csrf_required", await Code(noHeader));

        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/web/login") { Content = JsonContent.Create(login) };
        request.Headers.Add("X-Xinobi-Csrf", "1");
        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var cookies = response.Headers.GetValues("Set-Cookie").ToArray();
        Assert.Contains(cookies, c => c.StartsWith("xinobi_customer_at=") && c.Contains("httponly", StringComparison.OrdinalIgnoreCase) && c.Contains("samesite=lax", StringComparison.OrdinalIgnoreCase) && c.Contains("path=/api/v1"));
        Assert.Contains(cookies, c => c.StartsWith("xinobi_customer_rt=") && c.Contains("httponly", StringComparison.OrdinalIgnoreCase) && c.Contains("path=/api/v1/auth"));
        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("Token", body, StringComparison.OrdinalIgnoreCase);
        var access = cookies.Single(c => c.StartsWith("xinobi_customer_at=")).Split(';')[0];
        var refresh = cookies.Single(c => c.StartsWith("xinobi_customer_rt=")).Split(';')[0];

        async Task<HttpResponseMessage> Send(HttpMethod method, string path, string cookie, bool csrf)
        {
            using var message = new HttpRequestMessage(method, path);
            message.Headers.Add("Cookie", cookie);
            if (csrf) message.Headers.Add("X-Xinobi-Csrf", "1");
            if (method == HttpMethod.Post) message.Content = JsonContent.Create(new { });
            return await client.SendAsync(message);
        }

        Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Get, "/api/v1/me", access, csrf: false)).StatusCode);
        var refreshed = await Send(HttpMethod.Post, "/api/v1/auth/web/refresh", refresh, csrf: true);
        refreshed.EnsureSuccessStatusCode();
        var newRefresh = refreshed.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("xinobi_customer_rt=")).Split(';')[0];
        Assert.NotEqual(refresh, newRefresh);
        var logout = await Send(HttpMethod.Post, "/api/v1/auth/web/logout", newRefresh, csrf: true);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Contains(logout.Headers.GetValues("Set-Cookie"), c => c.StartsWith("xinobi_customer_rt=;") && c.Contains("expires=Thu, 01 Jan 1970", StringComparison.OrdinalIgnoreCase));
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(HttpMethod.Post, "/api/v1/auth/web/refresh", newRefresh, csrf: true)).StatusCode);
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
