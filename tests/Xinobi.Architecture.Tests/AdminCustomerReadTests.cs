using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class AdminCustomerReadTests
{
    [Fact]
    public async Task StaffMfaPermissionAndExplicitStorageAreRequired()
    {
        await using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient();
        var paths = new[] { "/api/v1/admin/customers", "/api/v1/admin/customers/" + Guid.NewGuid() };
        foreach (var path in paths) Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Synthetic Customer", "crm@example.invalid", "synthetic-test-password");
        var tokens = await accounts.IssueTokens(customer.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        foreach (var path in paths) Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(path)).StatusCode);
        await accounts.AssignRole(customer.Email, Roles.SuperAdmin);
        tokens = await accounts.IssueTokens(customer.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(paths[0])).StatusCode);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(customer.Id, tokens);
        var directory = await client.GetAsync(paths[0]);
        Assert.Equal(HttpStatusCode.OK,directory.StatusCode); // Explicit isolated file accounts, not SQL error fallback.
        Assert.Equal("no-store",directory.Headers.CacheControl?.ToString());
        Assert.Equal(HttpStatusCode.NotFound,(await client.GetAsync(paths[1])).StatusCode);
        var authorization = factory.Services.GetRequiredService<IAuthorizationService>();
        var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "synthetic"),
            new Claim(PermissionAuthorization.AccountKindClaim, AccountKinds.Staff) }, "fixture");
        Assert.False((await authorization.AuthorizeAsync(new ClaimsPrincipal(identity), null, PermissionAuthorization.PolicyName("customers.read"))).Succeeded);
        identity.AddClaim(new Claim(PermissionAuthorization.PermissionClaim, "customers.read"));
        Assert.True((await authorization.AuthorizeAsync(new ClaimsPrincipal(identity), null, PermissionAuthorization.PolicyName("customers.read"))).Succeeded);
    }

    [Theory]
    [InlineData(0, 20, null)]
    [InlineData(100001, 20, null)]
    [InlineData(1, 0, null)]
    [InlineData(1, 101, null)]
    public void InvalidPaginationIsRejected(int page, int size, string? query)
        => Assert.Equal("invalid_page", Assert.Throws<AccountException>(() => AdminCustomerEndpoints.Validate(page, size, query)).Code);

    [Fact]
    public void MaskAndQueryDoNotExposeStaffOrCredentials()
    {
        using var db = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer("Server=unused;Database=unused").Options);
        var sql = AdminCustomerEndpoints.Project(db, AdminCustomerEndpoints.Search(db, "Synthetic").OrderByDescending(x => x.CreatedAt)
            .ThenBy(x => x.Id).Skip(20).Take(20)).ToQueryString();
        Assert.Contains("NOT EXISTS", sql); Assert.Contains("[UserRoles]", sql); Assert.Contains("customer", sql);
        Assert.Contains("OFFSET", sql); Assert.Contains("FETCH", sql); Assert.DoesNotContain("PasswordHash", sql);
        Assert.Empty(db.ChangeTracker.Entries());
        var masked = AdminCustomerEndpoints.Mask(new(Guid.NewGuid(), "Synthetic Customer", "crm@example.invalid", "5551234567", "active", DateTimeOffset.UtcNow, 0, null));
        Assert.Equal("S*** C***", masked.Name); Assert.Equal("c***@***", masked.Email); Assert.Equal("***67", masked.Phone);
        Assert.Equal("***", AdminCustomerEndpoints.Mask(masked with { Name = "", Email = "", Phone = null }).Email);
        Assert.Throws<AccountException>(() => AdminCustomerEndpoints.Validate(1, 20, new string('a', 101)));
    }

    public sealed class DisposableSqlFactAttribute : FactAttribute
    {
        public DisposableSqlFactAttribute()
        {
            if (Environment.GetEnvironmentVariable("XINOBI_CRM_DISPOSABLE_SQL") != "1")
                Skip = "Explicit opt-in required; creates and drops only a fresh local CRM test database.";
        }
    }

    [DisposableSqlFact]
    public async Task DisposableSqlVerifiesSearchPaginationStaffExclusionAndDetails()
    {
        // No supplied connection can redirect this test to an existing or remote database.
        var name = "XinobiCrmTest_" + Guid.NewGuid().ToString("N");
        var connection = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder
        {
            DataSource = @"lpc:.\SQLEXPRESS", InitialCatalog = name, IntegratedSecurity = true, TrustServerCertificate = true
        };
        await using var db = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer(connection.ConnectionString).Options);
        var created = false;
        try
        {
            Assert.True(await db.Database.EnsureCreatedAsync()); created = true;
            var now = DateTimeOffset.UtcNow;
            User Row(int i, string kind = UserKinds.Customer) => new() { Id = Guid.NewGuid(), Email = $"crm-{i}@example.invalid",
                NormalizedEmail = $"CRM-{i}@EXAMPLE.INVALID", DisplayName = "Synthetic Customer " + i, Phone = "5551234567", Kind = kind,
                Status = UserStatuses.Active, CreatedAt = now.AddMinutes(i), UpdatedAt = now };
            var customers = Enumerable.Range(0, 21).Select(i => Row(i)).ToArray();
            var staff = Row(50, UserKinds.Staff); var legacy = Row(51);
            db.Users.AddRange(customers); db.Users.AddRange(staff, legacy);
            var role = new Role { Id = Guid.NewGuid(), Code = "crm-test", Name = "Synthetic role" };
            db.Roles.Add(role); db.UserRoles.Add(new UserRole { UserId = legacy.Id, RoleId = role.Id, AssignedAt = now });
            db.CustomerFavorites.Add(new CustomerFavorite { UserId = customers[0].Id, ProductId = "synthetic-product", CreatedAt = now });
            await db.SaveChangesAsync(); db.ChangeTracker.Clear();
            var page = await AdminCustomerEndpoints.List(db, 1, 20, null);
            Assert.Equal(21, page.Total); Assert.Equal(2, page.TotalPages); Assert.Equal(20, page.Items.Length);
            Assert.DoesNotContain(page.Items, row => row.Id == staff.Id || row.Id == legacy.Id);
            var second = await AdminCustomerEndpoints.List(db, 2, 20, null);
            Assert.Single(second.Items); Assert.DoesNotContain(second.Items[0].Id, page.Items.Select(x => x.Id));
            Assert.Single((await AdminCustomerEndpoints.List(db, 1, 20, "crm-20@")).Items);
            Assert.Empty((await AdminCustomerEndpoints.List(db, 1, 20, "absent")).Items);
            var detail = await AdminCustomerEndpoints.Details(db, customers[0].Id);
            Assert.Equal(1, detail.FavoriteCount); Assert.Equal(0, detail.AddressCount); Assert.Equal("c***@***", detail.Customer.Email);
            foreach (var id in new[] { staff.Id, legacy.Id, Guid.NewGuid() })
                Assert.Equal(404, (await Assert.ThrowsAsync<AccountException>(() => AdminCustomerEndpoints.Details(db, id))).Status);
            Assert.Empty(db.ChangeTracker.Entries());
        }
        finally
        {
            if (created)
            {
                Assert.StartsWith("XinobiCrmTest_", db.Database.GetDbConnection().Database);
                await db.Database.EnsureDeletedAsync();
            }
        }
    }
}
