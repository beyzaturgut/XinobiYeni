using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Api.Identity;

public record AdminCustomerRow(Guid Id, string Name, string Email, string? Phone, string Status, DateTimeOffset CreatedAt, int OrderCount, DateTimeOffset? LastOrderAt);
public record AdminCustomerPage(AdminCustomerRow[] Items, int Page, int PageSize, int Total, int TotalPages);
public record AdminCustomerDetails(AdminCustomerRow Customer, int AddressCount, int FavoriteCount);

/// <summary>Masked, SELECT-only customer directory. No account changes or file fallback.</summary>
public static class AdminCustomerEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        var reads = admin.MapGroup("/customers");
        reads.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            var services = context.HttpContext.RequestServices;
            if (services.GetRequiredService<IAccountStore>() is not SqlAccountStore
                || !services.GetRequiredService<XinobiDbContext>().Database.IsSqlServer()) return Unavailable();
            try { return await next(context); }
            catch (Exception error) when (error is SqlException or InvalidOperationException { InnerException: SqlException })
            { return Unavailable(); }
        });
        reads.MapGet("", async (int? page, int? pageSize, string? query, XinobiDbContext db, CancellationToken token) =>
            await List(db, page ?? 1, pageSize ?? 20, query, token))
            .RequirePermission("customers.read").WithName("ListAdminCustomers")
            .Produces<AdminCustomerPage>().ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(503);
        reads.MapGet("/{id:guid}", async (Guid id, XinobiDbContext db, CancellationToken token) => await Details(db, id, token))
            .RequirePermission("customers.read").WithName("GetAdminCustomer")
            .Produces<AdminCustomerDetails>().ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(503);
    }

    public static IQueryable<User> Customers(XinobiDbContext db) => db.Users.AsNoTracking()
        .Where(user => user.Kind == UserKinds.Customer && !db.UserRoles.Any(role => role.UserId == user.Id));

    public static IQueryable<User> Search(XinobiDbContext db, string? query)
    {
        var customers = Customers(db);
        if (string.IsNullOrWhiteSpace(query)) return customers;
        var search = query.Trim();
        return customers.Where(user => user.Email.Contains(search)
            || (user.DisplayName != null && user.DisplayName.Contains(search)) || (user.Phone != null && user.Phone.Contains(search)));
    }

    public static IQueryable<AdminCustomerRow> Project(XinobiDbContext db, IQueryable<User> users) => users.Select(user =>
        new AdminCustomerRow(user.Id, user.DisplayName ?? "", user.Email, user.Phone, user.Status, user.CreatedAt,
            db.SalesOrders.Count(order => order.UserId == user.Id),
            db.SalesOrders.Where(order => order.UserId == user.Id).Max(order => (DateTimeOffset?)order.CreatedAt)));

    public static void Validate(int page, int pageSize, string? query)
    {
        if (page < 1 || page > 100000 || pageSize < 1 || pageSize > 100 || query?.Length > 100)
            throw new AccountException("invalid_page", "Sayfa veya arama parametreleri geçersiz.");
    }

    public static async Task<AdminCustomerPage> List(XinobiDbContext db, int page, int pageSize, string? query, CancellationToken token = default)
    {
        Validate(page, pageSize, query);
        var customers = Search(db, query);
        var total = await customers.CountAsync(token);
        var rows = await Project(db, customers.OrderByDescending(user => user.CreatedAt).ThenBy(user => user.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)).ToArrayAsync(token);
        return new(rows.Select(Mask).ToArray(), page, pageSize, total, (int)Math.Ceiling((double)total / pageSize));
    }

    public static async Task<AdminCustomerDetails> Details(XinobiDbContext db, Guid id, CancellationToken token = default)
    {
        var customer = await Project(db, Customers(db).Where(user => user.Id == id)).SingleOrDefaultAsync(token)
            ?? throw new AccountException("customer_not_found", "Müşteri bulunamadı.", 404);
        return new(Mask(customer), await db.CustomerAddresses.CountAsync(row => row.UserId == id, token),
            await db.CustomerFavorites.CountAsync(row => row.UserId == id, token));
    }

    public static AdminCustomerRow Mask(AdminCustomerRow row) => row with
    {
        Name = string.Join(' ', row.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(word => word[..1] + "***")),
        Email = row.Email.Length > 0 ? row.Email[..1] + "***@***" : "***",
        Phone = string.IsNullOrEmpty(row.Phone) ? null : "***" + row.Phone[^Math.Min(2, row.Phone.Length)..]
    };

    private static IResult Unavailable() => Results.Problem(statusCode: 503, title: "SQL müşteri veri kaynağı kullanılamıyor.",
        extensions: new Dictionary<string, object?> { ["code"] = "admin_sql_unavailable" });
}
