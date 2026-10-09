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
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Notifications;
using Xinobi.Api.Orders;

namespace Xinobi.Architecture.Tests;

/// <summary>
/// Order lifecycle (cancel, ship, deliver, return) and the notifications it raises. The notification worker is off and every
/// test address is a reserved example.com one, so no e-mail can leave even though Development loads the developer's SMTP settings.
/// </summary>
public sealed class OrderLifecycleTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-order-test-" + Guid.NewGuid());
    private static readonly DateTimeOffset Now = new(2026, 10, 9, 12, 0, 0, TimeSpan.Zero);

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Notifications:WorkerEnabled", "false");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services => { services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(new PreviewSender()); });
    });

    private sealed class PreviewSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private static CustomerOrder Order(string status = OrderStatuses.Received) => new("o1", "XN-1", Now, status,
        new CustomerAddress("a1", "Ev", "Ayşe", "+905321234567", "İstanbul", "Kadıköy", "Moda Cad. 1", null, true),
        [new CustomerOrderLine("p", "v1", "Çay", "Mavi", null, new Money(1000, "TRY"), 2, new Money(2000, "TRY")), new CustomerOrderLine("p", "v2", "Çay", "Kırmızı", null, new Money(1000, "TRY"), 1, new Money(1000, "TRY"))],
        new Money(3000, "TRY"));

    private static string Code(Action action) => Assert.Throws<ProblemException>(action).Code;

    [Fact]
    public void ReceivedOrderCancelsAtOncePreparingOneWaitsForThePanel()
    {
        var cancelled = OrderLifecycle.Cancel(Order(), new CancelMyOrder("Fikrimi değiştirdim", null), Now);
        Assert.Equal(OrderStatuses.Cancelled, cancelled.Status);
        Assert.Equal(OrderRequestStatuses.Completed, cancelled.Requests!.Single().Status);
        Assert.Equal([OrderStatuses.Received, OrderStatuses.Cancelled], cancelled.History!.Select(item => item.Status));

        var preparing = OrderLifecycle.Cancel(Order(OrderStatuses.Preparing), new CancelMyOrder("Fikrimi değiştirdim", "Acil değil"), Now);
        Assert.Equal(OrderStatuses.Preparing, preparing.Status);
        Assert.Equal(OrderRequestStatuses.Requested, preparing.Requests!.Single().Status);
        Assert.Equal("request_pending", Code(() => OrderLifecycle.Cancel(preparing, new CancelMyOrder("Diğer", null), Now)));
        // A ship attempt waits for the open cancellation; approving it cancels the order.
        Assert.Equal("request_pending", Code(() => OrderLifecycle.Ship(preparing, "Aras Kargo", "AB12345", null, Now)));
        var approved = OrderLifecycle.Decide(preparing, preparing.Requests!.Single().Id, "approve", "Onaylandı", Now);
        Assert.Equal(OrderStatuses.Cancelled, approved.Status);

        Assert.Equal("not_cancellable", Code(() => OrderLifecycle.Cancel(Order(OrderStatuses.Shipped), new CancelMyOrder("Diğer", null), Now)));
        Assert.Equal("invalid_reason", Code(() => OrderLifecycle.Cancel(Order(), new CancelMyOrder("uydurma", null), Now)));
    }

    [Fact]
    public void ShippingNeedsAKnownCarrierAndAValidTrackingNumber()
    {
        Assert.Equal("invalid_carrier", Code(() => OrderLifecycle.Ship(Order(), "Bilinmeyen", "AB12345", null, Now)));
        Assert.Equal("invalid_tracking_number", Code(() => OrderLifecycle.Ship(Order(), "Aras Kargo", "a b", null, Now)));
        Assert.Equal("invalid_tracking_url", Code(() => OrderLifecycle.Ship(Order(), "Aras Kargo", "AB12345", "http://insecure.example/x", Now)));
        var shipped = OrderLifecycle.Ship(Order(), "Aras Kargo", "AB12345", "https://kargo.example/takip?no=AB12345", Now);
        Assert.Equal(OrderStatuses.Shipped, shipped.Status);
        Assert.Equal("AB12345", shipped.Shipment!.TrackingNumber);
        var delivered = OrderLifecycle.SetStatus(shipped, OrderStatuses.Delivered, null, Now.AddDays(2));
        Assert.Equal(Now.AddDays(2), delivered.Shipment!.DeliveredAt);
        Assert.Equal("invalid_transition", Code(() => OrderLifecycle.SetStatus(delivered, OrderStatuses.Preparing, null, Now)));
        Assert.Equal("invalid_transition", Code(() => OrderLifecycle.SetStatus(shipped, OrderStatuses.Cancelled, null, Now)));
    }

    [Fact]
    public void ReturnsStayInsideTheWindowAndTheOrderedQuantities()
    {
        var delivered = OrderLifecycle.SetStatus(OrderLifecycle.Ship(Order(), "PTT Kargo", "PT998877", null, Now), OrderStatuses.Delivered, null, Now);
        Assert.Equal("not_returnable", Code(() => OrderLifecycle.Return(Order(), new ReturnMyOrder("Diğer", null, [new("v1", 1)]), 14, Now)));
        Assert.Equal("return_window_closed", Code(() => OrderLifecycle.Return(delivered, new ReturnMyOrder("Diğer", null, [new("v1", 1)]), 14, Now.AddDays(15))));
        Assert.Equal("invalid_lines", Code(() => OrderLifecycle.Return(delivered, new ReturnMyOrder("Diğer", null, [new("v1", 3)]), 14, Now)));
        Assert.Equal("invalid_lines", Code(() => OrderLifecycle.Return(delivered, new ReturnMyOrder("Diğer", null, [new("v9", 1)]), 14, Now)));

        var first = OrderLifecycle.Return(delivered, new ReturnMyOrder("Ürün hasarlı ulaştı", "Kutu ezik", [new("v1", 2)]), 14, Now.AddDays(1));
        Assert.Equal(new Dictionary<string, int> { ["v2"] = 1 }, OrderLifecycle.Returnable(first));
        var request = first.Requests!.Last();
        Assert.Equal("invalid_decision", Code(() => OrderLifecycle.Decide(first, request.Id, "complete", null, Now)));
        var approved = OrderLifecycle.Decide(first, request.Id, "approve", null, Now);
        var completed = OrderLifecycle.Decide(approved, request.Id, "complete", "Ürün depoya ulaştı", Now);
        Assert.Equal(OrderStatuses.Delivered, completed.Status);

        // Returning the last line too brings every item back and closes the order as returned.
        var second = OrderLifecycle.Return(completed, new ReturnMyOrder("Diğer", null, [new("v2", 1)]), 14, Now.AddDays(2));
        var last = second.Requests!.Last().Id;
        var returned = OrderLifecycle.Decide(OrderLifecycle.Decide(second, last, "approve", null, Now), last, "complete", null, Now);
        Assert.Equal(OrderStatuses.Returned, returned.Status);
        Assert.Empty(OrderLifecycle.Returnable(returned));

        // A rejected return frees its quantity again.
        var rejected = OrderLifecycle.Decide(first, request.Id, "reject", "Kullanılmış ürün", Now);
        Assert.Equal(2, OrderLifecycle.Returnable(rejected)["v1"]);
    }

    [Fact]
    public void ReservedTestDomainsAreNeverMailed()
    {
        Assert.True(NotificationCenter.ReservedAddress("ayse@example.com"));
        Assert.True(NotificationCenter.ReservedAddress("a@shop.test"));
        Assert.True(NotificationCenter.ReservedAddress("a@x.invalid"));
        Assert.False(NotificationCenter.ReservedAddress("musteri@gmail.com"));
    }

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, object? body = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    private static async Task<T> Read<T>(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task<string> Register(HttpClient client, string email)
    {
        var challenge = await Read<AccountEmailVerification>(await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification(email)));
        return (await Read<AuthSession>(await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterAccount("Ayşe Yılmaz", email, "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!)))).AccessToken;
    }

    private static async Task<CustomerOrder> PlaceOrder(HttpClient client, string token, string requestId)
    {
        var address = await Read<CustomerAddress>(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token,
            new SaveCustomerAddress("Ev", "Ayşe Yılmaz", "0532 123 45 67", "İstanbul", "Kadıköy", "Moda Cad. No: 1 D: 2", "34710", true)));
        return await Read<CustomerOrder>(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, new PlaceOrder(address.Id, [new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 2)], requestId)));
    }

    [Fact]
    public async Task CustomerAndPanelDriveTheOrderAndTheCustomerIsNotified()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client, "ayse@example.com");
        var other = await Register(client, "other@example.com");
        var order = await PlaceOrder(client, token, "request-0001");
        Assert.Equal(OrderStatuses.Received, order.Status);
        Assert.Single(order.History!);

        // Only the owner sees the order.
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}", other)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Post, $"/api/v1/me/orders/{order.Id}/cancellation", other, new CancelMyOrder("Diğer", null))).StatusCode);

        var options = await Read<OrderOptions>(await Send(client, HttpMethod.Get, "/api/v1/me/order-options", token));
        Assert.Equal(14, options.ReturnWindowDays);

        // Panel: prepare, ship, deliver.
        var panel = await Read<StaffOrder[]>(await client.GetAsync("/api/v1/local-commerce/orders"));
        Assert.Equal("ayse@example.com", panel.Single().CustomerEmail);
        await Read<CustomerOrder>(await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/status", new SetOrderStatus(OrderStatuses.Preparing, null)));
        var badShip = await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/shipment", new ShipOrder("Aras Kargo", "x", null));
        Assert.Equal(HttpStatusCode.BadRequest, badShip.StatusCode);
        Assert.Contains("Takip numarası", (await badShip.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("message").GetString());
        await Read<CustomerOrder>(await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/shipment", new ShipOrder("Aras Kargo", "AR123456", null)));

        var shipped = await Read<CustomerOrder>(await Send(client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}", token));
        Assert.Equal(OrderStatuses.Shipped, shipped.Status);
        Assert.Equal("Aras Kargo", shipped.Shipment!.Carrier);
        var notCancellable = await Send(client, HttpMethod.Post, $"/api/v1/me/orders/{order.Id}/cancellation", token, new CancelMyOrder("Diğer", null));
        Assert.Equal(HttpStatusCode.Conflict, notCancellable.StatusCode);

        await Read<CustomerOrder>(await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/status", new SetOrderStatus(OrderStatuses.Delivered, null)));
        var returned = await Read<CustomerOrder>(await Send(client, HttpMethod.Post, $"/api/v1/me/orders/{order.Id}/returns", token, new ReturnMyOrder("Ürün hasarlı ulaştı", null, [new("DEMO-V101-B", 1)])));
        var request = returned.Requests!.Single();
        await Read<CustomerOrder>(await client.PostAsJsonAsync($"/api/v1/local-commerce/orders/{order.Id}/requests/{request.Id}", new DecideOrderRequest("approve", null)));

        // In-app inbox: placed, preparing, shipped, delivered, return requested, return approved — newest first.
        var inbox = await Read<Inbox>(await Send(client, HttpMethod.Get, "/api/v1/me/notifications", token));
        Assert.Equal(["return_approved", "return_requested", "order_delivered", "order_shipped", "order_preparing", "order_placed"], inbox.Items.Select(item => item.Kind));
        Assert.Equal(6, inbox.Unread);
        Assert.Contains("AR123456", inbox.Items.Single(item => item.Kind == "order_shipped").Body);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Post, "/api/v1/me/notifications/read", token, new MarkNotificationsRead(null))).StatusCode);
        Assert.Equal(0, (await Read<Inbox>(await Send(client, HttpMethod.Get, "/api/v1/me/notifications", token))).Unread);
        Assert.Empty((await Read<Inbox>(await Send(client, HttpMethod.Get, "/api/v1/me/notifications", other))).Items);

        // The outbox never mails the reserved test domain; SMS and push are previews in Development.
        var outbox = (await client.GetFromJsonAsync<JsonElement>("/api/v1/local-commerce/notifications?channel=email")).GetProperty("items");
        Assert.All(outbox.EnumerateArray(), item => Assert.Equal(NotificationStatuses.Skipped, item.GetProperty("status").GetString()));
    }

    [Fact]
    public async Task RetriedOrderRequestNotifiesOnce()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client, "ayse@example.com");
        var first = await PlaceOrder(client, token, "request-0001");
        var address = (await Read<CustomerAddress[]>(await Send(client, HttpMethod.Get, "/api/v1/me/addresses", token))).Single();
        var retry = await Read<CustomerOrder>(await Send(client, HttpMethod.Post, "/api/v1/me/orders", token, new PlaceOrder(address.Id, [new PlaceOrderItem("DEMO-P101", "DEMO-V101-B", 2)], "request-0001")));
        Assert.Equal(first.Id, retry.Id);
        Assert.Single((await Read<Inbox>(await Send(client, HttpMethod.Get, "/api/v1/me/notifications", token))).Items);
    }

    [Fact]
    public async Task DeviceRegistrationValidatesTheToken()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var token = await Register(client, "ayse@example.com");
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/me/devices", token, new RegisterDevice("short", "android"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/me/devices", token, new RegisterDevice(new string('a', 40), "windows"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Post, "/api/v1/me/devices", token, new RegisterDevice(new string('a', 40), "android"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Get, "/api/v1/me/notifications", null)).StatusCode);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
