using System.Security.Claims;
using Microsoft.Extensions.Options;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

public static class SuratShipmentEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
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
                await workflow.Create(await Order(id, accounts, environment), input, user.FindFirstValue(ClaimTypes.NameIdentifier)!, token))
            .RequirePermission("orders.write").WithProblems().WithName("CreateAdminSuratShipment");
    }

    private static async Task<CustomerOrder> Order(string id, IAccountStore accounts, IWebHostEnvironment environment)
    {
        if (!Guid.TryParseExact(id, "N", out var key) || key == Guid.Empty) throw new ProblemException("invalid_order_id", "Sipariş kimliği geçersiz.");
        var order = accounts is SqlAccountStore sql ? (await sql.StaffOrderById(key))?.Order : environment.IsDevelopment()
            ? (await accounts.AllOrders()).FirstOrDefault(s => s.Order.Id == id)?.Order : throw ProblemException.Unavailable("Siparişler");
        return order ?? throw ProblemException.NotFound("order_not_found", "Sipariş bulunamadı.");
    }
}
