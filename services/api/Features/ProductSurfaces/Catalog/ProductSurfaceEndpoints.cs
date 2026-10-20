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
        // Read-only bridge for the experimental storefront. No staff session is needed to view a public product mask.
        app.MapGet("/api/v1/dev/product-surfaces/commerce-mask/{productId}/{variantId}/rendering-inputs",
            async Task<IResult> (string productId, string variantId, HttpContext context, ProductSurfaceWorkspace surfaces) =>
            {
                if (context.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(403);
                context.Response.Headers.CacheControl = "no-store";
                try { return Results.Ok(await surfaces.RenderingInputs(productId, variantId)); }
                catch (SurfaceException error) { return Results.Json(new { code = error.Code, message = error.Message }, statusCode: error.Status); }
            }).AllowAnonymous(); // Public, read-only preview; Development and loopback checks still apply.
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
        group.MapGet("/{productId}/{variantId}/draft.webp", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) =>
            Results.File(Xinobi.Api.Infrastructure.MaskProcessing.ManualSurfaceMasks.ExportWebp(await surfaces.DraftMask(productId, variantId)), "image/webp"));
        group.MapPost("/{productId}/{variantId}/mask", async (string productId, string variantId, SurfaceWebpRequest request, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.ImportWebp(productId, variantId, request)));
        group.MapPost("/{productId}/{variantId}/approval", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Approve(productId, variantId)));
        group.MapPost("/{productId}/{variantId}/approval/colors", async (string productId, string variantId, SurfaceApprovalRequest request, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.ApproveColors(productId, variantId, request)));
        group.MapDelete("/{productId}/{variantId}/approval", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Revoke(productId, variantId)));
        group.MapDelete("/{productId}/{variantId}/draft", async (string productId, string variantId, ProductSurfaceWorkspace surfaces) => Results.Ok(await surfaces.Discard(productId, variantId)));
    }
}
