using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;

namespace Xinobi.Architecture.Tests;

public sealed class SessionCookieIsolationTests
{
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task BothLoginOrdersKeepAddressDeletionAndLogoutIndependent(bool adminFirst)
    {
        using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Customer", "modal-customer@example.invalid", "test-password-1");
        var staff = await accounts.Register("Staff", "modal-staff@example.invalid", "test-password-2");
        await accounts.AssignRole(staff.Email, Roles.SuperAdmin);
        async Task LoginCustomer()
        {
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/web/login", new LoginAccount(customer.Email, "test-password-1"))).StatusCode);
        }
        async Task LoginAdmin()
        {
            var login = await client.PostAsJsonAsync("/api/v1/auth/admin/login", new LoginAccount(staff.Email, "test-password-2"));
            Assert.Equal(HttpStatusCode.OK, login.StatusCode);
            var challenge = (await login.Content.ReadFromJsonAsync<AdminMfaChallenge>())!;
            Assert.NotNull(challenge.PreviewCode);
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify", new VerifyAdminMfa(challenge.ChallengeId, challenge.PreviewCode!))).StatusCode);
        }
        if (adminFirst) { await LoginAdmin(); await LoginCustomer(); }
        else { await LoginCustomer(); await LoginAdmin(); }
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/me")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsJsonAsync("/api/v1/me/favorites", new AddFavorite("DEMO-P101"))).StatusCode);
        Assert.Equal(new[] { "DEMO-P101" }, await client.GetFromJsonAsync<string[]>("/api/v1/me/favorites"));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/web/refresh", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/admin/refresh", new { })).StatusCode);
        var address = new SaveCustomerAddress("Modal Test", "Temporary User", "+905321234567", "İstanbul", "Kadıköy", "Temporary address", "34710", true);
        var created = await client.PostAsJsonAsync("/api/v1/me/addresses", address);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var saved = (await created.Content.ReadFromJsonAsync<CustomerAddress>())!;
        client.DefaultRequestHeaders.Remove(WebSessionCookies.CsrfHeader);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync("/api/v1/me/addresses/" + saved.Id)).StatusCode);
        Assert.Single((await client.GetFromJsonAsync<CustomerAddress[]>("/api/v1/me/addresses"))!);
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/v1/me/addresses/" + saved.Id)).StatusCode);
        Assert.Empty((await client.GetFromJsonAsync<CustomerAddress[]>("/api/v1/me/addresses"))!);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        if (adminFirst)
        {
            Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/web/logout", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/me")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/me/favorites")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
        }
        else
        {
            Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/admin/logout", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/admin/session")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/me")).StatusCode);
            Assert.Equal(new[] { "DEMO-P101" }, await client.GetFromJsonAsync<string[]>("/api/v1/me/favorites"));
            Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/v1/me/favorites/DEMO-P101")).StatusCode);
        }
    }

    [Fact]
    public async Task CookiesSelectTheCorrectAccountAndLegacyCookiesCannotAuthenticate()
    {
        using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions { HandleCookies = false });
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var customer = await accounts.Register("Customer", "cookie-customer@example.invalid", "test-password-1");
        var staff = await accounts.Register("Staff", "cookie-staff@example.invalid", "test-password-2");
        await accounts.AssignRole(staff.Email, Roles.SuperAdmin);
        var customerTokens = await accounts.IssueTokens(customer.Id);
        var staffTokens = await accounts.IssueTokens(staff.Id);
        await factory.Services.GetRequiredService<AdminMfa>().Grant(staff.Id, staffTokens);
        var both = $"{WebSessionCookies.Access}={customerTokens.AccessToken}; {WebSessionCookies.AdminAccess}={staffTokens.AccessToken}";
        async Task<HttpResponseMessage> Send(string path, string cookies, bool csrf = true, HttpMethod? method = null)
        {
            using var request = new HttpRequestMessage(method ?? HttpMethod.Get, path);
            request.Headers.Add("Cookie", cookies);
            if (csrf) request.Headers.Add(WebSessionCookies.CsrfHeader, "1");
            return await client.SendAsync(request);
        }
        var me = await Send("/api/v1/me", both);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal(customer.Id, (await me.Content.ReadFromJsonAsync<AccountProfile>())!.Id);
        var admin = await Send("/api/v1/admin/session", both);
        Assert.Equal(HttpStatusCode.OK, admin.StatusCode);
        Assert.Equal(staff.Id, (await admin.Content.ReadFromJsonAsync<AdminSession>())!.Account.Id);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send("/api/v1/me", $"xinobi_at={customerTokens.AccessToken}")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send("/api/v1/admin/session", $"xinobi_at={staffTokens.AccessToken}")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send("/api/v1/me/addresses/not-owned", both, false, HttpMethod.Delete)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Send("/api/v1/me/addresses/00000000000000000000000000000001", both, true, HttpMethod.Delete)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send("/api/v1/me", $"{WebSessionCookies.Access}={staffTokens.AccessToken}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send("/api/v1/admin/session", $"{WebSessionCookies.AdminAccess}={customerTokens.AccessToken}")).StatusCode);
        using var login = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/web/login") { Content = JsonContent.Create(new LoginAccount(customer.Email, "test-password-1")) };
        login.Headers.Add(WebSessionCookies.CsrfHeader, "1");
        var response = await client.SendAsync(login);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var cookies = response.Headers.GetValues("Set-Cookie").ToArray();
        Assert.Contains(cookies, x => x.StartsWith("xinobi_at=;"));
        Assert.Contains(cookies, x => x.StartsWith("xinobi_rt=;"));
        Assert.DoesNotContain(cookies, x => x.StartsWith(WebSessionCookies.AdminAccess + "="));
    }
}
