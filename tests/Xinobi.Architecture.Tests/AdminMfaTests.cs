using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;

namespace Xinobi.Architecture.Tests;

public sealed class AdminMfaTests
{
    private sealed class CapturingEmail : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public string? Delivered { get; private set; }
        public VerificationPurpose Purpose { get; private set; }
        public Task Send(string email, string code, CancellationToken cancellationToken)
        { Delivered = code; return Task.CompletedTask; }
        public Task Send(string email, string code, VerificationPurpose purpose, CancellationToken cancellationToken)
        { Purpose = purpose; return Send(email, code, cancellationToken); }
    }

    [Fact]
    public async Task RealEmailDeliversSecretsWithoutExposingThemInResponses()
    {
        using var factory = new IsolatedApiFactory();
        var environment = factory.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Staff", "delivery@example.invalid", "initial-password-1");
        await accounts.AssignRole(account.Email, Roles.SuperAdmin);
        account = (await accounts.FindById(account.Id))!;
        var sender = new CapturingEmail();
        var mfa = new AdminMfa(sender, TimeProvider.System, environment);
        var challenge = await mfa.Start(account, CancellationToken.None);
        Assert.Null(challenge.PreviewCode);
        Assert.Equal(VerificationPurpose.AdminMfa, sender.Purpose);
        Assert.Equal(account.Id, (await mfa.Consume(challenge.ChallengeId, sender.Delivered!)).AccountId);
        var recovery = new AdminPasswordRecovery(accounts, TimeProvider.System, environment, sender);
        Assert.Null((await recovery.Start(account.Email)).PreviewUrl);
        Assert.Equal(VerificationPurpose.AdminPasswordReset, sender.Purpose);
        var token = Uri.UnescapeDataString(new Uri(sender.Delivered!).Fragment.Split('=')[1]);
        await recovery.Complete(token, "replacement-password-2");
        Assert.NotNull(await accounts.Login(account.Email, "replacement-password-2"));

        environment.EnvironmentName = "Production";
        // Real email must not enable non-persistent production security state.
        Assert.Equal(503, (await Assert.ThrowsAsync<AccountException>(() => mfa.Start(account, CancellationToken.None))).Status);
        Assert.Equal(503, (await Assert.ThrowsAsync<AccountException>(() => recovery.Start(account.Email))).Status);
    }

    [Fact]
    public async Task PreviewSecurityFlowsFailClosedOutsideDevelopmentAndResetLinksExpire()
    {
        using var factory = new IsolatedApiFactory();
        var environment = factory.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var clock = new Clock();
        var sender = new PreviewVerificationEmailSender();
        var account = await accounts.Register("Staff", "expiration@example.invalid", "initial-password-1");
        await accounts.AssignRole(account.Email, Roles.SuperAdmin);
        var recovery = new AdminPasswordRecovery(accounts, clock, environment, sender);
        var started = await recovery.Start(account.Email);
        var token = Uri.UnescapeDataString(new Uri(started.PreviewUrl!).Fragment.Split('=')[1]);
        clock.Now = clock.Now.AddMinutes(11);
        await Assert.ThrowsAsync<AccountException>(()=>recovery.Complete(token,"replacement-password-2"));
        Assert.NotNull(await accounts.Login(account.Email,"initial-password-1"));
        var previous = environment.EnvironmentName;
        try
        {
            environment.EnvironmentName = "Production";
            var error = await Assert.ThrowsAsync<AccountException>(()=>new AdminMfa(sender,clock,environment).Start(account,CancellationToken.None));
            Assert.Equal(503,error.Status);
            error = await Assert.ThrowsAsync<AccountException>(()=>recovery.Start(account.Email));
            Assert.Equal(503,error.Status);
        }
        finally { environment.EnvironmentName = previous; }
    }
    [Fact]
    public async Task ConsoleRecoveryInvalidatesPendingMfaAndCustomerHasNoResetLink()
    {
        using var factory = new IsolatedApiFactory().WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVerificationEmailSender>();
            services.AddSingleton<IVerificationEmailSender, PreviewVerificationEmailSender>();
        }));
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var owner = await accounts.Register("Owner", "pending@example.invalid", "initial-password-1");
        await accounts.AssignRole(owner.Email, Roles.SuperAdmin);
        var challenge = (await (await client.PostAsJsonAsync("/api/v1/auth/admin/login", new LoginAccount(owner.Email, "initial-password-1"))).Content.ReadFromJsonAsync<AdminMfaChallenge>())!;
        Assert.True(await accounts.ResetPasswordForRole(owner.Email, Roles.SuperAdmin, "replacement-password-2"));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, challenge.PreviewCode!))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        var customer = await accounts.Register("Customer", "customer@example.invalid", "customer-password-1");
        var reset = (await (await client.PostAsJsonAsync("/api/v1/auth/admin/password-reset", new StartAdminPasswordReset(customer.Email))).Content.ReadFromJsonAsync<AdminPasswordResetStarted>())!;
        Assert.Null(reset.PreviewUrl);
        Assert.NotNull(await accounts.Login(customer.Email, "customer-password-1"));
    }
    private sealed class Clock : TimeProvider
    {
        public DateTimeOffset Now { get; set; } = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => Now;
    }
    [Fact]
    public async Task ChallengesExpireLimitAttemptsAndConsumeOnlyOnce()
    {
        using var factory = new IsolatedApiFactory();
        var clock = new Clock();
        var mfa = new AdminMfa(new PreviewVerificationEmailSender(), clock,
            factory.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>());
        var account = new AccountRecord(Guid.NewGuid().ToString("N"), "Staff", "staff@example.invalid", "not-a-real-hash", clock.Now, [Roles.Admin], Kind: AccountKinds.Staff);
        var challenge = await mfa.Start(account, CancellationToken.None);
        for(var i=0;i<5;i++) await Assert.ThrowsAsync<AccountException>(() => mfa.Consume(challenge.ChallengeId, "bad"));
        await Assert.ThrowsAsync<AccountException>(() => mfa.Consume(challenge.ChallengeId, challenge.PreviewCode!));
        clock.Now = clock.Now.AddMinutes(2);
        challenge = await mfa.Start(account, CancellationToken.None);
        clock.Now = clock.Now.AddMinutes(11);
        await Assert.ThrowsAsync<AccountException>(() => mfa.Consume(challenge.ChallengeId, challenge.PreviewCode!));
        challenge = await mfa.Start(account, CancellationToken.None);
        var current = challenge;
        var outcomes = await Task.WhenAll(Enumerable.Range(0,8).Select(async _ =>
        {
            try { await mfa.Consume(current.ChallengeId, current.PreviewCode!); return true; }
            catch(AccountException) { return false; }
        }));
        Assert.Single(outcomes, x=>x);
    }
    [Fact]
    public async Task PasswordInvitationRefreshAndRecoveryCannotBypassMfa()
    {
        using var factory = new IsolatedApiFactory().WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVerificationEmailSender>();
            services.AddSingleton<IVerificationEmailSender, PreviewVerificationEmailSender>();
        }));
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var owner = await accounts.Register("Owner", "mfa-owner@example.invalid", "initial-password-1");
        Assert.Equal(0, await SuperAdminBootstrap.Run(accounts, owner.Email, new StringWriter()));
        var legacyTokens = await accounts.IssueTokens(owner.Id);
        client.DefaultRequestHeaders.Authorization = new("Bearer", legacyTokens.AccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        client.DefaultRequestHeaders.Authorization = null;
        client.DefaultRequestHeaders.Add("Cookie", WebSessionCookies.Refresh + "=" + legacyTokens.RefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/admin/refresh", new {})).StatusCode);
        client.DefaultRequestHeaders.Remove("Cookie");
        var login = await client.PostAsJsonAsync("/api/v1/auth/admin/login", new LoginAccount(owner.Email, "initial-password-1"));
        var challenge = (await login.Content.ReadFromJsonAsync<AdminMfaChallenge>())!;
        Assert.Equal(6, challenge.PreviewCode!.Length);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, "bad"))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, challenge.PreviewCode))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, challenge.PreviewCode))).StatusCode);

        var reset = (await (await client.PostAsJsonAsync("/api/v1/auth/admin/password-reset", new StartAdminPasswordReset(owner.Email))).Content.ReadFromJsonAsync<AdminPasswordResetStarted>())!;
        var token = Uri.UnescapeDataString(new Uri(reset.PreviewUrl!).Fragment.Split('=')[1]);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/admin/password-reset/complete", new CompleteAdminPasswordReset(token, "replacement-password-2"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/admin/password-reset/complete", new CompleteAdminPasswordReset(token, "replacement-password-3"))).StatusCode);
        Assert.Null(await accounts.Login(owner.Email, "initial-password-1"));

        var invitationToken = AccountRules.NewToken();
        await accounts.CreateAdminInvitation("mfa-staff@example.invalid", owner.Id, invitationToken);
        var accept = await client.PostAsJsonAsync("/api/v1/auth/admin-invitations/accept", new AcceptAdminInvitation(invitationToken, "Staff", "staff-password-1"));
        Assert.Equal(HttpStatusCode.OK, accept.StatusCode);
        Assert.NotNull((await accept.Content.ReadFromJsonAsync<AdminMfaChallenge>())!.PreviewCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
    }
}
