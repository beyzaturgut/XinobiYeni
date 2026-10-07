namespace Xinobi.Persistence.Entities;

/// <summary>Customer and staff accounts share one table; <see cref="Kind"/> keeps them apart (Faz03 §4).</summary>
public sealed class User
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string NormalizedEmail { get; set; }
    public string? PasswordHash { get; set; }
    public required string Kind { get; set; }
    public required string Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public List<UserRole> Roles { get; } = [];
}

public static class UserKinds
{
    public const string Customer = "customer";
    public const string Staff = "staff";
}

public static class UserStatuses
{
    public const string PendingVerification = "pending_verification";
    public const string Active = "active";
    public const string Disabled = "disabled";
}

public sealed class Role
{
    public Guid Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public List<RolePermission> Permissions { get; } = [];
}

/// <summary>A panel resource/action pair such as <c>catalog</c>/<c>write</c>; checked server-side by policy.</summary>
public sealed class Permission
{
    public Guid Id { get; set; }
    public required string Resource { get; set; }
    public required string Action { get; set; }
}

public sealed class UserRole
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public Guid? AssignedByUserId { get; set; }
    public Role? Role { get; set; }
}

public sealed class RolePermission
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    public Permission? Permission { get; set; }
}
