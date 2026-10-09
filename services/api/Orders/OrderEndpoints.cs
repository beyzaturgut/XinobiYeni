using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Xinobi.Api.Catalog;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Notifications;

namespace Xinobi.Api.Orders;

public record OrderOptions(string[] CancelReasons, string[] ReturnReasons, string[] Carriers, int ReturnWindowDays);
public record SetOrderStatus(string Status, string? Note);
public record ShipOrder(string Carrier, string TrackingNumber, string? TrackingUrl);
public record DecideOrderRequest(string Decision, string? Resolution);

/// <summary>
/// Order lifecycle on top of the demo orders: the customer cancels or asks for a return under /api/v1/me/orders, the panel prepares,
/// ships (carrier + tracking number), delivers and decides requests under the Development panel group. Every change notifies the customer.
/// </summary>
public static class OrderEndpoints
{
    public static int ReturnWindowDays(IConfiguration configuration) => configuration.GetValue("Orders:ReturnWindowDays", 14);

    public static void MapCustomerOrders(RouteGroupBuilder me)
    {
        me.MapGet("/order-options", (IConfiguration configuration) => TypedResults.Ok(Options(configuration)))
            .WithName("GetOrderOptions");

        me.MapGet("/orders/{id}", async Task<Results<Ok<CustomerOrder>, ProblemHttpResult>> (string id, ClaimsPrincipal user, HttpContext http, IAccountStore accounts, IConfiguration configuration, IWebHostEnvironment environment) =>
                (await accounts.Orders(Id(user))).FirstOrDefault(order => order.Id == id) is { } order
                    ? TypedResults.Ok(WithImages(order, http, configuration, environment))
                    : ApiProblems.Problem(StatusCodes.Status404NotFound, "order_not_found", "Sipariş bulunamadı."))
            .WithName("GetMyOrder")
            .ProducesProblem(StatusCodes.Status404NotFound);

        me.MapPost("/orders/{id}/cancellation", async Task<Ok<CustomerOrder>> (string id, CancelMyOrder request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts,
                NotificationCenter notifications, TimeProvider clock, IConfiguration configuration, IWebHostEnvironment environment) =>
            {
                var (order, account) = await accounts.ChangeOrder(Id(user), id, order => OrderLifecycle.Cancel(order, request, clock.GetUtcNow()));
                await OrderNotifications.Send(notifications, account, order, order.Status == OrderStatuses.Cancelled ? "order_cancelled" : "cancel_requested");
                return TypedResults.Ok(WithImages(order, http, configuration, environment));
            })
            .WithName("CancelMyOrder")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        me.MapPost("/orders/{id}/returns", async Task<Ok<CustomerOrder>> (string id, ReturnMyOrder request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts,
                NotificationCenter notifications, TimeProvider clock, IConfiguration configuration, IWebHostEnvironment environment) =>
            {
                var (order, account) = await accounts.ChangeOrder(Id(user), id, order => OrderLifecycle.Return(order, request, ReturnWindowDays(configuration), clock.GetUtcNow()));
                await OrderNotifications.Send(notifications, account, order, "return_requested");
                return TypedResults.Ok(WithImages(order, http, configuration, environment));
            })
            .WithName("ReturnMyOrder")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    /// <summary>Panel routes (Development panel group: loopback and panel origins only, ADR-003).</summary>
    public static void MapPanelOrders(RouteGroupBuilder panel)
    {
        panel.MapGet("/orders", async (IAccountStore accounts) => TypedResults.Ok(await accounts.AllOrders()));
        panel.MapGet("/order-options", (IConfiguration configuration) => TypedResults.Ok(Options(configuration)));

        panel.MapPost("/orders/{id}/status", async (string id, SetOrderStatus request, IAccountStore accounts, NotificationCenter notifications, TimeProvider clock) =>
        {
            var (order, account) = await accounts.ChangeOrder(null, id, order => OrderLifecycle.SetStatus(order, request.Status, request.Note, clock.GetUtcNow()));
            await OrderNotifications.Send(notifications, account, order, "order_" + order.Status);
            return TypedResults.Ok(order);
        });

        panel.MapPost("/orders/{id}/shipment", async (string id, ShipOrder request, IAccountStore accounts, NotificationCenter notifications, TimeProvider clock) =>
        {
            var (order, account) = await accounts.ChangeOrder(null, id, order => OrderLifecycle.Ship(order, request.Carrier, request.TrackingNumber, request.TrackingUrl, clock.GetUtcNow()));
            await OrderNotifications.Send(notifications, account, order, "order_shipped");
            return TypedResults.Ok(order);
        });

        panel.MapPost("/orders/{id}/requests/{requestId}", async (string id, string requestId, DecideOrderRequest request, IAccountStore accounts, NotificationCenter notifications, TimeProvider clock) =>
        {
            var (order, account) = await accounts.ChangeOrder(null, id, order => OrderLifecycle.Decide(order, requestId, request.Decision, request.Resolution, clock.GetUtcNow()));
            var decided = order.Requests!.First(item => item.Id == requestId);
            await OrderNotifications.Send(notifications, account, order, $"{decided.Type}_{decided.Status}");
            return TypedResults.Ok(order);
        });
    }

    private static OrderOptions Options(IConfiguration configuration) =>
        new(OrderLifecycle.CancelReasons, OrderLifecycle.ReturnReasons, OrderLifecycle.Carriers, ReturnWindowDays(configuration));

    internal static CustomerOrder WithImages(CustomerOrder order, HttpContext http, IConfiguration configuration, IWebHostEnvironment environment) => order with
    {
        Lines = [.. order.Lines.Select(line => line with { ImageUrl = CatalogEndpoints.ResolveUrl(line.ImageUrl, http.Request, configuration["Catalog:AssetBaseUrl"], environment.IsDevelopment()) })],
    };

    private static string Id(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier)!;
}

/// <summary>Customer-facing wording for each order event.</summary>
public static class OrderNotifications
{
    public static Task Send(NotificationCenter center, AccountRecord account, CustomerOrder order, string kind)
    {
        var shipment = order.Shipment;
        (string Title, string Body)? text = kind switch
        {
            "order_placed" => ("Siparişin alındı", $"{order.Number} numaralı siparişini aldık. Hazırlandığında haber vereceğiz."),
            "order_preparing" => ("Siparişin hazırlanıyor", $"{order.Number} numaralı siparişin hazırlanıyor."),
            "order_shipped" => ("Siparişin kargoya verildi", $"{order.Number} · {shipment?.Carrier} takip numarası: {shipment?.TrackingNumber}."),
            "order_delivered" => ("Siparişin teslim edildi", $"{order.Number} numaralı siparişin teslim edildi. Ürünü değerlendirmeyi unutma."),
            "order_cancelled" => ("Siparişin iptal edildi", $"{order.Number} numaralı siparişin iptal edildi. Bu demo siparişte ödeme alınmadığı için iade edilecek tutar yok."),
            "cancel_requested" => ("İptal talebin alındı", $"{order.Number} hazırlanıyor; iptal talebini inceleyip sonucu bildireceğiz."),
            "cancel_rejected" => ("İptal talebin sonuçlandı", $"{order.Number} için iptal talebin kabul edilmedi; sipariş hazırlanmaya devam ediyor."),
            "cancel_completed" => ("Siparişin iptal edildi", $"{order.Number} için iptal talebin onaylandı ve sipariş iptal edildi."),
            "return_requested" => ("İade talebin alındı", $"{order.Number} için iade talebini aldık. İnceleyip sonucu bildireceğiz."),
            "return_approved" => ("İade talebin onaylandı", $"{order.Number} için iade talebin onaylandı. Ürünü kargoyla geri gönderebilirsin."),
            "return_rejected" => ("İade talebin sonuçlandı", $"{order.Number} için iade talebin kabul edilmedi."),
            "return_completed" => ("İaden tamamlandı", $"{order.Number} için iade işlemin tamamlandı."),
            _ => null,
        };
        return text is { } message ? center.Notify(account, kind, message.Title, message.Body, $"/hesap/siparisler?siparis={order.Id}") : Task.CompletedTask;
    }
}
