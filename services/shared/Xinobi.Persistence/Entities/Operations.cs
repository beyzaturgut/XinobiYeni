namespace Xinobi.Persistence.Entities;

/// <summary>Append-only audit record. <see cref="SafeDiff"/> must never contain passwords, tokens, raw payment data or PII dumps.</summary>
public sealed class AuditLog
{
    public long Id { get; set; }
    public Guid? ActorUserId { get; set; }
    public required string Action { get; set; }
    public required string EntityType { get; set; }
    public required string EntityId { get; set; }
    public string? SafeDiff { get; set; }
    public string? TraceId { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
}

/// <summary>Written in the same transaction as the business change; the worker claims rows with a lease.</summary>
public sealed class OutboxEvent
{
    public Guid Id { get; set; }
    public required string EventType { get; set; }
    public required string AggregateType { get; set; }
    public required string AggregateId { get; set; }
    public int PayloadVersion { get; set; }
    public required string Payload { get; set; }
    public required string State { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset NextAttemptAt { get; set; }
    public DateTimeOffset? LeaseUntil { get; set; }
    public string? LeaseOwner { get; set; }
    public string? LastErrorCode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
}

/// <summary>Deduplicates provider callbacks and webhooks by <c>(Provider, ExternalEventId)</c>.</summary>
public sealed class InboxEvent
{
    public required string Provider { get; set; }
    public required string ExternalEventId { get; set; }
    public required string EventType { get; set; }
    public required string PayloadHash { get; set; }
    public required string State { get; set; }
    public DateTimeOffset ReceivedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
}

public static class MessageStates
{
    public const string Pending = "pending";
    public const string Processing = "processing";
    public const string Succeeded = "succeeded";
    public const string RetryWait = "retry_wait";
    public const string DeadLetter = "dead_letter";
    public static readonly string[] All = [Pending, Processing, Succeeded, RetryWait, DeadLetter];
}

/// <summary>Faz08/09 sync work item; <c>unknown_outcome</c> is never retried automatically.</summary>
public sealed class SyncJob
{
    public Guid Id { get; set; }
    public required string System { get; set; }
    public required string Direction { get; set; }
    public required string ObjectType { get; set; }
    public required string ObjectId { get; set; }
    public required string IdempotencyKey { get; set; }
    public required string State { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset NextAttemptAt { get; set; }
    public string? LastErrorCode { get; set; }
    public string? CorrelationId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<SyncAttempt> AttemptHistory { get; } = [];
}

public static class SyncJobStates
{
    public const string Pending = "pending";
    public const string Running = "running";
    public const string Succeeded = "succeeded";
    public const string RetryWait = "retry_wait";
    public const string ActionRequired = "action_required";
    public const string UnknownOutcome = "unknown_outcome";
    public static readonly string[] All = [Pending, Running, Succeeded, RetryWait, ActionRequired, UnknownOutcome];
}

public sealed class SyncAttempt
{
    public long Id { get; set; }
    public Guid SyncJobId { get; set; }
    public int AttemptNumber { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? FinishedAt { get; set; }
    public string? Outcome { get; set; }
    public string? ErrorCode { get; set; }
    public string? ProviderReference { get; set; }
}

/// <summary>Local ↔ external identifier map, unique in both directions per system and entity type.</summary>
public sealed class ExternalMapping
{
    public long Id { get; set; }
    public required string System { get; set; }
    public required string EntityType { get; set; }
    public required string LocalId { get; set; }
    public required string ExternalId { get; set; }
    public int MappingVersion { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>File metadata only; bytes live in <c>IFileStorage</c> (ADR-004 T-06). No public URL is stored.</summary>
public sealed class Asset
{
    public Guid Id { get; set; }
    public required string OwnerType { get; set; }
    public required string OwnerId { get; set; }
    public required string StorageKey { get; set; }
    public required string Mime { get; set; }
    public long Bytes { get; set; }
    public required string Sha256 { get; set; }
    public required string Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public static class AssetStatuses
{
    public const string Uploading = "uploading";
    public const string Ready = "ready";
    public const string Rejected = "rejected";
    public const string Archived = "archived";
    public static readonly string[] All = [Uploading, Ready, Rejected, Archived];
}

/// <summary>
/// Interim home for feature state that has no relational model yet (notifications, reviews, quotes, saved designs, Nobi):
/// one JSON document per feature, replaced as a whole under an application lock. Moves to tables as each feature matures.
/// </summary>
public sealed class FeatureDocument
{
    public required string Name { get; set; }
    public required string Json { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
}
