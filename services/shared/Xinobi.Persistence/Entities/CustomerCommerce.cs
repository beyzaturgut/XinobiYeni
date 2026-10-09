namespace Xinobi.Persistence.Entities;

/// <summary>Only a SHA-256 digest of the opaque access token is stored.</summary>
public sealed class AccessSession
{
    public required string TokenHash { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}

/// <summary>Rotated refresh tokens remain until expiry to detect reuse and revoke the family.</summary>
public sealed class RefreshSession
{
    public required string TokenHash { get; set; }
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
}

public sealed class CustomerDeliveryAddress
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Title { get; set; }
    public required string FullName { get; set; }
    public required string Phone { get; set; }
    public required string City { get; set; }
    public required string District { get; set; }
    public required string Line { get; set; }
    public string? PostalCode { get; set; }
    public bool IsDefault { get; set; }
    public int Position { get; set; }
}

/// <summary>
/// Preserves the current demo order contract. This schema does not enable payment or reserve stock.
/// Addresses and lifecycle details are snapshots, independent of mutable address/catalog rows.
/// </summary>
public sealed class SalesOrder
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string ClientRequestId { get; set; }
    public required string Number { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public required string Status { get; set; }
    public required string AddressSnapshotJson { get; set; }
    public long TotalCents { get; set; }
    public required string Currency { get; set; }
    public string? ShipmentJson { get; set; }
    public string? HistoryJson { get; set; }
    public string? RequestsJson { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class SalesOrderLine
{
    public Guid OrderId { get; set; }
    public int Position { get; set; }
    public required string ProductReference { get; set; }
    public required string VariantReference { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public string? ImageUrl { get; set; }
    public long UnitPriceCents { get; set; }
    public int Quantity { get; set; }
    public long LineTotalCents { get; set; }
    public required string Currency { get; set; }
    /// <summary>Snapshot of the customer's design on a personalised line (design id, kind, name, MIME); null for plain lines.</summary>
    public string? PersonalizationJson { get; set; }
}
