using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;

namespace Xinobi.Architecture.Tests;

public sealed class AuditTests
{
    [SqlWritesFact]
    public async Task RecoveryAuditsOnlySafeOutcomeAndRevokesSessions()
    {
        var services = new ServiceCollection();
        services.AddXinobiPersistence(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<SqlAccountStore>();
        await using var provider = services.BuildServiceProvider();
        var store = provider.GetRequiredService<SqlAccountStore>();
        var email = Guid.NewGuid().ToString("N") + "@audit-test.invalid";
        var account = await store.Register("Test", email, "initial-test-password-1");
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        var id = Guid.Parse(account.Id);
        var trace = Guid.NewGuid().ToString("N");
        var previous = AuditExecution.Current;
        try
        {
            await store.AssignRole(email, Roles.SuperAdmin);
            var tokens = await store.IssueTokens(account.Id);
            AuditExecution.Current = new AuditActor(null, [], "console.super-admin-password-reset", trace);
            Assert.True(await store.ResetPasswordForRole(email, Roles.SuperAdmin, "replacement-test-password-2"));
            await Assert.ThrowsAsync<AccountException>(() => store.IssueTokens(account.Id, AccountRules.Hash(account.PasswordHash)));
            Assert.False(await store.ResetPasswordForRole(email, Roles.SuperAdmin, "stale-reset-password-3", AccountRules.Hash(account.PasswordHash)));
            Assert.Null(await store.FindByAccessToken(tokens.AccessToken));
            var audit = await db.AuditLogs.SingleAsync(x => x.TraceId == trace);
            Assert.Contains("sessionsRevoked", audit.SafeDiff);
            Assert.DoesNotContain(email, audit.SafeDiff);
            Assert.DoesNotContain("replacement-test-password-2", audit.SafeDiff);
            Assert.DoesNotContain(tokens.AccessToken, audit.SafeDiff);
            Assert.Null(audit.ActorUserId);
        }
        finally
        {
            AuditExecution.Current = previous;
            await db.AuditLogs.Where(x => x.TraceId == trace).ExecuteDeleteAsync();
            await db.Users.Where(x => x.Id == id).ExecuteDeleteAsync();
        }
    }
    [SqlWritesFact]
    public async Task SafeChangesAndAuditCommitOrRollbackTogether()
    {
        var options = new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!).Options;
        var trace = "audit-test-" + Guid.NewGuid().ToString("N");
        var id = Guid.NewGuid();
        var previous = AuditExecution.Current;
        AuditExecution.Current = new AuditActor(id, ["super_admin"], "test.change", trace);
        try
        {
            await using var db = new XinobiDbContext(options);
            await using (var tx = await db.Database.BeginTransactionAsync())
            {
                db.Users.Add(new User { Id = id, Email = "secret@example.invalid", NormalizedEmail = id.ToString(),
                    PasswordHash = "SECRET", Kind = "staff", Status = "active", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow });
                await db.SaveChangesAsync();
                var audit = await db.AuditLogs.SingleAsync(x => x.TraceId == trace);
                Assert.Contains("Kind", audit.SafeDiff);
                Assert.DoesNotContain("SECRET", audit.SafeDiff);
                Assert.DoesNotContain("secret@example.invalid", audit.SafeDiff);
                Assert.Equal(id, audit.ActorUserId);
                await tx.CommitAsync();
            }
            db.ChangeTracker.Clear();
            await using (var tx = await db.Database.BeginTransactionAsync())
            {
                var user = await db.Users.SingleAsync(x => x.Id == id);
                user.Status = "disabled";
                await db.SaveChangesAsync();
                Assert.Equal(2, await db.AuditLogs.CountAsync(x => x.TraceId == trace));
                await tx.RollbackAsync();
            }
            db.ChangeTracker.Clear();
            Assert.Equal("active", (await db.Users.SingleAsync(x => x.Id == id)).Status);
            Assert.Equal(1, await db.AuditLogs.CountAsync(x => x.TraceId == trace));
        }
        finally
        {
            AuditExecution.Current = previous;
            await using var cleanup = new XinobiDbContext(options);
            await cleanup.AuditLogs.Where(x => x.TraceId == trace).ExecuteDeleteAsync();
            await cleanup.Users.Where(x => x.Id == id).ExecuteDeleteAsync();
        }
    }
}
