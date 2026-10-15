using Microsoft.EntityFrameworkCore;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;

namespace Xinobi.Api.Audit;

public record AuditEntry(long Id, Guid? ActorUserId, string Action, string EntityType, string EntityId, string? SafeDiff, string? TraceId, DateTimeOffset OccurredAt);
public record AuditPage(AuditEntry[] Items, int Page, int PageSize, int Total);

public static class AuditEndpoints
{
    public static void MapAudit(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/admin/audit", async (string? action, Guid? actorId, DateTimeOffset? from, DateTimeOffset? to,
            int? page, int? pageSize, XinobiDbContext db, CancellationToken cancellationToken) =>
        {
            var number = page ?? 1; var size = pageSize ?? 20;
            if (number < 1 || number > 1000000 || size is < 1 or > 100 || action?.Length > 128 || from > to)
                throw new ProblemException("invalid_query", "Geçersiz denetim filtresi.");
            var query = db.AuditLogs.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(action)) query = query.Where(x => x.Action == action);
            if (actorId is not null) query = query.Where(x => x.ActorUserId == actorId);
            if (from is not null) query = query.Where(x => x.OccurredAt >= from);
            if (to is not null) query = query.Where(x => x.OccurredAt <= to);
            var total = await query.CountAsync(cancellationToken);
            var items = await query.OrderByDescending(x => x.OccurredAt).ThenByDescending(x => x.Id)
                .Skip((number - 1) * size).Take(size)
                .Select(x => new AuditEntry(x.Id, x.ActorUserId, x.Action, x.EntityType, x.EntityId, x.SafeDiff, x.TraceId, x.OccurredAt))
                .ToArrayAsync(cancellationToken);
            return new AuditPage(items, number, size, total);
        }).RequireAuthorization(PermissionAuthorization.StaffPolicy).RequirePermission("audit.read").WithProblems()
            .WithName("ListAdminAudit").WithTags("Admin").ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
    }
}
