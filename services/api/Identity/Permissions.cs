using System.Collections.Frozen;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Xinobi.Api.Identity;

/// <summary>
/// Panel permission catalog (Faz03 03.04). A permission is <c>resource.action</c>; endpoints name the one they need with
/// <see cref="PermissionAuthorization.RequirePermission{TBuilder}"/> and the server checks it — hiding a menu item is never the check.
/// </summary>
public static class PermissionCatalog
{
    /// <summary>Panel resources in the order of Faz03 03.04.</summary>
    public static readonly IReadOnlyList<string> Resources =
    [
        "catalog", "content", "media", "pricing", "inventory", "promotions", "customers", "orders", "payments",
        "quotes", "print", "integration", "ai", "reports", "notifications", "settings", "audit",
    ];

    /// <summary>Actions beyond read/write that are worth separating: money movement, production and staff access.</summary>
    private static readonly string[] Special =
    [
        "payments.approve", // bank transfer/EFT confirmation
        "payments.refund",
        "orders.cancel",
        "print.operate", // print operator queue
        "settings.staff", // staff accounts and role assignment
    ];

    /// <summary>Every permission. The audit trail can be read, never written by hand.</summary>
    public static readonly FrozenSet<string> All = Resources
        .SelectMany(resource => resource == "audit" ? [$"{resource}.read"] : new[] { $"{resource}.read", $"{resource}.write" })
        .Concat(Special)
        .ToFrozenSet(StringComparer.Ordinal);

    public static bool Exists(string permission) => All.Contains(permission);
}

/// <summary>
/// Built-in roles. Further roles (catalog editor, order operator…) are rows in <c>identity.Role</c>/<c>RolePermission</c>,
/// managed from the panel once the SQL identity store lands (03.11); <see cref="SuperAdmin"/> always holds every permission.
/// </summary>
public static class Roles
{
    public const string SuperAdmin = "super_admin";

    private static readonly FrozenDictionary<string, FrozenSet<string>> BuiltIn = new Dictionary<string, FrozenSet<string>>
    {
        [SuperAdmin] = PermissionCatalog.All,
    }.ToFrozenDictionary(StringComparer.Ordinal);

    public static bool Exists(string role) => BuiltIn.ContainsKey(role);

    public static IReadOnlyCollection<string> PermissionsFor(IEnumerable<string> roles) =>
        roles.Where(BuiltIn.ContainsKey).SelectMany(role => BuiltIn[role]).Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
}

public static class PermissionAuthorization
{
    public const string PermissionClaim = "xinobi:permission";
    public const string StaffPolicy = "staff";
    private const string Prefix = "permission:";

    /// <summary>Requires a signed-in account holding <paramref name="permission"/>; an unknown permission fails at startup, not silently.</summary>
    public static TBuilder RequirePermission<TBuilder>(this TBuilder builder, string permission) where TBuilder : IEndpointConventionBuilder =>
        builder.RequireAuthorization(PolicyName(permission));

    /// <summary>The policy name for <paramref name="permission"/>; an unknown permission fails at startup, not silently.</summary>
    public static string PolicyName(string permission) =>
        PermissionCatalog.Exists(permission) ? Prefix + permission : throw new ArgumentException($"Unknown permission '{permission}'.", nameof(permission));

    public static IEnumerable<Claim> ClaimsFor(IReadOnlyCollection<string> roles) =>
        roles.Select(role => new Claim(ClaimTypes.Role, role))
            .Concat(Roles.PermissionsFor(roles).Select(permission => new Claim(PermissionClaim, permission)));

    /// <summary>Builds <c>permission:x.y</c> policies on demand; everything else falls back to the configured policies.</summary>
    public sealed class PolicyProvider(IOptions<AuthorizationOptions> options) : DefaultAuthorizationPolicyProvider(options)
    {
        public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            if (!policyName.StartsWith(Prefix, StringComparison.Ordinal)) return await base.GetPolicyAsync(policyName);
            var permission = policyName[Prefix.Length..];
            if (!PermissionCatalog.Exists(permission)) return null;
            return new AuthorizationPolicyBuilder().RequireAuthenticatedUser().RequireClaim(PermissionClaim, permission).Build();
        }
    }
}
