using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing.Patterns;
using Xinobi.Api.Identity;

namespace Xinobi.Api.LocalCommerce;

/// <summary>
/// Panel routes need a signed-in staff account holding the permission for the route's resource (Faz03 03.04): reads need
/// <c>resource.read</c>, changes <c>resource.write</c>. Every panel route must map to a resource here, or startup fails, so a new
/// route can never be left open by accident. Public storefront reads opt out explicitly with AllowAnonymous.
/// </summary>
public static class PanelAccess
{
    private const string Prefix = "/api/v1/local-commerce/";

    private static readonly Dictionary<string, string> Resources = new(StringComparer.Ordinal)
    {
        ["personalization-sources"] = "catalog", ["state"] = "catalog", ["products"] = "catalog", ["categories"] = "catalog", ["surfaces"] = "catalog",
        ["prices"] = "pricing", ["inventory"] = "inventory",
        ["content"] = "content", ["announcements"] = "content", ["reviews"] = "content",
        ["media"] = "media",
        ["orders"] = "orders", ["order-options"] = "orders",
        ["quotes"] = "quotes",
        ["assistant"] = "ai",
        ["notifications"] = "notifications",
        ["audit"] = "audit",
    };

    /// <summary>The permission a panel request needs, from its route and HTTP method.</summary>
    public static string PermissionFor(string route, string method)
    {
        var path = "/" + route.TrimStart('/');
        if (!path.StartsWith(Prefix, StringComparison.Ordinal) && path + "/" != Prefix)
            throw new InvalidOperationException($"{route} is not a panel route.");
        var segments = path[Prefix.Length..].Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0 || !Resources.TryGetValue(segments[0], out var resource))
            throw new InvalidOperationException($"Panel route {route} has no permission mapping; add it to {nameof(PanelAccess)}.");
        // Approving a cancellation or return moves money and stock: it is its own permission.
        if (resource == "orders" && segments.Length >= 3 && segments[2] == "requests" && method != HttpMethods.Get) return "orders.cancel";
        return resource + (method == HttpMethods.Get || method == HttpMethods.Head ? ".read" : ".write");
    }

    /// <summary>Requires a staff account on the group and the route's permission on each endpoint.</summary>
    public static RouteGroupBuilder RequirePanelPermissions(this RouteGroupBuilder group)
    {
        group.RequireAuthorization(PermissionAuthorization.StaffPolicy);
        ((IEndpointConventionBuilder)group).Add(builder =>
        {
            if (builder is not RouteEndpointBuilder route) return;
            var method = route.Metadata.OfType<IHttpMethodMetadata>().SelectMany(x => x.HttpMethods).SingleOrDefault() ?? HttpMethods.Get;
            var permission = PermissionFor(route.RoutePattern.RawText ?? "", method);
            route.Metadata.Add(new AuthorizeAttribute(PermissionAuthorization.PolicyName(permission)));
        });
        return group;
    }
}
