using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;
using Xinobi.Persistence;

namespace Xinobi.Architecture.Tests;

public sealed class AdminMfaSqlTests
{
    private sealed class DeliveredEmail : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public string? Secret { get; private set; }
        public Task Send(string email, string code, CancellationToken cancellationToken)
        { Secret = code; return Task.CompletedTask; }
    }

    [SqlWritesFact]
    public async Task ProductionEmailMfaAndRecoveryUseSqlWithoutPreviewSecrets()
    {
        var sender = new DeliveredEmail();
        using var factory = Factory(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!).WithWebHostBuilder(builder =>
        {
            builder.UseSetting("environment", "Production");
            builder.UseSetting("Accounts:StorageProvider", "SqlServer");
            builder.UseSetting("Email:DeliveryMode", "Smtp");
            builder.UseSetting("Admin:PublicOrigin", "http://109.104.120.91:8014");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IVerificationEmailSender>();
                services.AddSingleton<IVerificationEmailSender>(sender);
            });
        });
        using var client = Client(factory);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var email = Guid.NewGuid().ToString("N") + "@production-mfa.invalid";
        var owner = await accounts.Register("Production Test", email, "initial-password-1");
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        try
        {
            await accounts.AssignRole(email, Roles.SuperAdmin);
            var login = await client.PostAsJsonAsync("/api/v1/auth/admin/login", new LoginAccount(email, "initial-password-1"));
            Assert.Equal(HttpStatusCode.OK, login.StatusCode);
            var challenge = (await login.Content.ReadFromJsonAsync<AdminMfaChallenge>())!;
            Assert.Null(challenge.PreviewCode);
            Assert.Equal(6, sender.Secret!.Length);
            var verified = await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, sender.Secret));
            Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
            client.DefaultRequestHeaders.Add("Cookie", Cookies(verified));
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
            var recovery = factory.Services.GetRequiredService<AdminPasswordRecovery>();
            Assert.Null((await recovery.Start(email)).PreviewUrl);
            Assert.StartsWith("http://109.104.120.91:8014/admin/#password-reset=", sender.Secret);
            var token = Uri.UnescapeDataString(new Uri(sender.Secret!).Fragment.Split('=')[1]);
            await recovery.Complete(token, "replacement-password-2");
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
            Assert.NotNull(await accounts.Login(email, "replacement-password-2"));
            await Assert.ThrowsAsync<AccountException>(() => recovery.Complete(token, "replacement-password-3"));
        }
        finally { await db.Users.Where(x => x.Id == Guid.Parse(owner.Id)).ExecuteDeleteAsync(); }
    }

    private sealed class RefuseAudit : SaveChangesInterceptor
    {
        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData data,InterceptionResult<int> result,CancellationToken cancellationToken=default)
        {
            if(data.Context!.ChangeTracker.Entries<Xinobi.Persistence.Entities.AuditLog>().Any(x=>x.State==EntityState.Added))
                throw new InvalidOperationException("Test audit failure");
            return ValueTask.FromResult(result);
        }
    }
    [SqlWritesFact]
    public async Task MfaDeploymentSqlCanBeRepeated()
    {
        var directory=new DirectoryInfo(AppContext.BaseDirectory);
        while(directory is not null&&!File.Exists(Path.Combine(directory.FullName,"XinobiYeni.slnx")))directory=directory.Parent;
        var script=await File.ReadAllTextAsync(Path.Combine(directory!.FullName,"infra/db/migrations/0008_AdminMfaPersistence.idempotent.sql"));
        script += "\nGO\n"+await File.ReadAllTextAsync(Path.Combine(directory.FullName,"infra/db/migrations/0009_AdminPasswordResetPersistence.idempotent.sql"));
        await using var connection=new Microsoft.Data.SqlClient.SqlConnection(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        await connection.OpenAsync();
        for(var i=0;i<2;i++)
            foreach(var batch in System.Text.RegularExpressions.Regex.Split(script,@"^GO\s*$",System.Text.RegularExpressions.RegexOptions.Multiline|System.Text.RegularExpressions.RegexOptions.IgnoreCase))
            {
                if(string.IsNullOrWhiteSpace(batch))continue;
                await using var command=connection.CreateCommand();command.CommandText=batch;await command.ExecuteNonQueryAsync();
            }
        await using var check=connection.CreateCommand();
        check.CommandText="SELECT COUNT(*) FROM __EFMigrationsHistory WHERE MigrationId LIKE '%AdminMfaPersistence'";
        Assert.Equal(1,Convert.ToInt32(await check.ExecuteScalarAsync()));
        check.CommandText="SELECT COUNT(*) FROM __EFMigrationsHistory WHERE MigrationId LIKE '%AdminPasswordResetPersistence'";
        Assert.Equal(1,Convert.ToInt32(await check.ExecuteScalarAsync()));
    }
    [SqlWritesFact]
    public async Task ResetLinksSurviveHostsAndConsumeAtomically()
    {
        var connection=Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!;
        using var first=Factory(connection);
        var accounts=first.Services.GetRequiredService<IAccountStore>();
        var email=Guid.NewGuid().ToString("N")+"@reset-sql.invalid";
        var account=await accounts.Register("Reset Test",email,"initial-password-1");
        var userId=Guid.Parse(account.Id);
        await using var scope=first.Services.CreateAsyncScope();var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        try
        {
            await accounts.AssignRole(email,Roles.SuperAdmin);
            var started=await first.Services.GetRequiredService<AdminPasswordRecovery>().Start(email);
            var token=Uri.UnescapeDataString(new Uri(started.PreviewUrl!).Fragment.Split('=')[1]);
            var row=await db.AdminPasswordResets.AsNoTracking().SingleAsync(x=>x.UserId==userId);
            Assert.NotEqual(token,row.TokenHash);Assert.Null(row.ConsumedAt);
            using var second=Factory(connection);
            Assert.Null((await second.Services.GetRequiredService<AdminPasswordRecovery>().Start(email)).PreviewUrl);
            var before=await accounts.IssueTokens(account.Id);
            using(var failing=Factory(connection,new RefuseAudit()))
                await Assert.ThrowsAsync<InvalidOperationException>(()=>failing.Services.GetRequiredService<AdminPasswordRecovery>().Complete(token,"must-rollback-password-3"));
            Assert.NotNull(await accounts.FindByAccessToken(before.AccessToken));
            Assert.NotNull(await accounts.Login(email,"initial-password-1"));
            Assert.Null((await db.AdminPasswordResets.AsNoTracking().SingleAsync(x=>x.UserId==userId)).ConsumedAt);
            var outcomes=await Task.WhenAll(Enumerable.Range(0,8).Select(async i=>
            {
                try {await (i%2==0?first:second).Services.GetRequiredService<AdminPasswordRecovery>().Complete(token,"replacement-password-2");return true;}
                catch(AccountException error) when(error.Code=="invalid_reset"){return false;}
            }));
            Assert.Single(outcomes,x=>x);
            Assert.Null(await accounts.FindByAccessToken(before.AccessToken));
            await Assert.ThrowsAsync<AccountException>(()=>accounts.Refresh(before.RefreshToken));
            Assert.NotNull(await second.Services.GetRequiredService<IAccountStore>().Login(email,"replacement-password-2"));
            Assert.NotNull((await db.AdminPasswordResets.AsNoTracking().SingleAsync(x=>x.UserId==userId)).ConsumedAt);
            Assert.Single(await db.AuditLogs.Where(x=>x.EntityId==account.Id&&x.Action=="auth.admin-password-reset").ToArrayAsync());
        }
        finally
        {
            await db.AuditLogs.Where(x=>x.EntityId==account.Id&&x.Action=="auth.admin-password-reset").ExecuteDeleteAsync();
            await db.Users.Where(x=>x.Id==userId).ExecuteDeleteAsync();
        }
    }
    private sealed class Clock : TimeProvider
    {
        public DateTimeOffset Now {get;set;}=DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow()=>Now;
    }
    [SqlWritesFact]
    public async Task SqlChallengesAreSharedSingleUseAndAttemptLimited()
    {
        using var factory=Factory(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        var accounts=factory.Services.GetRequiredService<IAccountStore>();
        var email=Guid.NewGuid().ToString("N")+"@mfa-concurrency.invalid";
        var account=await accounts.Register("MFA Test",email,"initial-password-1");
        var userId=Guid.Parse(account.Id);
        var clock=new Clock();
        var scopes=factory.Services.GetRequiredService<IServiceScopeFactory>();
        var first=new SqlAdminMfaStore(scopes,clock);var second=new SqlAdminMfaStore(scopes,clock);
        await using var scope=scopes.CreateAsyncScope();var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        try
        {
            var token=AccountRules.NewToken();
            await first.Start(account,token,"123456",()=>Task.CompletedTask);
            var cooldown=await Assert.ThrowsAsync<AccountException>(()=>second.Start(account,AccountRules.NewToken(),"654321",()=>Task.CompletedTask));
            Assert.Equal(429,cooldown.Status);
            var outcomes=await Task.WhenAll(Enumerable.Range(0,8).Select(async i=>
            {
                try {await (i%2==0?first:second).Consume(token,"123456");return true;}
                catch(AccountException error) when(error.Code=="invalid_mfa"){return false;}
            }));
            Assert.Single(outcomes,x=>x);
            var row=await db.AdminMfaChallenges.AsNoTracking().SingleAsync(x=>x.UserId==userId);
            Assert.NotEqual(token,row.TokenHash);Assert.NotEqual("123456",row.CodeHash);Assert.NotNull(row.ConsumedAt);
            clock.Now=clock.Now.AddMinutes(2);token=AccountRules.NewToken();
            await second.Start(account,token,"123456",()=>Task.CompletedTask);
            await Task.WhenAll(Enumerable.Range(0,8).Select(async i=>
                await Assert.ThrowsAsync<AccountException>(()=>(i%2==0?first:second).Consume(token,"wrong"))));
            var exhausted=await db.AdminMfaChallenges.AsNoTracking().SingleAsync(x=>x.TokenHash==AccountRules.Hash(token));
            Assert.Equal(5,exhausted.Attempts);
            await Assert.ThrowsAsync<AccountException>(()=>first.Consume(token,"123456"));
            clock.Now=clock.Now.AddMinutes(2);token=AccountRules.NewToken();
            await first.Start(account,token,"123456",()=>Task.CompletedTask);
            clock.Now=clock.Now.AddMinutes(11);
            await Assert.ThrowsAsync<AccountException>(()=>second.Consume(token,"123456"));
            var tokens=await accounts.IssueTokens(account.Id);
            await first.Grant(account.Id,tokens,AccountRules.Hash(account.PasswordHash));
            Assert.True(await second.Allowed(tokens.AccessToken,account.Id,AccountRules.Hash(account.PasswordHash)));
            Assert.False(await second.Allowed(tokens.AccessToken,account.Id,"changed-credential"));
        }
        finally{await db.Users.Where(x=>x.Id==userId).ExecuteDeleteAsync();}
    }
    [SqlWritesFact]
    public async Task ExplicitHeadlessUiFixture()
    {
        var mode=Environment.GetEnvironmentVariable("XINOBI_MFA_UI_ACTION");
        if(mode is null)return;
        var marker=Environment.GetEnvironmentVariable("XINOBI_MFA_UI_MARKER");
        Assert.True(Guid.TryParseExact(marker,"N",out _));
        var email=marker+"@mfa-ui.invalid";
        var staffEmail=marker+"-staff@mfa-ui.invalid";
        using var factory=Factory(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        var accounts=factory.Services.GetRequiredService<IAccountStore>();
        if(mode=="provision")
        {
            await accounts.Register("Headless Owner",email,"headless-initial-password-1");
            await accounts.AssignRole(email,Roles.SuperAdmin);
            return;
        }
        Assert.Equal("cleanup",mode);
        await using var scope=factory.Services.CreateAsyncScope();
        var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        var ids=await db.Users.Where(x=>x.NormalizedEmail==email||x.NormalizedEmail==staffEmail).Select(x=>x.Id).ToArrayAsync();
        await db.AdminInvitations.Where(x=>x.NormalizedEmail==staffEmail).ExecuteDeleteAsync();
        await db.AuditLogs.Where(x=>(x.ActorUserId!=null&&ids.Contains(x.ActorUserId.Value))||ids.Select(id=>id.ToString("N")).Contains(x.EntityId)).ExecuteDeleteAsync();
        await db.Users.Where(x=>ids.Contains(x.Id)).ExecuteDeleteAsync();
        Assert.False(await db.Users.AnyAsync(x=>x.NormalizedEmail==email||x.NormalizedEmail==staffEmail));
    }
    private static WebApplicationFactory<Program> Factory(string connection, SaveChangesInterceptor? interceptor=null) => new IsolatedApiFactory().WithWebHostBuilder(builder => builder.ConfigureServices(services =>
    {
        services.RemoveAll<DbContextOptions<XinobiDbContext>>();
        services.AddDbContext<XinobiDbContext>(options=>{options.UseSqlServer(connection);if(interceptor is not null)options.AddInterceptors(interceptor);});
        services.RemoveAll<IAccountStore>();
        services.AddSingleton<IAccountStore>(provider=>provider.GetRequiredService<SqlAccountStore>());
        services.RemoveAll<IVerificationEmailSender>();
        services.AddSingleton<IVerificationEmailSender, PreviewVerificationEmailSender>();
    }));
    private static HttpClient Client(WebApplicationFactory<Program> factory)
    {
        var client=factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies=false });
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader,"1");
        return client;
    }
    private static string Cookies(HttpResponseMessage response) => string.Join("; ",response.Headers.GetValues("Set-Cookie")
        .Where(value=>value.StartsWith(WebSessionCookies.AdminAccess+"=")||value.StartsWith(WebSessionCookies.AdminRefresh+"="))
        .Select(value=>value.Split(';')[0]));

    [SqlWritesFact]
    public async Task SqlLoginRecoveryInvitationAndNewHostPreserveProvenMfaSession()
    {
        var connection=Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!;
        using var factory=Factory(connection);
        using var client=Client(factory);
        var accounts=factory.Services.GetRequiredService<IAccountStore>();
        Assert.IsType<SqlAccountStore>(accounts);
        var marker=Guid.NewGuid().ToString("N");
        var email=marker+"@mfa-sql.invalid";
        var staffEmail=marker+"-staff@mfa-sql.invalid";
        var owner=await accounts.Register("SQL Test",email,"initial-password-1");
        var ownerId=Guid.Parse(owner.Id);
        await using var scope=factory.Services.CreateAsyncScope();
        var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        Guid? staffId=null;
        try
        {
            await accounts.AssignRole(email,Roles.SuperAdmin);
            var login=await client.PostAsJsonAsync("/api/v1/auth/admin/login",new LoginAccount(email,"initial-password-1"));
            var challenge=(await login.Content.ReadFromJsonAsync<AdminMfaChallenge>())!;
            Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/api/v1/admin/session")).StatusCode);
            using var verifierFactory=Factory(connection);
            using var verifierClient=Client(verifierFactory);
            var verified=await verifierClient.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify",new VerifyAdminMfa(challenge.ChallengeId,challenge.PreviewCode!));
            Assert.Equal(HttpStatusCode.OK,verified.StatusCode);
            var cookie=Cookies(verified);
            client.DefaultRequestHeaders.Add("Cookie",cookie);
            Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/api/v1/admin/session")).StatusCode);
            using(var restarted=Factory(connection))
            using(var afterRestart=Client(restarted))
            {
                afterRestart.DefaultRequestHeaders.Add("Cookie",cookie);
                Assert.Equal(HttpStatusCode.OK,(await afterRestart.GetAsync("/api/v1/admin/session")).StatusCode);
                Assert.Equal(HttpStatusCode.OK,(await afterRestart.PostAsJsonAsync("/api/v1/auth/admin/refresh",new {})).StatusCode);
                Assert.NotNull(await restarted.Services.GetRequiredService<IAccountStore>().FindById(owner.Id));
            }
            var invitationToken=AccountRules.NewToken();
            await accounts.CreateAdminInvitation(staffEmail,owner.Id,invitationToken);
            using(var inviteClient=Client(factory))
            {
                var accept=await inviteClient.PostAsJsonAsync("/api/v1/auth/admin-invitations/accept",new AcceptAdminInvitation(invitationToken,"SQL Staff","staff-password-1"));
                Assert.Equal(HttpStatusCode.OK,accept.StatusCode);
                Assert.NotNull((await accept.Content.ReadFromJsonAsync<AdminMfaChallenge>())!.PreviewCode);
                Assert.Equal(HttpStatusCode.Unauthorized,(await inviteClient.GetAsync("/api/v1/admin/session")).StatusCode);
            }
            staffId=Guid.Parse((await accounts.FindStaffByEmail(staffEmail))!.Id);
            var reset=(await (await client.PostAsJsonAsync("/api/v1/auth/admin/password-reset",new StartAdminPasswordReset(email))).Content.ReadFromJsonAsync<AdminPasswordResetStarted>())!;
            var token=Uri.UnescapeDataString(new Uri(reset.PreviewUrl!).Fragment.Split('=')[1]);
            using(var resetHost=Factory(connection))
            using(var resetClient=Client(resetHost))
                Assert.Equal(HttpStatusCode.NoContent,(await resetClient.PostAsJsonAsync("/api/v1/auth/admin/password-reset/complete",new CompleteAdminPasswordReset(token,"replacement-password-2"))).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/api/v1/admin/session")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized,(await client.PostAsJsonAsync("/api/v1/auth/admin/refresh",new {})).StatusCode);
            Assert.False(await db.AccessSessions.AnyAsync(x=>x.UserId==ownerId));
            Assert.False(await db.RefreshSessions.AnyAsync(x=>x.UserId==ownerId&&x.RevokedAt==null));
            Assert.NotNull(await accounts.Login(email,"replacement-password-2"));
        }
        finally
        {
            await db.AdminInvitations.Where(x=>x.NormalizedEmail==staffEmail).ExecuteDeleteAsync();
            await db.AuditLogs.Where(x=>x.EntityId==owner.Id&&x.Action=="auth.admin-password-reset").ExecuteDeleteAsync();
            await db.Users.Where(x=>x.Id==ownerId||x.Id==staffId).ExecuteDeleteAsync();
        }
    }
}
