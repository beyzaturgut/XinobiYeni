using System.Net;
using System.Net.Http.Headers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Api.Reports;
using Xinobi.Persistence;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Xinobi.Architecture.Tests;

public sealed class AdminSummaryTests
{
    [Fact]
    public async Task EndpointRequiresStaffMfaAndDoesNotFallbackToFiles()
    {
        await using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient();
        const string path = "/api/v1/admin/reports/summary";
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Synthetic", "summary@example.invalid", "synthetic-test-password");
        var tokens = await accounts.IssueTokens(account.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(path)).StatusCode);
        await accounts.AssignRole(account.Email, Roles.SuperAdmin);
        tokens = await accounts.IssueTokens(account.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(account.Id, tokens);
        var response = await client.GetAsync(path);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Contains("report_sql_unavailable", await response.Content.ReadAsStringAsync());
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(path + "?from=2026-10-20&until=2026-10-19")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(path + "?from=invalid")).StatusCode);
        var authorization = factory.Services.GetRequiredService<IAuthorizationService>();
        var limited = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "synthetic"), new Claim(ClaimTypes.Role, Roles.Admin),
            new Claim(PermissionAuthorization.AccountKindClaim, AccountKinds.Staff) }, "fixture");
        Assert.False((await authorization.AuthorizeAsync(new ClaimsPrincipal(limited), null, PermissionAuthorization.PolicyName("reports.read"))).Succeeded);
        limited.AddClaim(new Claim(PermissionAuthorization.PermissionClaim, "reports.read"));
        Assert.True((await authorization.AuthorizeAsync(new ClaimsPrincipal(limited), null, PermissionAuthorization.PolicyName("reports.read"))).Succeeded);
    }

    [Fact]
    public void QueriesUseExistingSqlSchemaAndOnlyCountRecordedRows()
    {
        using var db = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer("Server=unused;Database=unused").Options);
        var from = AdminSummaryEndpoints.Utc(new DateOnly(2026, 10, 1));
        var until = AdminSummaryEndpoints.Utc(new DateOnly(2026, 11, 1));
        var sql = AdminSummaryEndpoints.OrderCounts(db, from, until).ToQueryString();
        Assert.Contains("GROUP BY", sql); Assert.Contains("COUNT(*)", sql);
        Assert.Contains("[CreatedAt] >=", sql); Assert.Contains("[CreatedAt] <", sql);
        Assert.DoesNotContain("TotalCents", sql); Assert.DoesNotContain("AddressSnapshotJson", sql);
        var customers = AdminSummaryEndpoints.Customers(db).Select(user => user.Id).ToQueryString();
        Assert.Contains("NOT EXISTS", customers); Assert.Contains("[UserRoles]", customers); Assert.Contains("customer", customers);
        Assert.DoesNotContain("PasswordHash", customers); Assert.Empty(db.ChangeTracker.Entries());
        Assert.Equal(TimeSpan.Zero, from.Offset);
    }

    public sealed class ReadOnlySqlFactAttribute : FactAttribute
    {
        public ReadOnlySqlFactAttribute()
        {
            if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("XINOBI_READONLY_SQL")))
                Skip = "Explicit local SELECT-only SQL connection not supplied.";
        }
    }

    [ReadOnlySqlFact]
    public async Task ExplicitReadOnlyLocalSqlCountsMatchDirectSelects()
    {
        // Explicitly opt in; never create/drop/migrate/seed or use a remote DB.
        var connection = Environment.GetEnvironmentVariable("XINOBI_READONLY_SQL");
        var settings = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connection);
        Assert.Equal(@"lpc:.\SQLEXPRESS", settings.DataSource);
        Assert.Equal("XinobiYeniDB", settings.InitialCatalog);
        Assert.True(settings.IntegratedSecurity);
        await using var db = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer(connection).Options);
        var now = DateTimeOffset.UtcNow;
        var summary = await AdminSummaryEndpoints.Read(db, null, now, now);
        await using var sql = new Microsoft.Data.SqlClient.SqlConnection(connection);
        await sql.OpenAsync();
        await using var command = sql.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM sales.Orders WHERE CreatedAt < @until";
        command.Parameters.AddWithValue("@until", now);
        Assert.Equal(Convert.ToInt32(await command.ExecuteScalarAsync()), summary.OrderCount);
        Assert.Equal(summary.OrderCount, summary.OrderStatuses.Sum(row => row.Count));
        command.CommandText = "SELECT COUNT(*) FROM [identity].Users u WHERE u.Kind = N'customer' AND u.CreatedAt < @until AND NOT EXISTS (SELECT 1 FROM [identity].UserRoles r WHERE r.UserId = u.Id)";
        Assert.Equal(Convert.ToInt32(await command.ExecuteScalarAsync()), summary.RegisteredCustomerCount);
        Assert.Empty(db.ChangeTracker.Entries());
    }
}
