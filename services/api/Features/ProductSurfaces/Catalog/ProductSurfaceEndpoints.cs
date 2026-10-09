using System.Net;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Features.ProductSurfaces.Catalog;

/// <summary>
/// Admin surface masking for every product variant, under /api/v1/local-commerce/surfaces with the same Development + loopback +
/// admin-origin rules as the rest of local commerce (ADR-003), and the staff catalog permissions (<see cref="PanelAccess"/>).
/// </summary>
public static class ProductSurfaceEndpoints
{
    public static void MapProductSurfaces(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return;
        var group = app.MapGroup("/api/v1/local-commerce/surfaces").WithTags("ProductSurfaces").RequirePanelPermissions().RequireRateLimiting("DesignStudio");
        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            if (http.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var origin = http.Request.Headers.Origin.ToString();
            if (origin.Length > 0 && !LocalCommerceEndpoints.AllowedOrigin(origin)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            http.Response.Headers.CacheControl = "no-store";
            try { return await next(context); }
            catch (SurfaceException error) { return Results.Json(new { code = error.Code, message = error.Message }, statusCode: error.Status); }
        });

        group.MapGet("", async (ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.List()));
        group.MapGet("/{productId}/{variantId}", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Detail(productId, variantId)));
        group.MapGet("/{productId}/{variantId}/draft.png", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) =>
            Results.File(await surfaces.DraftMask(productId, variantId), "image/png"));
        group.MapPost("/{productId}/{variantId}/segment", async (string productId, string variantId, SurfaceSegmentRequest request, ProductSurfaceWorkspace surfaces, CancellationToken token) =>
            Results.Ok(await surfaces.Segment(productId, variantId, request, token)));
        group.MapPost("/{productId}/{variantId}/strokes", async (string productId, string variantId, SurfaceStrokeRequest request, ProductSurfaceWorkspace surfaces) =>
            Results.Ok(await surfaces.Paint(productId, variantId, request)));
        group.MapPost("/{productId}/{variantId}/approval", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Approve(productId, variantId)));
        group.MapDelete("/{productId}/{variantId}/approval", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Revoke(productId, variantId)));
        group.MapDelete("/{productId}/{variantId}/draft", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Discard(productId, variantId)));
    }
}
