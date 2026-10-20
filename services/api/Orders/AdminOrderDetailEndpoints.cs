using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Orders;

public static class AdminOrderDetailEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/orders/{id}", async (string id, IAccountStore accounts, HttpContext http, IConfiguration configuration, IWebHostEnvironment environment) =>
        {
            if (!Guid.TryParse(id, out var key) || key == Guid.Empty)
                throw new ProblemException("invalid_order_id", "Sipariş kimliği geçersiz.");
            if (accounts is not SqlAccountStore sql) throw ProblemException.Unavailable("Sipariş detayı");
            var item = await sql.StaffOrderById(key) ?? throw ProblemException.NotFound("order_not_found", "Sipariş bulunamadı.");
            return item with { Order = OrderEndpoints.WithImages(item.Order, http, configuration, environment, "/api/v1/local-commerce/orders") };
        })
        .RequirePermission("orders.read").WithProblems().WithName("GetAdminOrder")
        .Produces<StaffOrder>().ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(503);
    }
}
