using System.Net;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.EmailVerification;

public static class EmailVerificationEndpoints
{
    public static void MapEmailVerification(this WebApplication app)
    {
        // The current account UI is a browser-only demo; do not expose it as production identity.
        if (!app.Environment.IsDevelopment()) return;
        var group = app.MapGroup("/api/v1/email-verification").ExcludeFromDescription().AllowAnonymous()
            .RequireRateLimiting("EmailVerification");
        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            if (http.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(403);
            var origin = http.Request.Headers.Origin.ToString();
            if (origin.Length > 0 && !LocalCommerceEndpoints.AllowedOrigin(origin)) return Results.StatusCode(403);
            http.Response.Headers.CacheControl = "no-store";
            try { return await next(context); }
            catch (EmailVerificationException error) { return Results.Json(new { message = error.Message }, statusCode: error.Status); }
        });
        group.MapPost("/start", async (StartEmailVerification request, EmailVerificationStore store, CancellationToken token)
            => Results.Ok(await store.Start(request.Email, token)));
        group.MapPost("/confirm", async (ConfirmEmailVerification request, EmailVerificationStore store) =>
        {
            await store.Confirm(request);
            return Results.Ok(new { verified = true });
        });
    }
}
