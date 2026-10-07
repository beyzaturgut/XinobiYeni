using System.Net;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.DesignStudio;
public static class DesignStudioEndpoints
{
    public static void MapDesignStudio(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return;
        var group = app.MapGroup("/api/v1/design-studio").WithTags("DesignStudio").AllowAnonymous().RequireRateLimiting("DesignStudio");
        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            if (http.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(403);
            var origin = http.Request.Headers.Origin.ToString();
            if (origin.Length > 0 && !LocalCommerceEndpoints.AllowedOrigin(origin)) return Results.StatusCode(403);
            http.Response.Headers.CacheControl = "no-store";
            try { return await next(context); }
            catch (ArgumentException error) { return Results.BadRequest(new { code = "invalid_answers", message = error.Message }); }
            catch (KeyNotFoundException) { return Results.NotFound(new { code = "session_expired", message = "Tasarım oturumu bulunamadı veya süresi doldu." }); }
            catch (DesignProviderException error) { return Results.Json(new { code = error.Code, message = error.Message }, statusCode: error.Code == "answers_locked" ? 409 : error.Code.Contains("limit") ? 429 : 503); }
        });
        group.MapGet("/status", (IImageGenerationProvider provider, QuestionBank bank) => Results.Ok(new { configured = provider.IsConfigured, questionCount = bank.Data.Questions.Length, version = bank.Data.Version }));
        group.MapPost("/sessions", async (CreateDesignSession request, DesignSessionStore store) => Results.Ok(await store.Create(request)));
        group.MapGet("/sessions/{id}", async (string id, DesignSessionStore store) => await store.Get(id) is { } session ? Results.Ok(session) : Results.NotFound(new { code = "session_expired", message = "Oturum bulunamadı veya süresi doldu." }));
        group.MapPost("/sessions/{id}/generation", async (string id, GenerateDesignRequest request, DesignSessionStore store) => Results.Ok(await store.Generate(id, request)));
        group.MapGet("/sessions/{id}/image", async (string id, DesignSessionStore store) => await store.Asset(id) is { } asset && File.Exists(asset.Path) ? Results.File(asset.Path, asset.Mime) : Results.NotFound());
    }
}
