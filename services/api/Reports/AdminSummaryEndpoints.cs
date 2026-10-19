using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Api.Reports;

public record OrderStatusCount(string Status, int Count);
public record AdminSummary(DateTimeOffset? FromInclusive, DateTimeOffset UntilExclusive, DateTimeOffset GeneratedAt,
    string TimeZone, int OrderCount, int RegisteredCustomerCount, OrderStatusCount[] OrderStatuses);

/// <summary>Counts recorded rows, not payments, net sales, conversions or active visitors. No account-store mutation/lock path.</summary>
public static class AdminSummaryEndpoints
{
    public static void MapAdminSummary(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/admin/reports/summary", async (string? from, string? until, IAccountStore accounts,
            XinobiDbContext db, TimeProvider clock, HttpContext http, CancellationToken cancellationToken) =>
        {
            http.Response.Headers.CacheControl = "no-store";
            if (!Date(from, out var firstDay) || !Date(until, out var lastDay))
                throw new ProblemException("invalid_query", "Tarih yyyy-MM-dd biçiminde olmalı.");
            var now = clock.GetUtcNow();
            var start = firstDay is { } day ? Utc(day) : (DateTimeOffset?)null;
            var end = lastDay is { } last ? Utc(last) : now;
            if (start >= end) throw new ProblemException("invalid_query", "Başlangıç, bitişten önce olmalı. Bitiş günü aralığa dahil değildir.");
            if (accounts is not SqlAccountStore || !db.Database.IsSqlServer()) return Unavailable();
            try { return Results.Ok(await Read(db, start, end, now, cancellationToken)); }
            catch (Exception error) when (error is SqlException or InvalidOperationException { InnerException: SqlException })
            { return Unavailable(); }
        }).RequireAuthorization(PermissionAuthorization.StaffPolicy).RequirePermission("reports.read")
            .WithTags("Admin").WithName("GetAdminReportSummary").WithProblems()
            .WithDescription("SQL kayıt sayımları; tahsilat veya net satış değildir. from dahil, until hariç UTC günleridir (yyyy-MM-dd). until verilmezse isteğin alındığı an kullanılır. Müşteri sayısı, aralıkta kaydolan ve personel rolü olmayan müşteri hesaplarıdır; tüm hesap durumları dahildir.")
            .Produces<AdminSummary>().ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(503);
    }

    public static DateTimeOffset Utc(DateOnly day) => new(day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
    private static bool Date(string? value, out DateOnly? day)
    {
        day = null;
        if (value is null) return true;
        if (!DateOnly.TryParseExact(value, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsed)) return false;
        day = parsed; return true;
    }

    // Shared only with read-only SQL/query-contract tests, not a second data store.
    public static IQueryable<User> Customers(XinobiDbContext db) => db.Users.AsNoTracking()
        .Where(user => user.Kind == UserKinds.Customer && !db.UserRoles.Any(role => role.UserId == user.Id));

    public static IQueryable<OrderStatusCount> OrderCounts(XinobiDbContext db, DateTimeOffset? from, DateTimeOffset until)
    {
        var orders = db.SalesOrders.AsNoTracking().Where(order => order.CreatedAt < until);
        if (from is { } start) orders = orders.Where(order => order.CreatedAt >= start);
        return orders.GroupBy(order => order.Status).OrderBy(group => group.Key)
            .Select(group => new OrderStatusCount(group.Key, group.Count()));
    }

    public static async Task<AdminSummary> Read(XinobiDbContext db, DateTimeOffset? from, DateTimeOffset until,
        DateTimeOffset generatedAt, CancellationToken cancellationToken = default)
    {
        var customers = Customers(db).Where(user => user.CreatedAt < until);
        if (from is { } start) customers = customers.Where(user => user.CreatedAt >= start);
        var statuses = await OrderCounts(db, from, until).ToArrayAsync(cancellationToken);
        return new AdminSummary(from, until, generatedAt, "UTC", statuses.Sum(row => row.Count),
            await customers.CountAsync(cancellationToken), statuses);
    }

    private static IResult Unavailable() => Results.Problem(statusCode: 503, title: "SQL raporlama veri kaynağı kullanılamıyor.",
        extensions: new Dictionary<string, object?> { ["code"] = "report_sql_unavailable" });
}
