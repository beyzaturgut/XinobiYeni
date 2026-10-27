using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.Orders;
using Xinobi.Api.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.WebUtilities;
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

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory, ["ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"] = "true" }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVerificationEmailSender>();
            services.AddSingleton<IVerificationEmailSender, SilentSender>();
            services.RemoveAll<IAdminInvitationEmailSender>();
            services.AddSingleton<IAdminInvitationEmailSender, SilentInvitationSender>();
        });
    });

    private sealed class SilentSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class SilentInvitationSender : IAdminInvitationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string acceptanceUrl, CancellationToken cancellationToken) => Task.CompletedTask;
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

    private static async Task<string> StaffToken(WebApplicationFactory<Program> factory, IAccountStore accounts, string email)
    {
        var account = (await accounts.Login(email, "guclu-parola-1"))!;
        var tokens = await accounts.IssueTokens(account.Id);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(account.Id, tokens);
        return tokens.AccessToken;
    }

    private static Task<HttpResponseMessage> Post(HttpClient client, string path, string? token, object body)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, path) { Content = JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }

    private static Task<HttpResponseMessage> Delete(HttpClient client, string path, string? token)
    {
        var request = new HttpRequestMessage(HttpMethod.Delete, path);
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
        string[] publicAreas = ["/api/v1/health", "/api/v1/catalog", "/api/v1/content", "/api/v1/design-studio",
            // Development storefront catalog and product media only; the rest of the panel needs staff permissions.
            "/api/v1/local-commerce/state", "/api/v1/local-commerce/media/",
            // Approved product-surface masks of active products for the storefront preview; read-only, no personal data.
            "/api/v1/dev/product-surfaces/commerce-mask/",
            "/api/v1/xinobi-u", "/api/v1/email-verification", "/api/v1/auth", "/openapi",
            // Corporate quote form and tracking by code + e-mail: companies ask without an account (Faz07).
            "/api/v1/quotes",
            // Nobi answers anonymous shoppers; conversations are tied to a device id (K-08/K-09).
            "/api/v1/assistant"];
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
    public async Task FavoritesAreAuthenticatedIdempotentAndOwnedByTheCustomer()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await Get(client, "/api/v1/me/favorites", null)).StatusCode);

        var first = await Register(client, "favori-bir@example.com");
        var second = await Register(client, "favori-iki@example.com");
        Assert.Equal(HttpStatusCode.NotFound, (await Post(client, "/api/v1/me/favorites", first, new AddFavorite("olmayan-urun"))).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await Post(client, "/api/v1/me/favorites", first, new AddFavorite("DEMO-P101"))).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await Post(client, "/api/v1/me/favorites", first, new AddFavorite("DEMO-P101"))).StatusCode);
        Assert.Equal(["DEMO-P101"], (await (await Get(client, "/api/v1/me/favorites", first)).Content.ReadFromJsonAsync<string[]>())!);
        Assert.Empty((await (await Get(client, "/api/v1/me/favorites", second)).Content.ReadFromJsonAsync<string[]>())!);

        Assert.Equal(HttpStatusCode.NoContent, (await Delete(client, "/api/v1/me/favorites/DEMO-P101", second)).StatusCode);
        Assert.Equal(["DEMO-P101"], (await (await Get(client, "/api/v1/me/favorites", first)).Content.ReadFromJsonAsync<string[]>())!);
        Assert.Equal(HttpStatusCode.NoContent, (await Delete(client, "/api/v1/me/favorites/DEMO-P101", first)).StatusCode);
        Assert.Empty((await (await Get(client, "/api/v1/me/favorites", first)).Content.ReadFromJsonAsync<string[]>())!);
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
        owner = await StaffToken(factory, accounts, "sahip@example.com");
        await Register(client, "ikinci@example.com");
        Assert.Equal(2, await SuperAdminBootstrap.Run(accounts, "ikinci@example.com", output));
        Assert.False((await accounts.FindById((await accounts.Login("ikinci@example.com", "guclu-parola-1"))!.Id))!.RoleCodes.Any());

        // The existing token picks up the role: permissions are resolved per request, not baked into the token.
        var session = (await (await Get(client, "/api/v1/admin/session", owner)).Content.ReadFromJsonAsync<AdminSession>())!;
        Assert.Equal([Roles.SuperAdmin], session.Roles);
        Assert.Equal(PermissionCatalog.All.Count, session.Permissions.Count);
        Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, "/api/v1/me", owner)).StatusCode);
        var catalog = (await (await Get(client, "/api/v1/admin/permissions", owner)).Content.ReadFromJsonAsync<PermissionCatalogResponse>())!;
        Assert.Equal(17, catalog.Resources.Count);
    }

    [Fact]
    public async Task SuperAdminPasswordRecoveryRequiresTheRoleAndRevokesSessions()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        await Register(client, "owner@example.com");
        var owner = await accounts.AssignRole("owner@example.com", Roles.SuperAdmin);
        var issued = await accounts.IssueTokens(owner!.Id);
        var output = new StringWriter();

        Assert.Equal(0, await SuperAdminPasswordReset.Run(accounts, owner.Email, false, false, TextReader.Null, output, () => "new-secure-password-2"));
        Assert.Null(await accounts.Login(owner.Email, "guclu-parola-1"));
        Assert.NotNull(await accounts.Login(owner.Email, "new-secure-password-2"));
        Assert.Null(await accounts.FindByAccessToken(issued.AccessToken));
        await Assert.ThrowsAsync<AccountException>(() => accounts.Refresh(issued.RefreshToken));
        Assert.DoesNotContain("new-secure-password-2", output.ToString());

        await Register(client, "customer@example.com");
        Assert.Equal(3, await SuperAdminPasswordReset.Run(accounts, "customer@example.com", false, false, TextReader.Null, new StringWriter(), () => "another-secure-password-3"));
    }

    [Fact]
    public async Task ProductionRecoveryRequiresTheFlagAndExplicitConfirmation()
    {
        using var factory = Factory();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var passwordRead = false;
        string ReadPassword() { passwordRead = true; return "unused-secure-password"; }

        Assert.Equal(5, await SuperAdminPasswordReset.Run(accounts, "owner@example.com", true, false, new StringReader("RESET"), new StringWriter(), ReadPassword));
        Assert.False(passwordRead);
        Assert.Equal(6, await SuperAdminPasswordReset.Run(accounts, "owner@example.com", true, true, new StringReader("NO"), new StringWriter(), ReadPassword));
        Assert.False(passwordRead);
    }

    [Fact]
    public async Task OnlySuperAdminCanAssignTheLimitedAdminRole()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var ownerToken = await Register(client, "owner@example.com");
        Assert.Equal(0, await SuperAdminBootstrap.Run(accounts, "owner@example.com", new StringWriter()));
        ownerToken = await StaffToken(factory, accounts, "owner@example.com");
        var customerToken = await Register(client, "customer@example.com");

        Assert.Equal(HttpStatusCode.Unauthorized, (await Post(client, "/api/v1/admin/roles", null, new AssignAdminRole("customer@example.com", Roles.Admin))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Post(client, "/api/v1/admin/roles", customerToken, new AssignAdminRole("customer@example.com", Roles.Admin))).StatusCode);
        var assigned = await Post(client, "/api/v1/admin/roles", ownerToken, new AssignAdminRole("customer@example.com", Roles.Admin));
        Assert.Equal(HttpStatusCode.Conflict, assigned.StatusCode);
        Assert.Equal("admin_invitation_required", await Code(assigned));
        var customer = (await accounts.Login("customer@example.com", "guclu-parola-1"))!;
        Assert.Equal(AccountKinds.Customer, customer.Kind);
        Assert.Empty(customer.RoleCodes);
        Assert.Equal(HttpStatusCode.OK, (await Get(client, "/api/v1/me", customerToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, "/api/v1/admin/session", customerToken)).StatusCode);
        await accounts.CreateAdminInvitation("staff@example.com", (await accounts.Login("owner@example.com", "guclu-parola-1"))!.Id, "role-test-invitation");
        await accounts.AcceptAdminInvitation("role-test-invitation", "Staff", "guclu-parola-2");
        assigned = await Post(client, "/api/v1/admin/roles", ownerToken, new AssignAdminRole("staff@example.com", Roles.Admin));
        Assert.Equal(HttpStatusCode.OK, assigned.StatusCode);
        var session = (await assigned.Content.ReadFromJsonAsync<AdminSession>())!;
        Assert.Contains(Roles.Admin, session.Roles);
        Assert.DoesNotContain("settings.staff", session.Permissions);
        Assert.Equal(PermissionCatalog.All.Count - 1, session.Permissions.Count);

        var adminTokens = await accounts.IssueTokens(session.Account.Id);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(session.Account.Id, adminTokens);
        var adminToken = adminTokens.AccessToken;
        await Register(client, "other@example.com");
        Assert.Equal(HttpStatusCode.Forbidden, (await Post(client, "/api/v1/admin/roles", adminToken, new AssignAdminRole("other@example.com", Roles.Admin))).StatusCode);
        var forbiddenRole = await Post(client, "/api/v1/admin/roles", ownerToken, new AssignAdminRole("other@example.com", Roles.SuperAdmin));
        Assert.Equal(HttpStatusCode.BadRequest, forbiddenRole.StatusCode);
        Assert.Equal("role_not_assignable", await Code(forbiddenRole));
        Assert.False((await accounts.Login("other@example.com", "guclu-parola-1"))!.RoleCodes.Any());
    }

    [Fact]
    public async Task SuperAdminInvitationCreatesASeparateSingleUseAdminAccount()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var ownerToken = await Register(client, "owner@example.com");
        Assert.Equal(0, await SuperAdminBootstrap.Run(accounts, "owner@example.com", new StringWriter()));
        ownerToken = await StaffToken(factory, accounts, "owner@example.com");
        var customerToken = await Register(client, "customer@example.com");

        Assert.Equal(HttpStatusCode.Unauthorized, (await Post(client, "/api/v1/admin/invitations", null, new CreateAdminInvitation("staff@example.com"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Post(client, "/api/v1/admin/invitations", customerToken, new CreateAdminInvitation("staff@example.com"))).StatusCode);
        var created = await Post(client, "/api/v1/admin/invitations", ownerToken, new CreateAdminInvitation("staff@example.com"));
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var invitation = (await created.Content.ReadFromJsonAsync<AdminInvitationResponse>())!;
        Assert.NotNull(invitation.PreviewUrl);
        var token = QueryHelpers.ParseQuery(new Uri(invitation.PreviewUrl!).Query)["invitation"].ToString();

        var accepted = await Post(client, "/api/v1/auth/admin-invitations/accept", null, new AcceptAdminInvitation(token, "Panel Yöneticisi", "guclu-parola-2"));
        Assert.Equal(HttpStatusCode.OK, accepted.StatusCode);
        var challenge = (await accepted.Content.ReadFromJsonAsync<AdminMfaChallenge>())!;
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        var verified = await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, challenge.PreviewCode!));
        var session = (await verified.Content.ReadFromJsonAsync<AdminSession>())!;
        Assert.Equal([Roles.Admin], session.Roles);
        Assert.DoesNotContain(Roles.SuperAdmin, session.Roles);
        var staff = await accounts.Login("staff@example.com", "guclu-parola-2");
        Assert.NotNull(staff);
        Assert.Equal(AccountKinds.Staff, staff!.Kind);
        var staffTokens = await accounts.IssueTokens(staff.Id);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(staff.Id, staffTokens);
        var staffToken = staffTokens.AccessToken;
        Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, "/api/v1/me", staffToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Get(client, "/api/v1/admin/session", staffToken)).StatusCode);
        Assert.Equal("invalid_invitation", await Code(await Post(client, "/api/v1/auth/admin-invitations/accept", null,
            new AcceptAdminInvitation(token, "İkinci", "guclu-parola-3"))));
    }

    [Fact]
    public async Task CustomerAndStaffLoginSurfacesAreSeparated()
    {
        using var factory = Factory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var ownerToken = await Register(client, "owner@example.com");
        var customerToken = await Register(client, "customer@example.com");
        Assert.Equal(0, await SuperAdminBootstrap.Run(accounts, "owner@example.com", new StringWriter()));
        ownerToken = await StaffToken(factory, accounts, "owner@example.com");

        static HttpRequestMessage Login(string path, string email) {
            var request = new HttpRequestMessage(HttpMethod.Post, path) { Content = JsonContent.Create(new LoginAccount(email, "guclu-parola-1")) };
            request.Headers.Add(WebSessionCookies.CsrfHeader, "1");
            return request;
        }

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(Login("/api/v1/auth/web/login", "owner@example.com"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(Login("/api/v1/auth/admin/login", "customer@example.com"))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(Login("/api/v1/auth/admin/login", "owner@example.com"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("owner@example.com", "guclu-parola-1"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, "/api/v1/me", ownerToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Get(client, "/api/v1/me", customerToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, "/api/v1/admin/session", customerToken)).StatusCode);

        async Task<HttpResponseMessage> Refresh(string path, string refreshToken) {
            var request = new HttpRequestMessage(HttpMethod.Post, path) { Content = JsonContent.Create(new { }) };
            request.Headers.Add(WebSessionCookies.CsrfHeader, "1");
            request.Headers.Add("Cookie", $"{WebSessionCookies.Refresh}={refreshToken}");
            return await client.SendAsync(request);
        }
        var ownerRefresh = (await accounts.IssueTokens((await accounts.Login("owner@example.com", "guclu-parola-1"))!.Id)).RefreshToken;
        var customerRefresh = (await accounts.IssueTokens((await accounts.Login("customer@example.com", "guclu-parola-1"))!.Id)).RefreshToken;
        Assert.Equal(HttpStatusCode.Unauthorized, (await Refresh("/api/v1/auth/web/refresh", ownerRefresh)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Refresh("/api/v1/auth/admin/refresh", customerRefresh)).StatusCode);
    }

    [Fact]
    public async Task ThePanelNeedsStaffWithTheRoutePermission()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await Register(client, "musteri@example.com");
        // A staff role that grants nothing: passes the staff gate, holds no permission.
        await Register(client, "stajyer@example.com");
        await accounts.AssignRole("stajyer@example.com", "intern");
        var intern = await StaffToken(factory, accounts, "stajyer@example.com");
        using var staff = await TestStaff.Client(factory);

        foreach (var path in new[] { "/api/v1/local-commerce/orders", "/api/v1/local-commerce/quotes", "/api/v1/local-commerce/assistant/leads", "/api/v1/local-commerce/surfaces" })
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await Get(client, path, null)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, path, customer)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Get(client, path, intern)).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await staff.GetAsync(path)).StatusCode);
        }
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/v1/local-commerce/prices/DEMO-V101-S", new { cents = 1 })).StatusCode);
        // The local storefront still reads the catalog and media without signing in.
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/local-commerce/state")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/local-commerce/media/" + new string('a', 32) + ".png")).StatusCode);
    }

    [Theory]
    [InlineData("/api/v1/local-commerce/products/{id}", "PUT", "catalog.write")]
    [InlineData("/api/v1/local-commerce/state", "GET", "catalog.read")]
    [InlineData("/api/v1/local-commerce/prices/{id}", "PUT", "pricing.write")]
    [InlineData("/api/v1/local-commerce/orders/{id}/requests/{requestId}", "POST", "orders.cancel")]
    [InlineData("/api/v1/local-commerce/orders/{id}/shipment", "POST", "orders.write")]
    [InlineData("/api/v1/local-commerce/reviews/{id}/moderation", "POST", "content.write")]
    [InlineData("/api/v1/local-commerce/assistant/usage", "GET", "ai.read")]
    [InlineData("/api/v1/local-commerce/surfaces/{p}/{v}/approval", "DELETE", "catalog.write")]
    public void PanelRoutesMapToPermissions(string route, string method, string permission)
    {
        Assert.Equal(permission, Xinobi.Api.LocalCommerce.PanelAccess.PermissionFor(route, method));
        Assert.True(PermissionCatalog.Exists(permission));
    }

    [Fact]
    public void AnUnmappedPanelRouteFailsInsteadOfStayingOpen() =>
        Assert.Throws<InvalidOperationException>(() => Xinobi.Api.LocalCommerce.PanelAccess.PermissionFor("/api/v1/local-commerce/new-thing", "GET"));

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

    private sealed class RemovePermissions(string[] permissions) : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            foreach (var identity in principal.Identities)
                foreach (var claim in identity.FindAll(PermissionAuthorization.PermissionClaim).Where(c => permissions.Contains(c.Value)).ToArray())
                    identity.RemoveClaim(claim);
            return Task.FromResult(principal);
        }
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task DirectAndRequestedCancellationRequireCancelPermission(bool allowed)
    {
        using var isolated = Factory();
        using var factory = isolated.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
            services.AddSingleton<IClaimsTransformation>(new RemovePermissions(allowed ? [] : ["orders.cancel"]))));
        Assert.IsType<DevFileAccountStore>(factory.Services.GetRequiredService<IAccountStore>());
        Assert.Equal("", factory.Services.GetRequiredService<IConfiguration>()["ConnectionStrings:Xinobi"]);
        using var client = await TestStaff.Client(factory);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Synthetic", "cancel@example.invalid", "synthetic-password-1");
        var now = DateTimeOffset.UtcNow;
        var order = await accounts.PlaceOrder(customer.Id, "permission-test", () => new CustomerOrder("cancel-order", "XN-TEST", now, OrderStatuses.Received,
            new CustomerAddress("a", "Ev", "Synthetic", "+905321234567", "İstanbul", "Kadıköy", "Test adresi", null, true),
            [new CustomerOrderLine("p", "v", "Synthetic", "Mavi", null, new Money(100, "TRY"), 1, new Money(100, "TRY"))], new Money(100, "TRY")));
        var status = await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/status", new SetOrderStatus(OrderStatuses.Cancelled, null));
        Assert.Equal(allowed ? HttpStatusCode.OK : HttpStatusCode.Forbidden, status.StatusCode);
        Assert.Equal(allowed ? OrderStatuses.Cancelled : OrderStatuses.Received, (await accounts.Orders(customer.Id)).Single().Status);
        if (!allowed)
        {
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/requests/request", new DecideOrderRequest("approve", null))).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/status", new SetOrderStatus(OrderStatuses.Preparing, null))).StatusCode);
        }
    }

    [Theory]
    [InlineData(false, true)]
    [InlineData(true, false)]
    [InlineData(true, true)]
    [InlineData(false, false)]
    public async Task InventoryPermissionProtectsStockAcrossDedicatedAndCatalogWrites(bool inventory, bool catalog)
    {
        using var isolated = Factory();
        using var factory = isolated.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
            services.AddSingleton<IClaimsTransformation>(new RemovePermissions(new[] { inventory ? "" : "inventory.write", catalog ? "" : "catalog.write" }))));
        Assert.IsType<DevFileAccountStore>(factory.Services.GetRequiredService<IAccountStore>());
        Assert.Equal("", factory.Services.GetRequiredService<IConfiguration>()["ConnectionStrings:Xinobi"]);
        using var client = await TestStaff.Client(factory);
        var store = factory.Services.GetRequiredService<LocalCommerceStore>();
        var product = (await store.Read()).Products.First();
        var variant = product.Variants.First();
        var original = variant.Stock;
        var changed = product with { Variants = product.Variants.Select(v => v.Id == variant.Id ? v with { Stock = original + 1 } : v).ToArray() };
        Assert.Equal(inventory && catalog ? HttpStatusCode.OK : HttpStatusCode.Forbidden,
            (await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", changed)).StatusCode);
        Assert.Equal(inventory && catalog ? original + 1 : original, (await store.Read()).Products.First().Variants.First().Stock);
        Assert.Equal(inventory ? HttpStatusCode.OK : HttpStatusCode.Forbidden,
            (await client.PutAsJsonAsync($"/api/v1/local-commerce/inventory/{variant.Id}", new { stock = original + 2 })).StatusCode);
        var current = (await store.Read()).Products.First();
        Assert.Equal(inventory ? original + 2 : original, current.Variants.First().Stock);
        Assert.Equal(catalog ? HttpStatusCode.OK : HttpStatusCode.Forbidden,
            (await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", current with { Name = "Updated name" })).StatusCode);
        var withoutStockedVariant = current with { Active = false, Variants = current.Variants.Where(v => v.Id != variant.Id).ToArray() };
        Assert.Equal(inventory && catalog ? HttpStatusCode.OK : HttpStatusCode.Forbidden,
            (await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", withoutStockedVariant)).StatusCode);
        if (inventory && catalog) Assert.Equal(HttpStatusCode.OK,
            (await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{product.Id}", current)).StatusCode);
        var created = product with { Id = "permission-product", Variants = [variant with { Id = "permission-variant", Sku = "PERMISSION-SKU", Stock = 1 }] };
        Assert.Equal(inventory && catalog ? HttpStatusCode.OK : HttpStatusCode.Forbidden,
            (await client.PutAsJsonAsync($"/api/v1/local-commerce/products/{created.Id}", created)).StatusCode);
        Assert.Equal(inventory && catalog ? HttpStatusCode.OK : HttpStatusCode.Forbidden,
            (await client.DeleteAsync($"/api/v1/local-commerce/products/{product.Id}")).StatusCode);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
