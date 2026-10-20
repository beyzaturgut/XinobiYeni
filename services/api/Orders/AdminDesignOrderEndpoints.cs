using Microsoft.OpenApi;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;

namespace Xinobi.Api.Orders;

public static class AdminDesignOrderEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/designs/{id}/orders", async (string id, string? page, string? pageSize, IAccountStore accounts, XinobiDbContext db, CancellationToken token) =>
        {
            var number = Number(page, 1); var size = Number(pageSize, 20);
            AdminDesignOrderStore.Validate(id, number, size);
            if (accounts is not SqlAccountStore) throw ProblemException.Unavailable("Sipariş referansları");
            return await AdminDesignOrderStore.List(db, id, number, size, token);
        })
        .RequirePermission("orders.read").WithProblems().WithName("ListAdminDesignOrders")
        .WithSummary("Tasarım kimliğine bağlı sipariş referansları; müşteri bilgisi içermez.")
        .Produces<AdminDesignOrderPage>().ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(503)
        .AddOpenApiOperationTransformer((operation, _, _) =>
        {
            foreach (var parameter in operation.Parameters ?? [])
                if (parameter is OpenApiParameter query && query.Name is "page" or "pageSize")
                    query.Schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" };
            return Task.CompletedTask;
        });
    }
    private static int Number(string? value, int fallback) => value is null ? fallback
        : int.TryParse(value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var number) ? number
        : throw new ProblemException("invalid_design_order_query", "Sayfa ve sayfa boyutu tam sayı olmalı.");
}
