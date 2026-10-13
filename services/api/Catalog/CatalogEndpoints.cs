using Microsoft.AspNetCore.Http.HttpResults;

namespace Xinobi.Api.Catalog;

public static class CatalogEndpoints
{
    public const int MaxPageSize = 100;

    /// <summary>
    /// Read-only public contract for web and mobile. Always mapped so the OpenAPI document and generated clients include it;
    /// the data source decides availability (503 outside Development until SQL Server backs it).
    /// </summary>
    public static void MapCatalog(this IEndpointRouteBuilder app)
    {
        var catalog = app.MapGroup("/api/v1/catalog").WithTags("Catalog").AllowAnonymous();
        var content = app.MapGroup("/api/v1/content").WithTags("Content").AllowAnonymous();
        foreach (var group in new[] { catalog, content })
        {
            group.AddEndpointFilter(async (context, next) =>
            {
                context.HttpContext.Response.Headers.CacheControl = "no-store";
                try { return await next(context); }
                catch (CatalogUnavailableException)
                {
                    return TypedResults.Problem(statusCode: StatusCodes.Status503ServiceUnavailable, title: "Katalog şu anda kullanılamıyor.",
                        extensions: new Dictionary<string, object?> { ["code"] = "catalog_unavailable" });
                }
            }).ProducesProblem(StatusCodes.Status503ServiceUnavailable);
        }

        catalog.MapGet("/categories", async (HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment) =>
                TypedResults.Ok((await Project(http, source, configuration, environment)).Categories()))
            .WithName("ListCatalogCategories");

        // Web compatibility contract; mobile continues to use the typed product/content contracts from the same source.
        catalog.MapGet("/storefront", async (HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment) =>
                TypedResults.Ok((await Project(http, source, configuration, environment)).Storefront()))
            .ExcludeFromDescription();

        catalog.MapGet("/products", async Task<Results<Ok<ProductPage>, ProblemHttpResult>> (
                HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment,
                string? category, string? q, bool? personalizable, int? page, int? pageSize) =>
            {
                var pageNumber = page ?? 1;
                var size = pageSize ?? 24;
                if (pageNumber < 1 || size < 1 || size > MaxPageSize || (q?.Length ?? 0) > 100)
                    return TypedResults.Problem(statusCode: StatusCodes.Status400BadRequest, title: "Geçersiz liste parametresi.",
                        detail: $"page en az 1, pageSize 1–{MaxPageSize}, q en fazla 100 karakter olmalı.",
                        extensions: new Dictionary<string, object?> { ["code"] = "invalid_query" });
                return TypedResults.Ok((await Project(http, source, configuration, environment)).Products(category, q, personalizable, pageNumber, size));
            })
            .WithName("ListCatalogProducts");

        catalog.MapGet("/products/{id}", async Task<Results<Ok<ProductDetail>, ProblemHttpResult>> (
                string id, HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment) =>
                (await Project(http, source, configuration, environment)).Detail(id) is { } product
                    ? TypedResults.Ok(product)
                    : TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "Ürün bulunamadı.",
                        extensions: new Dictionary<string, object?> { ["code"] = "product_not_found" }))
            .WithName("GetCatalogProduct");

        content.MapGet("/home", async (HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment) =>
                TypedResults.Ok((await Project(http, source, configuration, environment)).Home()))
            .WithName("GetHomeContent");

        content.MapGet("/announcements", async (HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment) =>
                TypedResults.Ok((await Project(http, source, configuration, environment)).Announcements()))
            .WithName("ListAnnouncements");
    }

    internal static async Task<CatalogProjection> Project(HttpContext http, ICatalogSource source, IConfiguration configuration, IWebHostEnvironment environment) =>
        new(await source.ReadAsync(), path => ResolveUrl(path, http.Request, configuration["Catalog:AssetBaseUrl"], environment.IsDevelopment()));

    /// <summary>
    /// API media resolves against the request origin; web static assets (<c>/assets/…</c>) against <c>Catalog:AssetBaseUrl</c>,
    /// which in Development defaults to the requesting host on the web dev port (works for 127.0.0.1, localhost and the Android emulator's 10.0.2.2).
    /// </summary>
    public static string? ResolveUrl(string? path, HttpRequest request, string? assetBaseUrl, bool development)
    {
        if (string.IsNullOrWhiteSpace(path)) return null;
        if (Uri.TryCreate(path, UriKind.Absolute, out var absolute) && absolute.Scheme is "http" or "https") return path;
        if (!path.StartsWith('/')) return null;
        if (path.StartsWith("/assets/", StringComparison.Ordinal))
        {
            var assetBase = assetBaseUrl ?? (development ? $"{request.Scheme}://{request.Host.Host}:3000" : null);
            return assetBase is null ? null : assetBase.TrimEnd('/') + path;
        }
        return $"{request.Scheme}://{request.Host}{path}";
    }
}
