using System.Security.Claims;
using Microsoft.Extensions.Options;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

public static class SuratShipmentEndpoints
{
    public sealed record SuratConnectionStatus(bool Enabled, string Mode, bool AccountConfigured, bool PollingEnabled, bool LiveOperationsAllowed);
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/shipping/surat/status", (IOptions<SuratKargoOptions> options) =>
        {
            var c = options.Value;
            var account = c.Mode == "Sandbox" ? c.Sandbox : c.Mode == "Production" ? c.Production : null;
            return new SuratConnectionStatus(c.Enabled, c.Mode, account is not null && !string.IsNullOrWhiteSpace(account.Username) && !string.IsNullOrWhiteSpace(account.Password), c.PollingEnabled, false);
        }).RequirePermission("orders.read").WithProblems().WithName("GetAdminSuratConnectionStatus");
        admin.MapGet("/orders/{id}/surat-shipment", async (string id, IAccountStore accounts, IWebHostEnvironment environment,
            SuratShipmentStore store, IOptions<SuratKargoOptions> options) =>
        {
            await Order(id, accounts, environment);
            var mode = options.Value.Mode;
            if (mode is not ("Sandbox" or "Production")) throw ProblemException.Unavailable("Kargo ortamı");
            var row = await store.Find(id, mode);
            return row is null ? null : SuratShipmentView.From(row);
        }).RequirePermission("orders.read").WithProblems().WithName("GetAdminSuratShipment");
        admin.MapPost("/orders/{id}/surat-shipment", async (string id, CreateSuratShipment input, IAccountStore accounts,
            IWebHostEnvironment environment, SuratShipmentWorkflow workflow, ClaimsPrincipal user, CancellationToken token) =>
            {
                var current = await Order(id, accounts, environment);
                workflow.Validate(current, input);
                token.ThrowIfCancellationRequested();
                var reserved = await accounts.ChangeOrder(null, id, order => SuratShipmentWorkflow.Reserve(order, input, DateTimeOffset.UtcNow));
                return await workflow.Create(reserved.Order, input, user.FindFirstValue(ClaimTypes.NameIdentifier)!, token);
            })
            .RequirePermission("orders.write").WithProblems().WithName("CreateAdminSuratShipment");
    }

    public sealed record ReconcileShipment(string Evidence, string Resolution = "registered");
    public static void MapOperations(RouteGroupBuilder admin, RouteGroupBuilder me)
    {
        admin.MapGet("/orders/{id}/surat-shipment/label", async (string id, IAccountStore accounts, IWebHostEnvironment environment, SuratShipmentStore store, IOptions<SuratKargoOptions> options) =>
        {
            await Order(id, accounts, environment);
            var row = await store.Find(id, Mode(options)) ?? throw ProblemException.NotFound("shipment_not_found", "Gönderi bulunamadı.");
            return Results.File(SuratLabel.Render(row), "image/svg+xml", "xinobi-surat-test-" + row.Reference + ".svg");
        }).RequirePermission("orders.read").WithProblems().WithName("GetAdminSuratLabel");
        admin.MapGet("/orders/{id}/surat-shipment/tracking", async (string id, IAccountStore accounts, IWebHostEnvironment environment, SuratShipmentStore store, IOptions<SuratKargoOptions> options) =>
        {
            await Order(id, accounts, environment);
            var row = await store.Find(id, Mode(options));
            return row is null ? null : SuratTrackingView.From(row);
        }).RequirePermission("orders.read").WithProblems().WithName("GetAdminSuratTracking");
        admin.MapPost("/orders/{id}/surat-shipment/tracking", async (string id, IAccountStore accounts, IWebHostEnvironment environment, SuratTrackingService tracking, CancellationToken token) =>
        {
            await Order(id, accounts, environment);
            return await tracking.Refresh(id, token);
        }).RequirePermission("orders.write").WithProblems().WithName("RefreshAdminSuratTracking");
        admin.MapPost("/orders/{id}/surat-shipment/reconcile", async (string id, ReconcileShipment request, ClaimsPrincipal user,
            IAccountStore accounts, IWebHostEnvironment environment, SuratShipmentStore store, IOptions<SuratKargoOptions> options, TimeProvider clock) =>
        {
            await Order(id, accounts, environment);
            return SuratShipmentView.From(await store.Reconcile(id, Mode(options), user.FindFirstValue(ClaimTypes.NameIdentifier)!, request.Evidence, clock.GetUtcNow(), request.Resolution));
        }).RequirePermission("orders.write").WithProblems().WithName("ReconcileAdminSuratShipment");
        me.MapGet("/orders/{id}/surat-tracking", async (string id, ClaimsPrincipal user, IAccountStore accounts, SuratShipmentStore store, IOptions<SuratKargoOptions> options) =>
        {
            var order = (await accounts.Orders(user.FindFirstValue(ClaimTypes.NameIdentifier)!)).FirstOrDefault(o => o.Id == id);
            if (order is null) throw ProblemException.NotFound("order_not_found", "Sipariş bulunamadı.");
            var row = await store.Find(id, Mode(options));
            // Sandbox references must never be presented to customers as actual shipments.
            return row is null || row.Environment != "Production" ? null : SuratTrackingView.From(row);
        }).WithProblems().WithName("GetMySuratTracking");
    }
    private static string Mode(IOptions<SuratKargoOptions> options) => options.Value.Mode is "Sandbox" or "Production"
        ? options.Value.Mode : throw ProblemException.Unavailable("Kargo ortamı");

    private static async Task<CustomerOrder> Order(string id, IAccountStore accounts, IWebHostEnvironment environment)
    {
        if (!Guid.TryParseExact(id, "N", out var key) || key == Guid.Empty) throw new ProblemException("invalid_order_id", "Sipariş kimliği geçersiz.");
        var order = accounts is SqlAccountStore sql ? (await sql.StaffOrderById(key))?.Order : environment.IsDevelopment()
            ? (await accounts.AllOrders()).FirstOrDefault(s => s.Order.Id == id)?.Order : throw ProblemException.Unavailable("Siparişler");
        return order ?? throw ProblemException.NotFound("order_not_found", "Sipariş bulunamadı.");
    }
}
