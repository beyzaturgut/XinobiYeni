using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;

namespace Xinobi.Architecture.Tests;

/// <summary>A client signed in as a super admin, for tests that drive the panel (/api/v1/local-commerce).</summary>
public static class TestStaff
{
    public static async Task<HttpClient> Client(WebApplicationFactory<Program> factory)
    {
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var email = $"yonetici-{Guid.NewGuid():N}@example.com";
        var account = await accounts.Register("Panel Yöneticisi", email, "guclu-parola-1");
        await accounts.AssignRole(email, Roles.SuperAdmin);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", (await accounts.IssueTokens(account.Id)).AccessToken);
        return client;
    }
}
