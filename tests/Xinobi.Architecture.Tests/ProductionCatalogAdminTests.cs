using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Identity;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class ProductionCatalogAdminTests
{
    private static WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Production");
        builder.UseSetting("AdminCatalog:Enabled", "true");
        builder.UseSetting("Catalog:StorageProvider", "SqlServer");
        builder.UseSetting("Accounts:StorageProvider", "SqlServer");
        builder.UseSetting("ConnectionStrings:Xinobi", "Server=localhost;Database=unused;Integrated Security=true");
        builder.UseSetting("Email:DeliveryMode", "Smtp");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Catalog:StorageProvider"] = "SqlServer"
        }));
        builder.ConfigureServices(services =>
        {
            // Authenticate through the real token handler with isolated accounts, without touching live SQL.
            services.RemoveAll<IAccountStore>();
            services.AddSingleton<IAccountStore, DevFileAccountStore>();
        });
    });

    [Fact]
    public async Task LiveCatalogNeedsStaffAndPermissionAndKeepsOtherPanelAreasClosed()
    {
        using var factory = Factory();
        using var client = factory.CreateClient(new() { BaseAddress = new Uri("https://localhost") });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/local-commerce/state")).StatusCode);
        foreach (var path in new[] { "products/p", "prices/v", "content" })
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/v1/local-commerce/" + path, new { })).StatusCode);
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Test", "test@example.invalid", "guclu-parola-1");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", (await accounts.IssueTokens(account.Id)).AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        await accounts.AssignRole(account.Email, "intern");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        await accounts.AssignRole(account.Email, Roles.SuperAdmin);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        using var cookieClient = factory.CreateClient(new() { BaseAddress = new Uri("https://localhost"), HandleCookies = false });
        cookieClient.DefaultRequestHeaders.Add("Cookie", $"{WebSessionCookies.Access}={client.DefaultRequestHeaders.Authorization!.Parameter}");
        Assert.Equal(HttpStatusCode.Unauthorized, (await cookieClient.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        cookieClient.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        cookieClient.DefaultRequestHeaders.Add("Origin", "https://localhost");
        Assert.Equal(HttpStatusCode.BadRequest, (await cookieClient.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        client.DefaultRequestHeaders.Add("Origin", "https://evil.example");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        client.DefaultRequestHeaders.Remove("Origin");
        using var insecure = factory.CreateClient(new() { BaseAddress = new Uri("http://localhost") });
        insecure.DefaultRequestHeaders.Authorization = client.DefaultRequestHeaders.Authorization;
        Assert.Equal(HttpStatusCode.Forbidden, (await insecure.PutAsJsonAsync("/api/v1/local-commerce/prices/v", new PriceUpdate(0))).StatusCode);
        Assert.True(factory.Services.GetRequiredService<LocalCommerceStore>().UsesSql);
        foreach (var path in new[] { "orders", "quotes", "surfaces", "notifications" })
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/local-commerce/" + path)).StatusCode);
    }

    [Fact]
    public void LiveAdminRejectsFileCatalogAtStartup()
    {
        using var factory = Factory().WithWebHostBuilder(builder => builder.UseSetting("Catalog:StorageProvider", "File"));
        Assert.Throws<InvalidOperationException>(() => factory.CreateClient());
    }
}
