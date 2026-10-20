using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xinobi.Api.Designs;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Architecture.Tests;

public sealed class AdminDesignImageTests
{
    private const string Path = "/api/v1/admin/designs/fixture/image";
    private static readonly byte[] Png = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=");
    private static async Task Staff(WebApplicationFactory<Program> factory, HttpClient client, bool mfa = true)
    {
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Synthetic", "image@example.invalid", "synthetic-test-password");
        await accounts.AssignRole(account.Email, Roles.Admin);
        var tokens = await accounts.IssueTokens(account.Id);
        if (mfa) await factory.Services.GetRequiredService<AdminMfa>().Grant(account.Id, tokens);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
    }
    private static async Task<string> Source(IsolatedApiFactory factory, string mime = "image/png", string key = "private-key.png")
    {
        var path = System.IO.Path.Combine(factory.Services.GetRequiredService<FeatureDocuments>().DataDirectory!, "designs", "designs.json");
        Directory.CreateDirectory(System.IO.Path.GetDirectoryName(path)!);
        var row = new SavedDesign("fixture", "other-customer-private", "upload", "private-name", "p", "Product", null, null, ["private-profile"], key, mime, DateTimeOffset.UtcNow);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(new { Designs = new[] { row } }, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
        return path;
    }
    [Fact]
    public async Task RequiresStaffMfaAndPermissionBeforeReadingSource()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(Path)).StatusCode);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Synthetic", "customer-image@example.invalid", "synthetic-test-password");
        var tokens = await accounts.IssueTokens(customer.Id); client.DefaultRequestHeaders.Authorization = new("Bearer", tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(Path)).StatusCode);
        await Staff(factory, client, false);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(Path)).StatusCode);
    }
    private sealed class WithoutPrintRead : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            foreach (var identity in principal.Identities)
                foreach (var claim in identity.FindAll(PermissionAuthorization.PermissionClaim).Where(c => c.Value == "print.read").ToArray()) identity.RemoveClaim(claim);
            return Task.FromResult(principal);
        }
    }
    [Fact]
    public async Task MfaStaffWithoutPermissionIsForbidden()
    {
        await using var isolated = new IsolatedApiFactory();
        await using var factory = isolated.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddTransient<IClaimsTransformation, WithoutPrintRead>()));
        using var client = factory.CreateClient(); await Staff(factory, client);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(Path)).StatusCode);
    }
    [Fact]
    public async Task ReturnsOnlyCorrectPrivateImageWithoutMutatingSourceAndLeavesCustomerOwnershipIntact()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient(); await Staff(factory, client);
        var source = await Source(factory); var before = await File.ReadAllBytesAsync(source);
        var files = factory.Services.GetRequiredService<IFileStore>();
        await files.Save(FileAreas.Designs, "private-key.png", new MemoryStream(Png), "image/png");
        var response = await client.GetAsync(Path);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(Png, await response.Content.ReadAsByteArrayAsync());
        Assert.Equal("image/png", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
        Assert.Null(response.Content.Headers.ContentDisposition);
        Assert.DoesNotContain("private", response.Headers.ToString(), StringComparison.OrdinalIgnoreCase);
        Assert.Equal(before, await File.ReadAllBytesAsync(source));
        Assert.Null(await factory.Services.GetRequiredService<SavedDesignStore>().Image("unrelated-customer", "fixture"));
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/admin/designs/missing/image")).StatusCode);
    }
    [Fact]
    public async Task MissingFileIs404NotEmptySuccess()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient(); await Staff(factory, client); await Source(factory);
        var response = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        Assert.DoesNotContain("private-key", await response.Content.ReadAsStringAsync());
    }
    [Theory]
    [InlineData("image/svg+xml", "private-key.svg")]
    [InlineData("text/html", "private-key.html")]
    [InlineData("image/png", "../private-key.png")]
    [InlineData("image/png", "private-key.jpg")]
    public async Task UnsafeOrInconsistentStorageIsSafe503(string mime, string key)
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient(); await Staff(factory, client); await Source(factory, mime, key);
        if (key.EndsWith(".jpg")) await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Designs, key, new MemoryStream(Png), "image/jpeg");
        var response = await client.GetAsync(Path); Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(); Assert.DoesNotContain(key, body); Assert.DoesNotContain("other-customer-private", body);
    }
    [Fact]
    public async Task MissingOrCorruptSourceIs503()
    {
        await using var factory = new IsolatedApiFactory(); using var client = factory.CreateClient(); await Staff(factory, client);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync(Path)).StatusCode);
        var source = await Source(factory); await File.WriteAllTextAsync(source, "{broken");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync(Path)).StatusCode);
    }
    [Fact]
    public async Task FileProviderFailureIsSafe503()
    {
        await using var isolated = new IsolatedApiFactory(); await Source(isolated);
        await using var factory = isolated.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddSingleton<IFileStore>(new UnavailableFileStore())));
        using var client = factory.CreateClient(); await Staff(factory, client);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync(Path)).StatusCode);
    }
}
