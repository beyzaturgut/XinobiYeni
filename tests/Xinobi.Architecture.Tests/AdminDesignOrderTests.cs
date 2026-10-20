using System.Diagnostics;
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
using Xinobi.Api.Orders;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;
using Xunit.Abstractions;

namespace Xinobi.Architecture.Tests;

public sealed class AdminDesignOrderTests(ITestOutputHelper output)
{
    private const string Path = "/api/v1/admin/designs/target-design/orders";
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
    public async Task RequiresStaffMfaAndOrdersReadNotJustPrintRead()
    {
        await using var f = new IsolatedApiFactory(); using var client = f.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(Path)).StatusCode);
        var account = await f.Services.GetRequiredService<IAccountStore>().Register("Synthetic", "customer-orders@example.invalid", "synthetic-test-password");
        var tokens = await f.Services.GetRequiredService<IAccountStore>().IssueTokens(account.Id);
        client.DefaultRequestHeaders.Authorization = new("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(Path)).StatusCode);
        await Staff(f.Services, client, false); Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(Path)).StatusCode);
        await using var without = f.WithWebHostBuilder(b => b.ConfigureServices(s => s.AddTransient<IClaimsTransformation, WithoutOrdersRead>()));
        using var restricted = without.CreateClient(); await Staff(without.Services, restricted);
        Assert.Equal(HttpStatusCode.Forbidden, (await restricted.GetAsync(Path)).StatusCode);
    }
    [Theory]
    [InlineData("?page=0")][InlineData("?pageSize=0")][InlineData("?pageSize=101")][InlineData("?page=abc")][InlineData("?page=2147483648")]
    public async Task InvalidPaginationIs400(string query)
    {
        await using var f = new IsolatedApiFactory(); using var client = f.CreateClient(); await Staff(f.Services, client);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(Path + query)).StatusCode);
    }
    [Fact]
    public async Task MissingSqlIs503NeverFileFallbackOrEmptySuccess()
    {
        await using var f = new IsolatedApiFactory(); using var client = f.CreateClient(); await Staff(f.Services, client);
        var response = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        var body = await response.Content.ReadAsStringAsync(); Assert.DoesNotContain("Data Source", body); Assert.DoesNotContain("items", body);
    }
    [Theory]
    [InlineData("")][InlineData(" ")][InlineData("bad\n")]
    public void InvalidDesignIdRejected(string id) => Assert.Throws<ProblemException>(() => AdminDesignOrderStore.Validate(id, 1, 20));

    public sealed class DisposableSqlFactAttribute : FactAttribute
    {
        public DisposableSqlFactAttribute() { if (Environment.GetEnvironmentVariable("XINOBI_DESIGN_ORDERS_SQL") != "1") Skip = "Opt-in: fresh disposable local SQL DB only."; }
    }
    [DisposableSqlFact]
    public async Task FullSqlScopePagingSafeDtoAndFourConcurrentHttpReads()
    {
        var name = "XinobiDesignOrdersTest_" + Guid.NewGuid().ToString("N");
        var connection = new SqlConnectionStringBuilder { DataSource = @"lpc:.\SQLEXPRESS", InitialCatalog = name, IntegratedSecurity = true, TrustServerCertificate = true };
        var options = new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer(connection.ConnectionString).Options;
        await using var db = new XinobiDbContext(options); var created = false;
        try
        {
            Assert.True(await db.Database.EnsureCreatedAsync()); created = true;
            var user = new User { Id = Guid.NewGuid(), Email = "fixture@example.invalid", NormalizedEmail = "FIXTURE@EXAMPLE.INVALID", Kind = UserKinds.Customer, Status = UserStatuses.Active, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
            db.Users.Add(user); await db.SaveChangesAsync(); db.ChangeTracker.Clear();
            await db.Database.ExecuteSqlRawAsync("""
                SELECT TOP(100000) ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) n INTO #N
                FROM (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9))a(n)
                CROSS JOIN (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9))b(n)
                CROSS JOIN (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9))c(n)
                CROSS JOIN (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9))d(n)
                CROSS JOIN (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9))e(n);
                INSERT sales.Orders(Id,UserId,ClientRequestId,Number,CreatedAt,Status,AddressSnapshotJson,TotalCents,Currency)
                SELECT CONVERT(uniqueidentifier,CONVERT(binary(16),n)),@user,CONVERT(nvarchar(80),n),CONCAT(N'TEST-',n),DATEADD(second,CONVERT(int,n/2),CONVERT(datetimeoffset,'2020-01-01')),N'received',N'{"synthetic":true}',3000,'TRY' FROM #N;
                INSERT sales.OrderLines(OrderId,Position,ProductReference,VariantReference,Name,Color,ImageUrl,UnitPriceCents,Quantity,LineTotalCents,Currency,PersonalizationJson)
                SELECT CONVERT(uniqueidentifier,CONVERT(binary(16),n)),p.position,N'p',N'v',REPLICATE(N'X',80),N'Siyah',NULL,1000,1,1000,'TRY',
                CASE WHEN n=1 AND p.position=2 THEN N'{"designId":"single-design"}' WHEN p.position<2 AND (n%1000=1 OR n%5=0) THEN CONCAT(N'{"designId":"',CASE WHEN n%1000=1 THEN N'target-design' ELSE N'common-design' END,N'","kind":"upload","name":"synthetic","mime":"image/png"}') ELSE NULL END
                FROM #N CROSS JOIN (VALUES(0),(1),(2))p(position);
                DROP TABLE #N;
                UPDATE STATISTICS sales.Orders WITH FULLSCAN; UPDATE STATISTICS sales.OrderLines WITH FULLSCAN;
                """.Replace("{", "{{").Replace("}", "}}"), new SqlParameter("@user", user.Id));
            foreach (var (design, total) in new[] { ("absent-design", 0L), ("single-design", 1L), ("target-design", 100L), ("common-design", 20000L) })
            {
                var result = await AdminDesignOrderStore.List(db, design, 1, 20);
                Assert.Equal(total, result.Total); Assert.Equal(total == 0 ? 0 : (total + 19) / 20, result.TotalPages);
                Assert.Equal(Math.Min(total, 20), result.Items.Length);
                var json = JsonSerializer.SerializeToElement(result, new JsonSerializerOptions(JsonSerializerDefaults.Web));
                foreach (var item in json.GetProperty("items").EnumerateArray()) Assert.Equal(new[] { "id", "number", "createdAt" }, item.EnumerateObject().Select(p => p.Name));
            }
            var ids = new List<string>();
            for (var page = 1; page <= 5; page++) ids.AddRange((await AdminDesignOrderStore.List(db, "target-design", page, 20)).Items.Select(i => i.Id));
            Assert.Equal(100, ids.Distinct().Count()); Assert.Contains("00000000000000000000000000000001", ids);
            Assert.Empty((await AdminDesignOrderStore.List(db, "target-design", int.MaxValue, 100)).Items);
            var expected = await db.SalesOrders.AsNoTracking().Where(o => db.SalesOrderLines.Any(l => l.OrderId == o.Id && l.PersonalizationJson != null && l.PersonalizationJson.Contains("target-design")))
                .OrderByDescending(o => o.CreatedAt).ThenBy(o => o.Id).Select(o => o.Id).ToArrayAsync();
            Assert.Equal(expected.Select(id => id.ToString("N")), ids);
            var first = await AdminDesignOrderStore.List(db, "common-design", 1, 20);
            Assert.Equal(first.Items, (await AdminDesignOrderStore.List(db, "common-design", 1, 20)).Items);
            await using var isolated = new IsolatedApiFactory();
            var measure = false;
            var reads = new System.Collections.Concurrent.ConcurrentBag<long>();
            await using var factory = isolated.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
            {
                services.AddScoped(_ =>
                {
                    var context = new XinobiDbContext(options);
                    context.Database.OpenConnection();
                    ((SqlConnection)context.Database.GetDbConnection()).InfoMessage += (_, args) =>
                    {
                        if (!measure) return;
                        foreach (var line in args.Message.Split('\n'))
                        {
                            var match = System.Text.RegularExpressions.Regex.Match(line, @"^Table 'OrderLines'.*?logical reads (\d+)");
                            if (match.Success) reads.Add(long.Parse(match.Groups[1].Value));
                        }
                    };
                    context.Database.ExecuteSqlRaw("SET STATISTICS IO ON;");
                    return context;
                });
                services.AddSingleton<IAccountStore, SqlAccountStore>();
            }));
            using var client = factory.CreateClient(); await Staff(factory.Services, client);
            measure = true;
            var tasks = Enumerable.Range(0, 4).Select(async i =>
            {
                var timer = Stopwatch.StartNew(); var response = await client.GetAsync("/api/v1/admin/designs/absent-design/orders?page=1&pageSize=20");
                response.EnsureSuccessStatusCode(); var page = await response.Content.ReadFromJsonAsync<AdminDesignOrderPage>();
                Assert.Equal(0, page!.Total); Assert.Empty(page.Items); Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
                return timer.Elapsed.TotalMilliseconds;
            });
            var times = await Task.WhenAll(tasks); measure = false;
            output.WriteLine("Four concurrent real SQL HTTP reads ms: " + string.Join(", ", times.Select(t => t.ToString("F1"))));
            Assert.Equal(4, reads.Count);
            output.WriteLine("OrderLines logical reads per concurrent request: " + string.Join(", ", reads));
            Assert.All(times, ms => Assert.True(ms < 10000, "Isolated four-reader regression ceiling, not a production SLA"));
            Assert.Equal(100000, await db.SalesOrders.CountAsync()); Assert.Equal(300000, await db.SalesOrderLines.CountAsync());
            await using var bad = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer(connection.ConnectionString.Replace(name, name + "_missing")).Options);
            Assert.Equal(503, (await Assert.ThrowsAsync<ProblemException>(() => AdminDesignOrderStore.List(bad, "target-design", 1, 20))).Status);
        }
        finally { if (created) { Assert.Equal(name, db.Database.GetDbConnection().Database); await db.Database.EnsureDeletedAsync(); } }
    }
}
