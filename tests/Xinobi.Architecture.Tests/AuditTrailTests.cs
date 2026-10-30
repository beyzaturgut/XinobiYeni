using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

/// <summary>Audit trail (Faz03 03.06) on Development file storage: panel changes are recorded without bodies, read with audit.read.</summary>
public sealed class AuditTrailTests : IDisposable
{
    private readonly string dataDirectory = Path.Combine(Path.GetTempPath(), "xinobi-audit-test-" + Guid.NewGuid());
    private const string Root = "/api/v1/local-commerce";

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory(dataDirectory).WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = dataDirectory }));
    });

    private static async Task<(HttpClient Client, string Id)> Customer(WebApplicationFactory<Program> factory)
    {
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Müşteri", $"musteri-{Guid.NewGuid():N}@example.com", "guclu-parola-1");
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", (await accounts.IssueTokens(account.Id)).AccessToken);
        return (client, account.Id);
    }

    [Fact]
    public async Task PanelChangeIsRecordedWithActorRouteAndStatusButNoBody()
    {
        using var factory = Factory();
        using var staff = await TestStaff.Client(factory);
        var state = (await staff.GetFromJsonAsync<CommerceState>(Root + "/state"))!;
        var variant = state.Products[0].Variants[0].Id;
        (await staff.PutAsJsonAsync(Root + "/prices/" + variant, new PriceUpdate(987_654))).EnsureSuccessStatusCode();

        var entries = (await staff.GetFromJsonAsync<AuditEntry[]>(Root + "/audit?entityType=pricing"))!;
        var entry = Assert.Single(entries);
        Assert.Equal("PUT local-commerce/prices/{id}", entry.Action);
        Assert.Equal(variant, entry.EntityId);
        Assert.Equal(200, entry.Status);
        Assert.False(string.IsNullOrEmpty(entry.ActorId));
        Assert.False(string.IsNullOrEmpty(entry.TraceId));
        Assert.DoesNotContain("987654", await File.ReadAllTextAsync(Path.Combine(dataDirectory, "audit", "audit.jsonl")));
    }

    [Fact]
    public async Task RefusedAndFailedChangesAreRecordedAndReadsAreNot()
    {
        using var factory = Factory();
        var (customer, customerId) = await Customer(factory);
        using (customer)
        {
            Assert.Equal(HttpStatusCode.Forbidden, (await customer.PutAsJsonAsync(Root + "/prices/v-1", new PriceUpdate(1))).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await customer.GetAsync(Root + "/audit")).StatusCode);
        }
        using var staff = await TestStaff.Client(factory);
        Assert.Equal(HttpStatusCode.BadRequest, (await staff.PutAsJsonAsync(Root + "/prices/yok", new PriceUpdate(1))).StatusCode);

        var entries = (await staff.GetFromJsonAsync<AuditEntry[]>(Root + "/audit"))!;
        Assert.Equal(2, entries.Length);
        Assert.Equal(400, entries[0].Status);
        Assert.Equal("yok", entries[0].EntityId);
        Assert.Equal(403, entries[1].Status);
        Assert.Equal(customerId, entries[1].ActorId);
        Assert.Equal("pricing", entries[1].EntityType);
    }

    public void Dispose()
    {
        if (Directory.Exists(dataDirectory)) Directory.Delete(dataDirectory, true);
    }
}
