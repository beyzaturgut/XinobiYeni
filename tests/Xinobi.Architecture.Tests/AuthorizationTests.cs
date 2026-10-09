using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;

namespace Xinobi.Architecture.Tests;

/// <summary>Roles, permissions and default deny (Faz03 03.04). E-mail delivery is replaced in DI; nothing is sent.</summary>
public sealed class AuthorizationTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-authorization-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory() => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVerificationEmailSender>();
            services.AddSingleton<IVerificationEmailSender, SilentSender>();
        });
    });

    private sealed class SilentSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private static async Task<string> Register(HttpClient client, string email)
    {
        var start = await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification(email));
        var challenge = (await start.Content.ReadFromJsonAsync<AccountEmailVerification>())!;
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Test Kişi", email, "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<AuthSession>())!.AccessToken;
    }

    private static Task<HttpResponseMessage> Get(HttpClient client, string path, string? token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    [Fact]
    public void OnlyListedAreasArePublic()
    {
        using var factory = Factory();
        string[] publicAreas = ["/api/v1/health", "/api/v1/catalog", "/api/v1/content", "/api/v1/design-studio", "/api/v1/local-commerce",
            "/api/v1/xinobi-u", "/api/v1/email-verification", "/api/v1/auth", "/openapi",
            // Corporate quote form and tracking by code + e-mail: companies ask without an account (Faz07).
            "/api/v1/quotes"];
        var endpoints = factory.Services.GetRequiredService<EndpointDataSource>().Endpoints.OfType<RouteEndpoint>().ToArray();
        Assert.NotEmpty(endpoints);
        foreach (var endpoint in endpoints)
        {
            var route = "/" + endpoint.RoutePattern.RawText!.TrimStart('/');
            var isPublic = endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null;
            Assert.True(isPublic == publicAreas.Any(area => route.StartsWith(area, StringComparison.Ordinal)),
                $"{route} is {(isPublic ? "public" : "protected")}; public areas must be listed here on purpose.");
        }
        var authorization = factory.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<AuthorizationOptions>>().Value;
        Assert.NotNull(authorization.FallbackPolicy);
    }

    [Fact]
    public async Task PanelNeedsAStaffRoleAndThePermission()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();

        var anonymous = await Get(client, "/api/v1/admin/session", null);
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        Assert.Equal("unauthorized", await Code(anonymous));

        var customer = await Register(client, "musteri@example.com");
        Assert.Equal(HttpStatusCode.OK, (await Get(client, "/api/v1/me", customer)).StatusCode);
        foreach (var path in new[] { "/api/v1/admin/session", "/api/v1/admin/permissions" })
        {
            var forbidden = await Get(client, path, customer);
            Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
            Assert.Equal("forbidden", await Code(forbidden));
        }
    }

    [Fact]
    public async Task TheFirstSuperAdminIsBootstrappedOnceFromTheConsole()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var output = new StringWriter();

        Assert.Equal(3, await SuperAdminBootstrap.Run(accounts, "sahip@example.com", output));
        var owner = await Register(client, "sahip@example.com");
        Assert.Equal(0, await SuperAdminBootstrap.Run(accounts, " Sahip@Example.com ", output));
        await Register(client, "ikinci@example.com");
        Assert.Equal(2, await SuperAdminBootstrap.Run(accounts, "ikinci@example.com", output));
        Assert.False((await accounts.FindById((await accounts.Login("ikinci@example.com", "guclu-parola-1"))!.Id))!.RoleCodes.Any());

        // The existing token picks up the role: permissions are resolved per request, not baked into the token.
        var session = (await (await Get(client, "/api/v1/admin/session", owner)).Content.ReadFromJsonAsync<AdminSession>())!;
        Assert.Equal([Roles.SuperAdmin], session.Roles);
        Assert.Equal(PermissionCatalog.All.Count, session.Permissions.Count);
        var catalog = (await (await Get(client, "/api/v1/admin/permissions", owner)).Content.ReadFromJsonAsync<PermissionCatalogResponse>())!;
        Assert.Equal(17, catalog.Resources.Count);
    }

    [Fact]
    public void CatalogCoversThePanelResources()
    {
        foreach (var resource in new[] { "catalog", "content", "media", "pricing", "inventory", "promotions", "customers", "orders", "payments",
                     "quotes", "print", "integration", "ai", "reports", "notifications", "settings", "audit" })
            Assert.True(PermissionCatalog.Exists($"{resource}.read"), resource);
        Assert.False(PermissionCatalog.Exists("audit.write"));
        Assert.True(PermissionCatalog.Exists("payments.approve"));
        Assert.Empty(Roles.PermissionsFor(["unknown_role"]));
        var builder = WebApplication.CreateBuilder();
        var app = builder.Build();
        Assert.Throws<ArgumentException>(() => app.MapGet("/x", () => "x").RequirePermission("catalog.delete-everything"));
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
