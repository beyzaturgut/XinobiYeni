using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Infrastructure;

/// <summary>One audit record as the panel reads it. Never carries request bodies, passwords, tokens or personal data.</summary>
public sealed record AuditEntry(string Id, DateTimeOffset OccurredAt, string? ActorId, string Action, string EntityType, string EntityId, int Status, string? TraceId);

/// <summary>
/// Append-only audit trail (Faz03 03.06): <c>ops.AuditLogs</c> wherever commerce state is in SQL, a JSON Lines file beside the
/// Development data otherwise, and the structured log when neither exists. Writing never fails the request it records.
/// </summary>
public sealed class AuditTrail(FeatureDocuments documents, IConfiguration configuration, IServiceScopeFactory scopes, ILogger<AuditTrail> logger)
{
    public const int MaxRead = 200;
    private static readonly JsonSerializerOptions LineOptions = new(JsonSerializerDefaults.Web);
    private readonly SemaphoreSlim gate = new(1, 1);

    private bool UsesSql => documents.UsesSql
        || configuration["Catalog:StorageProvider"] == "SqlServer" || configuration["Accounts:StorageProvider"] == "SqlServer";

    private string? FilePath => documents.DataDirectory is { } directory ? Path.Combine(directory, "audit", "audit.jsonl") : null;

    public async Task Write(AuditEntry entry)
    {
        try
        {
            if (UsesSql)
            {
                await using var scope = scopes.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<Xinobi.Persistence.XinobiDbContext>();
                db.AuditLogs.Add(new()
                {
                    ActorUserId = Guid.TryParse(entry.ActorId, out var actor) ? actor : null,
                    Action = entry.Action,
                    EntityType = entry.EntityType,
                    EntityId = entry.EntityId,
                    SafeDiff = JsonSerializer.Serialize(new { status = entry.Status }),
                    TraceId = entry.TraceId,
                    OccurredAt = entry.OccurredAt,
                });
                await db.SaveChangesAsync();
                return;
            }
            if (FilePath is { } path)
            {
                await gate.WaitAsync();
                try
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                    await File.AppendAllTextAsync(path, JsonSerializer.Serialize(entry, LineOptions) + "\n");
                }
                finally { gate.Release(); }
                return;
            }
            logger.LogInformation("Audit {Action} {EntityType}/{EntityId} by {ActorId}: {Status}", entry.Action, entry.EntityType, entry.EntityId, entry.ActorId, entry.Status);
        }
        catch (Exception error)
        {
            logger.LogError(error, "Audit record could not be written: {Action} {EntityType}/{EntityId}", entry.Action, entry.EntityType, entry.EntityId);
        }
    }

    /// <summary>Newest first, at most <see cref="MaxRead"/>, optionally for one entity type.</summary>
    public async Task<AuditEntry[]> Recent(string? entityType, int limit)
    {
        limit = Math.Clamp(limit, 1, MaxRead);
        if (UsesSql)
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<Xinobi.Persistence.XinobiDbContext>();
                // This existing screen is the request-attempt trail (with an HTTP status).
                // Atomic business-change/console entries share the append-only SQL table,
                // but are exposed by the detailed audit API, not mislabelled as status 0 here.
                var query = db.AuditLogs.AsNoTracking()
                    .Where(x => x.SafeDiff != null && x.SafeDiff.Contains("\"status\":"));
                if (!string.IsNullOrEmpty(entityType)) query = query.Where(x => x.EntityType == entityType);
                var rows = await query.OrderByDescending(x => x.Id).Take(limit).ToArrayAsync();
                return rows.Select(x => new AuditEntry(x.Id.ToString(), x.OccurredAt, x.ActorUserId?.ToString("N"), x.Action, x.EntityType, x.EntityId, Status(x.SafeDiff), x.TraceId)).ToArray();
            }
            catch (Exception error) when (error is Microsoft.Data.SqlClient.SqlException or InvalidOperationException)
            {
                throw ProblemException.Unavailable("Denetim kaydı");
            }
        }
        if (FilePath is not { } path) throw ProblemException.Unavailable("Denetim kaydı");
        string[] lines;
        await gate.WaitAsync();
        try { lines = File.Exists(path) ? await File.ReadAllLinesAsync(path) : []; }
        finally { gate.Release(); }
        return lines.Reverse()
            .Select(line => JsonSerializer.Deserialize<AuditEntry>(line, LineOptions)!)
            .Where(x => string.IsNullOrEmpty(entityType) || x.EntityType == entityType)
            .Take(limit).ToArray();
    }

    private static int Status(string? safeDiff)
    {
        if (safeDiff is null) return 0;
        using var json = JsonDocument.Parse(safeDiff);
        return json.RootElement.TryGetProperty("status", out var status) && status.TryGetInt32(out var value) ? value : 0;
    }
}

/// <summary>
/// Records every change attempt on the panel and admin routes — succeeded, failed or refused (401/403) — with the actor, route,
/// route ids and status. Request bodies are never stored, so prices, addresses or messages stay out of the trail.
/// </summary>
public sealed class AuditMiddleware(RequestDelegate next)
{
    private static readonly string[] Prefixes = ["/api/v1/local-commerce/", "/api/v1/admin/"];
    private static readonly string[] IdKeys = ["id", "name", "productId", "variantId", "requestId", "line", "revisionId", "candidateId"];

    public async Task InvokeAsync(HttpContext context, AuditTrail trail, TimeProvider clock)
    {
        var path = context.Request.Path.Value ?? "";
        if (HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method) || HttpMethods.IsOptions(context.Request.Method)
            || !Prefixes.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)))
        {
            await next(context);
            return;
        }
        try { await next(context); }
        finally
        {
            if (context.GetEndpoint() is RouteEndpoint endpoint) await trail.Write(Entry(context, endpoint, clock.GetUtcNow()));
        }
    }

    internal static AuditEntry Entry(HttpContext context, RouteEndpoint endpoint, DateTimeOffset now)
    {
        var route = endpoint.RoutePattern.RawText?.TrimStart('/') ?? "";
        var relative = route.StartsWith("api/v1/", StringComparison.Ordinal) ? route["api/v1/".Length..] : route;
        var entityType = relative.StartsWith("local-commerce/", StringComparison.Ordinal)
            ? EntityType(relative["local-commerce/".Length..])
            : "admin";
        var ids = IdKeys.Select(key => context.Request.RouteValues.TryGetValue(key, out var value) ? value?.ToString() : null)
            .Where(value => !string.IsNullOrEmpty(value)).ToArray();
        var entityId = ids.Length == 0 ? "-" : string.Join('/', ids);
        return new AuditEntry(
            Guid.NewGuid().ToString("N"),
            now,
            context.User.FindFirstValue(ClaimTypes.NameIdentifier),
            Truncate($"{context.Request.Method} {relative}"),
            entityType,
            Truncate(entityId),
            context.Response.StatusCode,
            context.TraceIdentifier);
    }

    private static string EntityType(string panelRoute)
    {
        try { return PanelAccess.PermissionFor("/api/v1/local-commerce/" + panelRoute, HttpMethods.Get).Split('.')[0]; }
        catch (InvalidOperationException) { return "panel"; }
    }

    private static string Truncate(string value) => value.Length <= 128 ? value : value[..128];
}
