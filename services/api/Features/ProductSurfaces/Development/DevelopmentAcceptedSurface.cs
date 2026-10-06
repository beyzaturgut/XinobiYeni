using System.Net;
using System.Security.Cryptography;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Features.ProductSurfaces.Development;

// Accepted manual prototype reference, NOT a fabricated AI ReviewDecision or production Asset.
public sealed record SurfaceRenderingMedia(string Url, string Sha256);
public sealed record SurfaceRenderingInputs(string SurfaceVersion, string SourceMediaVersion,
    int Width, int Height, SurfaceRenderingMedia Source, SurfaceRenderingMedia Mask,
    bool BrandingRequired, SurfaceRenderingMedia? Branding);
public sealed record DevelopmentSurfaceBundle(string Scope, string ProductReference,
    string VariantReference, bool PreviewAvailable, SurfaceRenderingInputs? Inputs);

public sealed class DevelopmentAcceptedSurface(string repositoryRoot)
{
    public const string Route = "/api/v1/dev/product-surfaces/{productReference}/{variantReference}/rendering-inputs";
    public const string SourceSha = "da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414";
    public const string MaskSha = "8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06";
    public const string BrandingSha = "7f2337118d63980f4e3e36ad502bc2b92d0df88821a60d96dcfef1469dda1c88";

    public DevelopmentSurfaceBundle Resolve(string productReference, string variantReference)
    {
        var unavailable = new DevelopmentSurfaceBundle("development-preview", productReference, variantReference, false, null);
        if (productReference != DevelopmentTeaMakerMedia.ProductReference || variantReference != DevelopmentTeaMakerMedia.VariantReference)
            return unavailable;
        try
        {
            var inspector = new AlignedImageInspector();
            var media = new DevelopmentTeaMakerMedia(repositoryRoot, inspector);
            var source = media.Resolve(DevelopmentTeaMakerMedia.AssetReference, productReference, variantReference);
            if (source.Width != 1066 || source.Height != 1600 || source.Sha256 != SourceSha) return unavailable;
            var mask = media.ValidateReferenceMask(source).ForSource(source);
            if (mask.Sha256 != MaskSha) return unavailable;
            const string brandingPath = "/assets/personalization/tea-maker-101-blue-branding-overlay.png";
            var brandingBytes = File.ReadAllBytes(Path.Combine(repositoryRoot, "apps/web/public", brandingPath.TrimStart('/')));
            var branding = inspector.InspectSource(brandingBytes, "dev:tea-maker-101:blue:branding:v1");
            if (branding.Width != source.Width || branding.Height != source.Height || branding.Sha256 != BrandingSha)
                return unavailable;
            var version = Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(
                $"manual-prototype-v1:{source.MediaVersionId}:{SourceSha}:{MaskSha}:{BrandingSha}"))).ToLowerInvariant();
            static SurfaceRenderingMedia Asset(string path, string sha) => new($"{path}?v={sha}", sha);
            return unavailable with { PreviewAvailable = true, Inputs = new(version, source.MediaVersionId,
                source.Width, source.Height, Asset("/assets/products/tea-maker-101-blue.webp", SourceSha),
                Asset("/assets/personalization/tea-maker-101-blue-designable.png", MaskSha), true,
                Asset(brandingPath, BrandingSha)) };
        }
        catch (Exception error) when (error is IOException or InvalidDataException or UnauthorizedAccessException or InvalidOperationException or ArgumentException)
        {
            // Safe availability result: no paths, provider details or secret/configuration output.
            return unavailable;
        }
    }
}

public static class DevelopmentAcceptedSurfaceEndpoints
{
    public static void MapDevelopmentAcceptedSurface(this WebApplication app, string repositoryRoot)
    {
        var resolver = new DevelopmentAcceptedSurface(repositoryRoot);
        app.MapGet(DevelopmentAcceptedSurface.Route, (HttpContext context, string productReference, string variantReference) =>
        {
            if (context.Connection.RemoteIpAddress is { } remote && !IPAddress.IsLoopback(remote) ||
                context.Request.Host.Host is not ("localhost" or "127.0.0.1" or "::1")) return Results.NotFound();
            context.Response.Headers.CacheControl = "no-store";
            return Results.Ok(resolver.Resolve(productReference, variantReference));
        }).WithTags("DevelopmentProductSurfaces");
    }
}
