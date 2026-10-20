using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class AdminOrderDetailTests
{
    private const string OldId = "00000000000000000000000000000001";
    private const string Path = "/api/v1/admin/orders/" + OldId;
    private static async Task Staff(IServiceProvider services, HttpClient client, bool mfa = true)
    {
        var store = services.GetRequiredService<IAccountStore>();
        var account = await store.Register("Synthetic", Guid.NewGuid().ToString("N") + "@example.invalid", "synthetic-test-password");
        await store.AssignRole(account.Email, Roles.Admin); var tokens = await store.IssueTokens(account.Id);
        if (mfa) await services.GetRequiredService<AdminMfa>().Grant(account.Id, tokens);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
    }
    private sealed class WithoutOrdersRead : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            foreach (var identity in principal.Identities)
                foreach (var claim in identity.FindAll(PermissionAuthorization.PermissionClaim).Where(c => c.Value == "orders.read").ToArray()) identity.RemoveClaim(claim);
            return Task.FromResult(principal);
        }
    }
    [Fact]
    public async Task StaffMfaAndOrdersReadAreRequiredBeforeAnyOrderData()
    {
        await using var f = new IsolatedApiFactory(); using var client = f.CreateClient();
        var response = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode); Assert.DoesNotContain("customerEmail", await response.Content.ReadAsStringAsync());
        var store = f.Services.GetRequiredService<IAccountStore>(); var customer = await store.Register("Synthetic", "detail-customer@example.invalid", "synthetic-test-password");
        var token = await store.IssueTokens(customer.Id); client.DefaultRequestHeaders.Authorization = new("Bearer", token.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(Path)).StatusCode);
        await Staff(f.Services, client, false); Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(Path)).StatusCode);
        await using var restricted = f.WithWebHostBuilder(b => b.ConfigureServices(s => s.AddTransient<IClaimsTransformation, WithoutOrdersRead>()));
        using var noRead = restricted.CreateClient(); await Staff(restricted.Services, noRead);
        var denied = await noRead.GetAsync(Path); Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode); Assert.DoesNotContain("customerEmail", await denied.Content.ReadAsStringAsync());
    }
    [Theory]
    [InlineData("bad-id")][InlineData("00000000000000000000000000000000")]
    public async Task InvalidIdIs400(string id)
    {
        await using var f = new IsolatedApiFactory(); using var client = f.CreateClient(); await Staff(f.Services, client);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/v1/admin/orders/" + id)).StatusCode);
    }
    [Fact]
    public async Task FileProviderIs503Not404OrFallback()
    {
        await using var f = new IsolatedApiFactory(); using var client = f.CreateClient(); await Staff(f.Services, client);
        var response = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
    }
    public sealed class DisposableSqlFactAttribute : FactAttribute
    {
        public DisposableSqlFactAttribute() { if (Environment.GetEnvironmentVariable("XINOBI_ORDER_DETAIL_SQL") != "1") Skip = "Fresh disposable local SQL database opt-in required."; }
    }
    [DisposableSqlFact]
    public async Task OldOrderDirectReadMatchesExistingDtoAndImageWithoutChangingWrites()
    {
        var name = "XinobiOrderDetailTest_" + Guid.NewGuid().ToString("N");
        var cs = new SqlConnectionStringBuilder { DataSource = @"lpc:.\SQLEXPRESS", InitialCatalog = name, IntegratedSecurity = true, TrustServerCertificate = true };
        var options = new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer(cs.ConnectionString).Options;
        await using var db = new XinobiDbContext(options); var created = false;
        try
        {
            Assert.True(await db.Database.EnsureCreatedAsync()); created = true;
            var user = new User { Id = Guid.NewGuid(), Email = "fixture@example.invalid", NormalizedEmail = "FIXTURE@EXAMPLE.INVALID", DisplayName = "Existing customer", Phone = "+905000000000", Kind = UserKinds.Customer, Status = UserStatuses.Active, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
            db.Users.Add(user); await db.SaveChangesAsync(); db.ChangeTracker.Clear();
            await db.Database.ExecuteSqlRawAsync("""
                SELECT TOP(1101) ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) n INTO #N FROM sys.all_objects a CROSS JOIN sys.all_objects b;
                INSERT sales.Orders(Id,UserId,ClientRequestId,Number,CreatedAt,Status,AddressSnapshotJson,TotalCents,Currency)
                SELECT CONVERT(uniqueidentifier,CONVERT(binary(16),n)),@user,CONVERT(nvarchar(80),n),CONCAT(N'TEST-',n),DATEADD(second,CONVERT(int,n),CONVERT(datetimeoffset,'2020-01-01')),N'received',N'{"id":"a","title":"Ev","fullName":"Synthetic customer","phone":"+905000000000","city":"İstanbul","district":"Kadıköy","line":"Fixture street"}',1000,'TRY' FROM #N;
                INSERT sales.OrderLines(OrderId,Position,ProductReference,VariantReference,Name,Color,UnitPriceCents,Quantity,LineTotalCents,Currency,PersonalizationJson)
                SELECT CONVERT(uniqueidentifier,CONVERT(binary(16),n)),0,N'p',N'v',N'Product',N'Siyah',1000,1,1000,'TRY',N'{"designId":"fixture-design","kind":"upload","name":"Saved design","mime":"image/png"}' FROM #N;
                DROP TABLE #N;
                """.Replace("{", "{{").Replace("}", "}}"), new SqlParameter("@user", user.Id));
            await using var isolated = new IsolatedApiFactory();
            await using var factory = isolated.WithWebHostBuilder(b => b.ConfigureServices(s =>
            {
                s.AddScoped(_ => new XinobiDbContext(options)); s.AddSingleton<IAccountStore, SqlAccountStore>();
            }));
            using var client = factory.CreateClient(); await Staff(factory.Services, client);
            var sql = (SqlAccountStore)factory.Services.GetRequiredService<IAccountStore>();
            var all = await sql.AllOrders(); Assert.Equal(1000, all.Length); Assert.DoesNotContain(all, item => item.Order.Id == OldId);
            var raw = await sql.StaffOrderById(Guid.Parse(OldId)); Assert.NotNull(raw);
            var response = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
            var result = await response.Content.ReadFromJsonAsync<StaffOrder>(); Assert.NotNull(result);
            Assert.Equal(OldId, result.Order.Id); Assert.Equal("TEST-1", result.Order.Number); Assert.Equal(user.Email, result.CustomerEmail); Assert.Equal(user.Phone, result.CustomerPhone);
            Assert.Equal("Ev", result.Order.Address.Title); Assert.Equal("Siyah", result.Order.Lines.Single().Color); Assert.Equal(1000, result.Order.Total.AmountMinor);
            Assert.Equal("fixture-design", result.Order.Lines.Single().Personalization!.DesignId);
            using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal(new[] { "order", "accountId", "customerName", "customerEmail", "customerPhone" }, body.RootElement.EnumerateObject().Select(p => p.Name));
            Assert.DoesNotContain("passwordHash", body.RootElement.GetRawText(), StringComparison.OrdinalIgnoreCase);
            var recent = all.First(); Assert.Equal(JsonSerializer.Serialize(recent), JsonSerializer.Serialize(await sql.StaffOrderById(Guid.Parse(recent.Order.Id))));
            var png = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=");
            await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Designs, Xinobi.Api.Designs.SavedDesignStore.OrderFile(OldId, 0), new MemoryStream(png), "image/png");
            var image = await client.GetAsync(result.Order.Lines.Single().Personalization!.ImageUrl);
            Assert.Equal(HttpStatusCode.OK, image.StatusCode); Assert.Equal(png, await image.Content.ReadAsByteArrayAsync());
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/admin/orders/" + Guid.NewGuid().ToString("N"))).StatusCode);
            Assert.Equal(1101, await db.SalesOrders.CountAsync()); Assert.Equal(1101, await db.SalesOrderLines.CountAsync());
            var tracked = await db.SalesOrders.SingleAsync(o => o.Id == Guid.Parse(OldId)); tracked.AddressSnapshotJson = "[]"; await db.SaveChangesAsync(); db.ChangeTracker.Clear();
            var invalid = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.ServiceUnavailable, invalid.StatusCode); Assert.DoesNotContain("Json", await invalid.Content.ReadAsStringAsync());
            var services = new ServiceCollection(); services.AddDbContext<XinobiDbContext>(o => o.UseSqlServer(cs.ConnectionString.Replace(name, name + "_missing")));
            await using var provider = services.BuildServiceProvider();
            var unavailable = new SqlAccountStore(provider.GetRequiredService<IServiceScopeFactory>(), TimeProvider.System);
            await Assert.ThrowsAsync<AccountUnavailableException>(() => unavailable.StaffOrderById(Guid.Parse(OldId)));
        }
        finally { if (created) { Assert.Equal(name, db.Database.GetDbConnection().Database); await db.Database.EnsureDeletedAsync(); } }
    }
}
