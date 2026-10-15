using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xinobi.Persistence.Entities;

namespace Xinobi.Persistence;

public sealed record AuditActor(Guid? UserId, string[] Roles, string Action, string TraceId);

/// <summary>Flows through async SQL scopes; console actors remain explicitly unidentified.</summary>
public static class AuditExecution
{
    private static readonly AsyncLocal<AuditActor?> Slot = new();
    public static AuditActor? Current { get => Slot.Value; set => Slot.Value = value; }
}

/// <summary>Explicit field allow-list; audit rows participate in the business SaveChanges/transaction.</summary>
public sealed class TransactionalAudit : SaveChangesInterceptor
{
    private static readonly IReadOnlyDictionary<Type, string[]> Fields = new Dictionary<Type, string[]>
    {
        [typeof(User)] = ["Kind", "Status"],
        [typeof(UserRole)] = ["UserId", "RoleId"],
        [typeof(RolePermission)] = ["RoleId", "PermissionId"],
        [typeof(AdminInvitation)] = ["InvitedByUserId", "ExpiresAt", "AcceptedAt", "AcceptedUserId", "CancelledAt", "CancelledByUserId"],
        [typeof(CatalogProduct)] = ["Name", "CategoryName", "Description", "SeoTitle", "OriginalImage", "GalleryJson", "SpecsJson", "Active", "Personalizable"],
        [typeof(CatalogCategory)] = ["Name", "Position"],
        [typeof(CatalogContent)] = ["HomeJson", "AnnouncementsDefined"],
        [typeof(CatalogAnnouncement)] = ["Title", "Body", "Kind", "PublishedAt", "Position"],
        [typeof(CatalogVariant)] = ["Sku", "Color", "Image", "SurfaceMask", "Stock", "Position"],
        [typeof(CatalogVariantPrice)] = ["Cents"],
        [typeof(SalesOrder)] = ["Status", "TotalCents", "Currency", "RequestsJson", "ShipmentJson", "HistoryJson"],
        [typeof(FeatureDocument)] = ["Json"],
    };

    private static void Capture(DbContext? db)
    {
        if (db is null || AuditExecution.Current is not { } actor) return;
        db.ChangeTracker.DetectChanges();
        foreach (var entry in db.ChangeTracker.Entries().ToArray())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted)
                || !Fields.TryGetValue(entry.Entity.GetType(), out var fields)) continue;
            var changes = new Dictionary<string, object?>();
            foreach (var field in fields)
            {
                var property = entry.Property(field);
                if (entry.State == EntityState.Modified && !property.IsModified) continue;
                changes[field] = new { before = entry.State == EntityState.Added ? null : Safe(property.OriginalValue),
                    after = entry.State == EntityState.Deleted ? null : Safe(property.CurrentValue) };
            }
            if (changes.Count == 0) continue;
            var key = string.Join(':', entry.Metadata.FindPrimaryKey()!.Properties.Select(p => entry.Property(p.Name).CurrentValue));
            // Catalog identifiers may contain business text: keep a stable non-reversible target.
            key = Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(key)));
            var diff = JsonSerializer.Serialize(new { recordType = "business-change", roles = actor.Roles, operation = entry.State.ToString(), fields = changes });
            // A failed SaveChanges leaves both business entries and the pending audit tracked.
            // Retrying must not append the same audit again. Committed/unchanged rows do not
            // suppress a later legitimate change; request-attempt rows are separate evidence.
            if (db.ChangeTracker.Entries<AuditLog>().Any(a => a.State == EntityState.Added
                && a.Entity.Action == actor.Action && a.Entity.EntityType == entry.Metadata.ClrType.Name
                && a.Entity.EntityId == key && a.Entity.TraceId == actor.TraceId && a.Entity.SafeDiff == diff)) continue;
            db.Set<AuditLog>().Add(new AuditLog { ActorUserId = actor.UserId, Action = actor.Action,
                EntityType = entry.Metadata.ClrType.Name, EntityId = key, TraceId = actor.TraceId, OccurredAt = DateTimeOffset.UtcNow,
                SafeDiff = diff });
        }
    }
    private static object? Safe(object? value) => value is string text
        ? "sha256:" + Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(text))) : value;
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    { Capture(eventData.Context); return result; }
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    { Capture(eventData.Context); return ValueTask.FromResult(result); }
}
