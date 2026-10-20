using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Xinobi.Api.Designs;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;

namespace Xinobi.Architecture.Tests;

public sealed class AdminDesignMetadataTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static SavedDesign Row(string id, DateTimeOffset? at = null) => new(id, "private-account-" + id, "upload", "private-name", "product", "Product",
        null, null, ["private-profile"], "private-file-key", "image/png", at ?? DateTimeOffset.Parse("2026-10-20T00:00:00Z"));
    private static async Task<string> Source(IsolatedApiFactory factory, params SavedDesign[] rows)
    {
        var path = Path.Combine(factory.Services.GetRequiredService<FeatureDocuments>().DataDirectory!, "designs", "designs.json");
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(new { Designs = rows }, Json));
        return path;
    }
    private static async Task Staff(WebApplicationFactory<Program> factory, HttpClient client)
    {
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Synthetic", "metadata@example.invalid", "synthetic-test-password");
        await accounts.AssignRole(account.Email, Roles.Admin);
        var tokens = await accounts.IssueTokens(account.Id);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(account.Id, tokens);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
    }

    [Fact]
    public async Task EndpointsRequireStaffMfaAndPrintRead()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient();
        foreach (var path in new[] { "/api/v1/admin/designs", "/api/v1/admin/designs/absent" })
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Synthetic", "customer-meta@example.invalid", "synthetic-test-password");
        var tokens = await accounts.IssueTokens(customer.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/admin/designs")).StatusCode);
        await accounts.AssignRole(customer.Email, Roles.Admin); tokens = await accounts.IssueTokens(customer.Id);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/designs")).StatusCode);
        var authorization = factory.Services.GetRequiredService<IAuthorizationService>();
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "synthetic"), new Claim(PermissionAuthorization.AccountKindClaim, AccountKinds.Staff)], "fixture");
        Assert.False((await authorization.AuthorizeAsync(new ClaimsPrincipal(identity), null, PermissionAuthorization.PolicyName("print.read"))).Succeeded);
        identity.AddClaim(new Claim(PermissionAuthorization.PermissionClaim, "print.read"));
        Assert.True((await authorization.AuthorizeAsync(new ClaimsPrincipal(identity), null, PermissionAuthorization.PolicyName("print.read"))).Succeeded);
    }

    [Fact]
    public async Task AuthenticatedMfaStaffWithoutPrintReadCannotReadEitherEndpoint()
    {
        await using var isolated = new IsolatedApiFactory();
        await using var factory = isolated.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
            services.AddTransient<IClaimsTransformation, WithoutPrintRead>()));
        using var client = factory.CreateClient(); await Staff(factory, client);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/admin/designs")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/admin/designs/absent")).StatusCode);
    }

    private sealed class WithoutPrintRead : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            foreach (var identity in principal.Identities)
                foreach (var claim in identity.FindAll(PermissionAuthorization.PermissionClaim).Where(claim => claim.Value == "print.read").ToArray())
                    identity.RemoveClaim(claim);
            return Task.FromResult(principal);
        }
    }

    [Fact]
    public async Task AuthorizedMetadataIsPagedDeterministicAllowlistedAndNonMutating()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient(); await Staff(factory, client);
        var rows = Enumerable.Range(0, 22).Select(i => Row(i.ToString("D3"))).Reverse().ToArray();
        var path = await Source(factory, rows); var before = await File.ReadAllBytesAsync(path);
        var response = await client.GetAsync("/api/v1/admin/designs");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode); Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement; Assert.Equal(22, root.GetProperty("total").GetInt32());
        Assert.Equal(20, root.GetProperty("pageSize").GetInt32()); Assert.Equal(2, root.GetProperty("totalPages").GetInt32());
        var item = root.GetProperty("items")[0]; Assert.Equal("000", item.GetProperty("id").GetString());
        var allowed = new[] { "id", "kind", "productId", "productName", "variantId", "color", "createdAt" };
        Assert.Equal(allowed.Order(), item.EnumerateObject().Select(x => x.Name).Order());
        Assert.DoesNotContain("private-", root.GetRawText());
        var second = await client.GetFromJsonAsync<AdminDesignPage>("/api/v1/admin/designs?page=2&pageSize=20");
        Assert.Equal(["020", "021"], second!.Items.Select(x => x.Id));
        using var detail = JsonDocument.Parse(await client.GetStringAsync("/api/v1/admin/designs/000"));
        Assert.Equal(allowed.Append("mime").Order(), detail.RootElement.EnumerateObject().Select(x => x.Name).Order());
        Assert.DoesNotContain("private-", detail.RootElement.GetRawText());
        Assert.Equal(before, await File.ReadAllBytesAsync(path));
        await Source(factory, Row("old"), Row("new", DateTimeOffset.Parse("2026-10-21T00:00:00Z")));
        Assert.Equal("new", (await client.GetFromJsonAsync<AdminDesignPage>("/api/v1/admin/designs"))!.Items[0].Id);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/admin/designs/absent")).StatusCode);
        await Source(factory);
        var empty = await client.GetFromJsonAsync<AdminDesignPage>("/api/v1/admin/designs"); Assert.Empty(empty!.Items); Assert.Equal(0, empty.Total);
        foreach (var query in new[] { "page=0", "page=-1", "pageSize=0", "pageSize=101", "page=invalid" })
        {
            var invalid = await client.GetAsync("/api/v1/admin/designs?" + query);
            Assert.True(invalid.StatusCode == HttpStatusCode.BadRequest, $"Query {query}: expected 400, got {(int)invalid.StatusCode}");
        }
        Assert.Empty((await client.GetFromJsonAsync<AdminDesignPage>("/api/v1/admin/designs?page=2147483647&pageSize=100"))!.Items);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("not-json")]
    [InlineData("null")]
    [InlineData("{}")]
    [InlineData("{\"designs\":null}")]
    [InlineData("{\"designs\":[null]}")]
    [InlineData("{\"designs\":[{}]}")]
    public async Task MissingOrBrokenSourceIsSafe503NotEmpty(string? contents)
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient(); await Staff(factory, client);
        string? path = null;
        if (contents is not null) { path = await Source(factory); await File.WriteAllTextAsync(path, contents); }
        foreach (var suffix in new[] { "", "/absent" })
        {
            var response = await client.GetAsync("/api/v1/admin/designs" + suffix);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode); Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
            var body = await response.Content.ReadAsStringAsync(); Assert.DoesNotContain("JsonException", body); Assert.DoesNotContain("App_Data", body);
        }
        if (path is not null) Assert.Equal(contents, await File.ReadAllTextAsync(path));
    }

    [Fact]
    public async Task CustomerReadsKeepOwnershipAndLegacyEmptyBehavior()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient();
        var store = factory.Services.GetRequiredService<SavedDesignStore>();
        Assert.Empty(await store.Mine("owner")); // Existing customer missing-file behavior remains unchanged.
        await Source(factory, Row("a") with { AccountId = "owner" }, Row("b") with { AccountId = "other" });
        Assert.Single(await store.Mine("owner")); Assert.Null(await store.Find("other", "a"));
    }

    public sealed class DisposableSqlFactAttribute : FactAttribute
    {
        public DisposableSqlFactAttribute()
        {
            if (Environment.GetEnvironmentVariable("XINOBI_DESIGN_DISPOSABLE_SQL") != "1")
                Skip = "Explicit opt-in required for a fresh local metadata test database; existing DBs are never used.";
        }
    }

    [DisposableSqlFact]
    public async Task SqlReadsOnlyExistingSnapshotAndNeverCreatesMissingSource()
    {
        var name = "XinobiDesignMetaTest_" + Guid.NewGuid().ToString("N");
        var connection = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder
        { DataSource = @"lpc:.\SQLEXPRESS", InitialCatalog = name, IntegratedSecurity = true, TrustServerCertificate = true };
        var services = new ServiceCollection();
        services.AddDbContext<XinobiDbContext>(options => options.UseSqlServer(connection.ConnectionString));
        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        var created = false;
        try
        {
            Assert.True(await db.Database.EnsureCreatedAsync()); created = true;
            await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient();
            var config = new Microsoft.Extensions.Configuration.ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
                { ["Features:StorageProvider"] = "SqlServer" }).Build();
            var documents = new FeatureDocuments(factory.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>(), config,
                provider.GetRequiredService<IServiceScopeFactory>());
            var store = new SavedDesignStore(documents, factory.Services.GetRequiredService<IFileStore>(), TimeProvider.System);
            Assert.Equal(503, (await Assert.ThrowsAsync<ProblemException>(() => store.AdminList(1, 20))).Status);
            Assert.Equal(0, await db.FeatureDocuments.CountAsync());
            var source = new Xinobi.Persistence.Entities.FeatureDocument { Name = "designs", Json = "{\"designs\":[]}", UpdatedAt = DateTimeOffset.UtcNow };
            db.FeatureDocuments.Add(source); await db.SaveChangesAsync(); db.ChangeTracker.Clear();
            Assert.Empty((await store.AdminList(1, 20)).Items);
            source = await db.FeatureDocuments.SingleAsync();
            source.Json = JsonSerializer.Serialize(new { Designs = new[] { Row("b"), Row("a") } }, Json);
            await db.SaveChangesAsync(); var before = source.Json; db.ChangeTracker.Clear();
            Assert.Equal("a", (await store.AdminList(1, 1)).Items.Single().Id);
            Assert.Equal("b", (await store.AdminList(2, 1)).Items.Single().Id);
            Assert.Equal("image/png", (await store.AdminDetails("a")).Mime);
            Assert.Equal(404, (await Assert.ThrowsAsync<ProblemException>(() => store.AdminDetails("absent"))).Status);
            Assert.Equal(before, await db.FeatureDocuments.AsNoTracking().Select(row => row.Json).SingleAsync());
            Assert.Empty(db.ChangeTracker.Entries());
            source = await db.FeatureDocuments.SingleAsync(); source.Json = "{}"; await db.SaveChangesAsync(); db.ChangeTracker.Clear();
            Assert.Equal(503, (await Assert.ThrowsAsync<ProblemException>(() => store.AdminList(1, 20))).Status);
            Assert.Equal("{}", await db.FeatureDocuments.AsNoTracking().Select(row => row.Json).SingleAsync());
        }
        finally
        {
            if (created) { Assert.Equal(name, db.Database.GetDbConnection().Database); await db.Database.EnsureDeletedAsync(); }
        }
    }
}
