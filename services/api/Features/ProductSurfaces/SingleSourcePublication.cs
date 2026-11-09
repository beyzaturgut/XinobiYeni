using Xinobi.Api.Infrastructure;
using SkiaSharp;

namespace Xinobi.Api.Features.ProductSurfaces;

public sealed record SurfaceMedia(string Url, string Sha256);
public sealed record SingleSourceRenderingInputs(string SurfaceVersion, string SourceMediaVersion, int Width, int Height,
    SurfaceMedia Source, SurfaceMedia Mask, bool BrandingRequired = false, SurfaceMedia? Branding = null);
public sealed record SingleSourcePublication(int SchemaVersion, string Scope, string ProductReference, string SurfaceId,
    int SourceRevision, SingleSourceRenderingInputs Inputs);

public sealed partial class PersonalizationSourceStore
{
    private static string SurfaceId(PersonalizationMask mask) => $"source-{mask.SourceRevision}-mask-{mask.Id}";
    private static string PublicRoot(string productId) => "/api/v1/product-surfaces/" + Uri.EscapeDataString(productId);

    private async Task<(PersonalizationSourceAsset Source, byte[] SourceBytes, PersonalizationMask Mask, byte[] MaskBytes)> Published(string productId)
    {
        var product = (await catalog.Read()).Products.SingleOrDefault(p => p.Id == productId);
        if (product is null || !product.Active || product.Personalizable != true)
            throw ProblemException.NotFound("surface_not_available", "Onaylı ürün yüzeyi bulunamadı.");
        var state = await store.Read(); Validate(state);
        var profile = state.Profiles.GetValueOrDefault(productId);
        if (profile is null || CurrentMask(profile, profile.ApprovedId) is not { } approved)
            throw ProblemException.NotFound("surface_not_available", "Onaylı ürün yüzeyi bulunamadı.");
        var source = profile.Sources.Last().Asset;
        var inspected = await Inspect(source.Image);
        if (inspected.Asset != source)
            throw new ProblemException("source_changed", "Onaylı yüzey kaynağı doğrulanamadı.", 409);
        var maskBytes = await MaskBytes(approved);
        // Pixel semantics were validated at import. Check integrity and canvas here without allocating
        // another full bitmap on each anonymous image request; no new decoder limit on approved history.
        using var data = SKData.CreateCopy(maskBytes);
        using var codec = SKCodec.Create(data);
        if (codec is null || codec.EncodedFormat != SKEncodedImageFormat.Png || codec.Info.Width != source.Width || codec.Info.Height != source.Height)
            throw new ProblemException("mask_corrupt", "Onaylı maske doğrulanamadı.", 503);
        return (source, inspected.Bytes, approved, maskBytes);
    }

    public async Task<SingleSourcePublication> RenderingInputs(string productId)
    {
        var value = await Published(productId);
        var id = SurfaceId(value.Mask); var root = PublicRoot(productId) + "/" + id;
        return new(1, "single-source-preview", productId, id, value.Mask.SourceRevision,
            new(value.Mask.Sha256, value.Source.Sha256, value.Source.Width, value.Source.Height,
                new(root + "/source?v=" + value.Source.Sha256, value.Source.Sha256),
                new(root + "/mask?v=" + value.Mask.Sha256, value.Mask.Sha256)));
    }

    public async Task<(byte[] Bytes, string Mime)> PublishedMedia(string productId, string surfaceId, string role, string version)
    {
        var value = await Published(productId);
        if (SurfaceId(value.Mask) != surfaceId || (role == "source" ? value.Source.Sha256 : value.Mask.Sha256) != version || role is not ("source" or "mask"))
            throw ProblemException.NotFound("surface_version_not_available", "Bu yüzey sürümü artık yayında değil.");
        return role == "source" ? (value.SourceBytes, value.Source.Mime) : (value.MaskBytes, "image/png");
    }
}

public static class SingleSourcePublicationEndpoints
{
    public static void MapSingleSourcePublication(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/product-surfaces").WithTags("ProductSurfaces").AllowAnonymous();
        group.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            try { return await next(context); }
            catch (ProblemException error) { return Results.Json(new { code = error.Code, message = error.Message }, statusCode: error.Status); }
        });
        group.MapGet("/{productId}/rendering-inputs", async (string productId, PersonalizationSourceStore sources) =>
            TypedResults.Ok(await sources.RenderingInputs(productId)))
            .WithName("GetSingleSourceRenderingInputs").Produces<SingleSourcePublication>();
        group.MapGet("/{productId}/{surfaceId}/{role}", async (string productId, string surfaceId, string role, string v, PersonalizationSourceStore sources) =>
        {
            var value = await sources.PublishedMedia(productId, surfaceId, role, v);
            return Results.File(value.Bytes, value.Mime);
        }).WithName("GetSingleSourceSurfaceMedia");
    }
}
