using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Catalog;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;

namespace Xinobi.Architecture.Tests;

/// <summary>
/// The signed-in customer's own data (/api/v1/me): phone, e-mail change, deletion, addresses and demo orders.
/// The e-mail sender is replaced in DI (the developer's appsettings.Local.json may select real SMTP); nothing is sent.
/// </summary>
public sealed class CustomerTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-customer-test-" + Guid.NewGuid());

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services => { services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(new PreviewSender()); });
    });

    private sealed class PreviewSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private static async Task<AccountEmailVerification> Code(HttpClient client, string path, object body, string? token = null)
    {
        var response = await Send(client, HttpMethod.Post, path, token, body);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<AccountEmailVerification>())!;
    }

    private static async Task<string> Register(HttpClient client, string email = "ayse@example.com", string password = "guclu-parola-1")
    {
        var challenge = await Code(client, "/api/v1/auth/email-verification", new StartAccountEmailVerification(email));
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe Yılmaz", email, password, challenge.VerificationId, challenge.PreviewCode!));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<AuthSession>())!.AccessToken;
    }

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, object? body = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    private static async Task<string?> Problem(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    private static SaveCustomerAddress Address(string title, bool isDefault = false, string phone = "0532 123 45 67") =>
        new(title, "Ayşe Yılmaz", phone, "İstanbul", "Kadıköy", "Moda Cad. No: 1 D: 2", "34710", isDefault);

    [Fact]
    public async Task PhoneIsNormalisedAndCanBeRemoved()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client);
        async Task<AccountProfile> Patch(string? phone)
        {
            var response = await Send(client, HttpMethod.Patch, "/api/v1/me", token, new UpdateMyAccount("Ayşe Yılmaz", phone));
            response.EnsureSuccessStatusCode();
            return (await response.Content.ReadFromJsonAsync<AccountProfile>())!;
        }

        Assert.Equal("+905321234567", (await Patch("0532 123 45 67")).Phone);
        Assert.Equal("+905321234567", (await Patch(null)).Phone);
        Assert.Equal("+902161234567", (await Patch("+90 (216) 123-45-67")).Phone);
        Assert.Null((await Patch("")).Phone);
        Assert.Equal("invalid_phone", await Problem(await Send(client, HttpMethod.Patch, "/api/v1/me", token, new UpdateMyAccount("Ayşe", "12345"))));
    }

    [Fact]
    public async Task EmailChangeNeedsTheCodeAndThePassword()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client);
        await Register(client, "taken@example.com");

        Assert.Equal("same_email", await Problem(await Send(client, HttpMethod.Post, "/api/v1/me/email-verification", token, new StartEmailChange("ayse@example.com"))));
        var taken = await Send(client, HttpMethod.Post, "/api/v1/me/email-verification", token, new StartEmailChange("taken@example.com"));
        Assert.Equal(HttpStatusCode.Conflict, taken.StatusCode);

        var challenge = await Code(client, "/api/v1/me/email-verification", new StartEmailChange("Yeni@Example.com"), token);
        Assert.Equal("yeni@example.com", challenge.Email);
        var wrongPassword = await Send(client, HttpMethod.Put, "/api/v1/me/email", token, new ConfirmEmailChange("yeni@example.com", challenge.VerificationId, challenge.PreviewCode!, "yanlis-parola"));
        Assert.Equal("wrong_password", await Problem(wrongPassword));
        var wrongCode = await Send(client, HttpMethod.Put, "/api/v1/me/email", token, new ConfirmEmailChange("yeni@example.com", challenge.VerificationId, challenge.PreviewCode == "000000" ? "111111" : "000000", "guclu-parola-1"));
        Assert.Equal(HttpStatusCode.BadRequest, wrongCode.StatusCode);

        // The same challenge still works after a wrong code (5 attempts); a new code for the same address waits for the resend cooldown.
        var changed = await Send(client, HttpMethod.Put, "/api/v1/me/email", token, new ConfirmEmailChange("yeni@example.com", challenge.VerificationId, challenge.PreviewCode!, "guclu-parola-1"));
        changed.EnsureSuccessStatusCode();
        Assert.Equal("yeni@example.com", (await changed.Content.ReadFromJsonAsync<AccountProfile>())!.Email);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("yeni@example.com", "guclu-parola-1"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "guclu-parola-1"))).StatusCode);
    }

    [Fact]
    public async Task DeletionNeedsThePasswordAndRemovesEverything()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client);
        (await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token, Address("Ev"))).EnsureSuccessStatusCode();

        Assert.Equal("wrong_password", await Problem(await Send(client, HttpMethod.Post, "/api/v1/me/deletion", token, new DeleteMyAccount("yanlis-parola"))));
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Post, "/api/v1/me/deletion", token, new DeleteMyAccount("guclu-parola-1"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Get, "/api/v1/me", token)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginAccount("ayse@example.com", "guclu-parola-1"))).StatusCode);
    }

    [Fact]
    public async Task AddressesKeepExactlyOneDefaultAndStayPrivate()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client);
        var other = await Register(client, "mehmet@example.com");
        async Task<CustomerAddress> Add(SaveCustomerAddress address)
        {
            var response = await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token, address);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            return (await response.Content.ReadFromJsonAsync<CustomerAddress>())!;
        }
        async Task<CustomerAddress[]> List(string who) => (await (await Send(client, HttpMethod.Get, "/api/v1/me/addresses", who)).Content.ReadFromJsonAsync<CustomerAddress[]>())!;

        var home = await Add(Address("Ev"));
        Assert.True(home.IsDefault, "The first address becomes the default.");
        Assert.Equal("+905321234567", home.Phone);
        var work = await Add(Address("İş"));
        Assert.False(work.IsDefault);
        var updated = await Send(client, HttpMethod.Put, $"/api/v1/me/addresses/{work.Id}", token, Address("İş", isDefault: true));
        updated.EnsureSuccessStatusCode();
        Assert.Equal(["İş", "Ev"], (await List(token)).Select(address => address.Title));
        Assert.Single(await List(token), address => address.IsDefault);

        Assert.Empty(await List(other));
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Delete, $"/api/v1/me/addresses/{work.Id}", other)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/me/addresses/{work.Id}", token)).StatusCode);
        Assert.True((await List(token)).Single().IsDefault, "Deleting the default promotes the next address.");

        Assert.Equal("invalid_phone", await Problem(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token, Address("Yazlık", phone: "123"))));
        for (var i = 1; i < CustomerRules.MaxAddresses; i++) await Add(Address($"Adres {i}"));
        Assert.Equal("address_limit", await Problem(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token, Address("Fazla"))));
    }

    [Fact]
    public async Task DemoOrdersUseCatalogPricesAndAreIdempotent()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client);
        var address = (await (await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token, Address("Ev"))).Content.ReadFromJsonAsync<CustomerAddress>())!;
        var request = new PlaceOrder(address.Id, [new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1), new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1)], "request-0001");

        var placed = await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, request);
        Assert.Equal(HttpStatusCode.Created, placed.StatusCode);
        var order = (await placed.Content.ReadFromJsonAsync<CustomerOrder>())!;
        Assert.Equal(OrderStatuses.Received, order.Status);
        Assert.Matches("^XN-[0-9]{6}-[0-9]{4}$", order.Number);
        var line = Assert.Single(order.Lines);
        Assert.Equal(2, line.Quantity);
        Assert.Equal(new Money(240000, "TRY"), line.UnitPrice);
        Assert.Equal(new Money(480000, "TRY"), order.Total);
        Assert.Equal("Moda Cad. No: 1 D: 2", order.Address.Line);
        Assert.StartsWith("http://localhost:3000/assets/", line.ImageUrl);
        // The stored path is resolved per request: another host (e.g. the Android emulator) gets its own URL.
        using (var fromEmulator = new HttpRequestMessage(HttpMethod.Get, "/api/v1/me/orders"))
        {
            fromEmulator.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            fromEmulator.Headers.Host = "10.0.2.2:5003";
            var seen = (await (await client.SendAsync(fromEmulator)).Content.ReadFromJsonAsync<CustomerOrder[]>())!.Single();
            Assert.StartsWith("http://10.0.2.2:3000/assets/", seen.Lines.Single().ImageUrl);
        }

        var retry = (await (await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, request)).Content.ReadFromJsonAsync<CustomerOrder>())!;
        Assert.Equal(order.Id, retry.Id);
        Assert.Single((await (await Send(client, HttpMethod.Get, "/api/v1/me/orders", token)).Content.ReadFromJsonAsync<CustomerOrder[]>())!);

        var unpriced = await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, new PlaceOrder(address.Id, [new PlaceOrderItem("DEMO-P101", "DEMO-V101-S", 1)], "request-0002"));
        Assert.Equal(HttpStatusCode.Conflict, unpriced.StatusCode);
        Assert.Equal("cart_changed", await Problem(unpriced));
        var tooMany = await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, new PlaceOrder(address.Id, [new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 99)], "request-0003"));
        Assert.Equal("cart_changed", await Problem(tooMany));
        var noAddress = await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, new PlaceOrder("missing", [new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 1)], "request-0004"));
        Assert.Equal("address_not_found", await Problem(noAddress));

        // The order keeps its own copy of the address.
        (await Send(client, HttpMethod.Delete, $"/api/v1/me/addresses/{address.Id}", token)).EnsureSuccessStatusCode();
        var kept = (await (await Send(client, HttpMethod.Get, "/api/v1/me/orders", token)).Content.ReadFromJsonAsync<CustomerOrder[]>())!.Single();
        Assert.Equal("Kadıköy", kept.Address.District);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Get, "/api/v1/me/orders", null)).StatusCode);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, recursive: true);
    }
}
