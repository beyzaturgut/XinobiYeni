using System.Net;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Features.ProductSurfaces.Catalog;

/// <summary>
/// Admin surface masking for every product variant, under /api/v1/local-commerce/surfaces with the staff catalog permissions
/// (<see cref="PanelAccess"/>). Development: loopback and the local panel/web origins (ADR-003), opted in with
/// <c>ProductSurfaces:ExperimentalCatalogWorkspace:Enabled</c>. Elsewhere: only with the SQL admin catalog
/// (<c>AdminCatalog:Enabled</c>), the same same-origin and HTTPS rules as the rest of that panel group, and
/// <c>ProductSurfaces:CatalogWorkspace:Enabled</c> (default on) to switch it off.
/// </summary>
public static class ProductSurfaceEndpoints
{
    public static bool Enabled(WebApplication app) => app.Environment.IsDevelopment()
        ? app.Configuration.GetValue<bool>("ProductSurfaces:ExperimentalCatalogWorkspace:Enabled")
        : app.Configuration.GetValue<bool>("AdminCatalog:Enabled") && app.Configuration.GetValue("ProductSurfaces:CatalogWorkspace:Enabled", true);

    public static void MapProductSurfaces(this WebApplication app)
    {
        if (!Enabled(app)) return;
        var development = app.Environment.IsDevelopment();
        // Public, read-only storefront input for an approved mask of an active product; it holds no personal data.
        app.MapGet("/api/v1/dev/product-surfaces/commerce-mask/{productId}/{variantId}/rendering-inputs",
            async Task<IResult> (string productId, string variantId, HttpContext context, ProductSurfaceWorkspace surfaces) =>
            {
                if (development && context.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(403);
                context.Response.Headers.CacheControl = "no-store";
                try { return Results.Ok(await surfaces.RenderingInputs(productId, variantId)); }
                catch (SurfaceException error) { return Results.Json(new { code = error.Code, message = error.Message }, statusCode: error.Status); }
            }).AllowAnonymous();
        var group = app.MapGroup("/api/v1/local-commerce/surfaces").WithTags("ProductSurfaces").RequirePanelPermissions();
        if (development) group.RequireRateLimiting("DesignStudio");
        // The IP test server serves the panel over plain HTTP (AdminCatalog:RequireHttps=false); the admin must still share its origin.
        var requireHttps = app.Configuration.GetValue("AdminCatalog:RequireHttps", true);
        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            if (development && http.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            if (!development && requireHttps && !http.Request.IsHttps) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var origin = http.Request.Headers.Origin.ToString();
            if (origin.Length > 0 && (development ? !LocalCommerceEndpoints.AllowedOrigin(origin)
                : !string.Equals(origin, $"{http.Request.Scheme}://{http.Request.Host}", StringComparison.OrdinalIgnoreCase))) return Results.StatusCode(StatusCodes.Status403Forbidden);
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
