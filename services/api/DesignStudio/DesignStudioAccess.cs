using System.Net;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.DesignStudio;

/// <summary>
/// Who may reach the design endpoints (/api/v1/design-studio for the web, /api/v1/xinobi-u for mobile).
/// Development: loopback callers and the local dev origins only (ADR-002 Ek A).
/// Test server (<c>XinobiU:Enabled</c>, ADR-002 Ek B): any client address; browser origins only from <c>XinobiU:AllowedOrigins</c>.
/// Cost stays bounded by the global daily generation limit and the per-address rate limit.
/// </summary>
public static class DesignStudioAccess
{
    public const string CorsPolicy = "XinobiU";

    public static bool Enabled(IWebHostEnvironment environment, IConfiguration configuration) =>
        environment.IsDevelopment() || configuration.GetValue<bool>("XinobiU:Enabled");

    public static string[] AllowedOrigins(IConfiguration configuration) =>
        configuration.GetSection("XinobiU:AllowedOrigins").Get<string[]>() ?? [];

    public static bool Allowed(HttpContext http)
    {
        var development = http.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
        if (development && http.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return false;
        var origin = http.Request.Headers.Origin.ToString();
        if (origin.Length == 0) return true;
        return development
            ? LocalCommerceEndpoints.AllowedOrigin(origin)
            : AllowedOrigins(http.RequestServices.GetRequiredService<IConfiguration>()).Contains(origin, StringComparer.OrdinalIgnoreCase);
    }
}
