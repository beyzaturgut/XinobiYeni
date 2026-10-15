using System.Security.Claims;
using Xinobi.Api.Identity;
using Xinobi.Persistence;

namespace Xinobi.Api.Audit;

/// <summary>Supplies actor metadata; successful SQL changes record their own atomic audit entries.</summary>
public sealed class AdminAuditMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext http)
    {
        var route = (http.GetEndpoint() as RouteEndpoint)?.RoutePattern.RawText;
        if (route is null || HttpMethods.IsGet(http.Request.Method) || HttpMethods.IsHead(http.Request.Method)
            || HttpMethods.IsOptions(http.Request.Method)
            || http.User.FindFirstValue(PermissionAuthorization.AccountKindClaim) != AccountKinds.Staff
            || !(route.StartsWith("/api/v1/admin/", StringComparison.Ordinal) || route.StartsWith("/api/v1/local-commerce/", StringComparison.Ordinal)))
        { await next(http); return; }
        var previous = AuditExecution.Current;
        var action = http.Request.Method + " " + route;
        AuditExecution.Current = new AuditActor(Guid.TryParse(http.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null,
            http.User.FindAll(ClaimTypes.Role).Select(x => x.Value).Where(Roles.Exists).Order().ToArray(),
            action.Length > 128 ? action[..128] : action, http.TraceIdentifier);
        try { await next(http); }
        finally { AuditExecution.Current = previous; }
    }
}
