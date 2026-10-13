using System.Security.Cryptography;
using SkiaSharp;
using Xinobi.Api.Catalog;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

// Candidate-only extension. No endpoint, socket factory, credential lookup, catalog write or approval.
public sealed class Cm101CatalogSourceResolver(ICatalogSource catalog, string mediaDirectory)
{
    public const string ProductId = "DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6";
    public const string VariantId = "DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1";
    public const string FileName = "01b20091ecaa4fbb86a9a929bf7b56ee.webp";
    public const string ImagePath = "/api/v1/local-commerce/media/" + FileName;
    public const int MaxEncodedBytes = 20 * 1024 * 1024;
    public static SourceMediaIdentity Source { get; } = new(
        "dev:catalog:" + ProductId + ":" + VariantId + ":" + FileName + ":v1",
        "f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935", 3543, 5315);
    public static SurfaceIntent Target { get; } = new("lower-kettle-body", "lower kettle body");
    public const string RequiredReview = "Exclude upper teapot, spout, handle, metal seams/rings, base, background, ground shadow and XINOBI branding. Prompt success is not semantic approval.";

    public async Task<byte[]> ResolveAsync(string productId, string variantId)
    {
        if (productId != ProductId || variantId != VariantId)
            throw new SegmentationProviderException("catalog_source_not_supported", 409);
        var state = await catalog.ReadAsync();
        var products = state.Products.Where(p => p.Id == productId).ToArray();
        if (products.Length != 1 || !products[0].Active || products[0].Personalizable != true)
            throw new SegmentationProviderException("catalog_source_ineligible", 409);
        var variants = products[0].Variants.Where(v => v.Id == variantId).ToArray();
        if (variants.Length != 1 || variants[0].Image != ImagePath)
            throw new SegmentationProviderException("catalog_source_mismatch", 409);
        return ReadValidatedBytes(Source);
    }

    public byte[] ReadValidatedBytes(SourceMediaIdentity requested)
    {
        if (requested != Source) throw new SegmentationProviderException("provider_source_mismatch", 409);
        try
        {
            // Only this fixed filename under the configured local media directory; never fetch URLs.
            using var stream = new FileStream(Path.Combine(mediaDirectory, FileName), FileMode.Open, FileAccess.Read, FileShare.Read);
            if (stream.Length is <= 0 or > MaxEncodedBytes) throw new InvalidDataException();
            var bytes = new byte[checked((int)stream.Length)];
            stream.ReadExactly(bytes);
            if (stream.ReadByte() != -1 || Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant() != Source.Sha256 ||
                new AlignedImageInspector().InspectSource(bytes, Source.MediaVersionId) != Source)
                throw new InvalidDataException();
            return bytes;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or InvalidDataException)
        { throw new SegmentationProviderException("provider_source_mismatch", 409); }
    }
}

// All gates default off. HTTP transport must still be explicitly supplied by a separately authorized composition.
public sealed record Cm101CandidateGates(bool Development = false, bool ReviewEnabled = false,
    bool Cm101AutomaticEnabled = false, bool ExternalInferenceEnabled = false, string Provider = "reference")
{
    public bool Allows => Development && ReviewEnabled && Cm101AutomaticEnabled && ExternalInferenceEnabled && Provider == "roboflow";
}

public sealed class Cm101AutomaticSegmentationProvider(Cm101CatalogSourceResolver source,
    Cm101CandidateGates gates, Func<RoboflowSurfaceSegmentationProvider> authorizedProviderFactory) : ISurfaceSegmentationProvider
{
    private int attempted;
    public async Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken)
    {
        if (!gates.Allows) throw new SegmentationProviderException("cm101_automatic_disabled", 503);
        if (request.Source != Cm101CatalogSourceResolver.Source || request.Surface != Cm101CatalogSourceResolver.Target)
            throw new SegmentationProviderException("cm101_request_mismatch", 409);
        cancellationToken.ThrowIfCancellationRequested();
        await source.ResolveAsync(Cm101CatalogSourceResolver.ProductId, Cm101CatalogSourceResolver.VariantId);
        if (Interlocked.CompareExchange(ref attempted, 1, 0) != 0)
            throw new SegmentationProviderException("cm101_attempt_exhausted", 409);
        // Factory invocation is deferred until source/gates pass. No default network transport or retries.
        var result = await authorizedProviderFactory().GenerateAutomaticAsync(request, cancellationToken);
        await source.ResolveAsync(Cm101CatalogSourceResolver.ProductId, Cm101CatalogSourceResolver.VariantId);
        if (result.Source != request.Source || result.Candidates.Any(c => c.Mask.Width != request.Source.Width || c.Mask.Height != request.Source.Height))
            throw new SegmentationProviderException("provider_source_mismatch", 409);
        return result; // SurfaceSegmentationService creates Pending candidates; never approval/publication.
    }
    public Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken)
        => throw new SegmentationProviderException("cm101_interactive_disabled", 503);
}

public sealed record Cm101BrandingProtectionCheck(string SourceChecksum, string MaskChecksum,
    string BrandingChecksum, bool RequiresManualVisualReview = true);

public static class Cm101BrandingProtectionValidator
{
    // Separate acceptance prerequisite, not segmentation. A human must verify complete logo coverage.
    public static Cm101BrandingProtectionCheck Validate(byte[] sourceBytes, byte[] maskBytes, byte[] brandingBytes)
    {
        var inspector = new AlignedImageInspector();
        var source = inspector.InspectSource(sourceBytes, Cm101CatalogSourceResolver.Source.MediaVersionId);
        if (source != Cm101CatalogSourceResolver.Source) throw new InvalidDataException("Branding source mismatch.");
        var mask = inspector.ValidateMask(maskBytes, "dev:cm101:pending-mask", source, source);
        // A logo can legitimately cover less than 1/255 of the image: do not apply mask coverage thresholds.
        ReadOnlySpan<byte> signature = [137,80,78,71,13,10,26,10];
        if (brandingBytes.Length < 26 || !brandingBytes.AsSpan(0,8).SequenceEqual(signature) || brandingBytes[25] != 6)
            throw new InvalidDataException("Branding must be RGBA PNG.");
        var branding = inspector.InspectSource(brandingBytes, "dev:cm101:branding-review");
        if (branding.Width != source.Width || branding.Height != source.Height)
            throw new InvalidDataException("Branding dimensions mismatch.");
        using var original = SKBitmap.Decode(sourceBytes);
        using var overlay = SKBitmap.Decode(brandingBytes);
        using var allowed = SKBitmap.Decode(maskBytes);
        // No full-resolution managed color-array copies. Protected logo pixels must be original and excluded from mask.
        long protectedPixels = 0;
        for (var y = 0; y < source.Height; y++)
            for (var x = 0; x < source.Width; x++)
            {
                var pixel = overlay.GetPixel(x, y);
                if (pixel.Alpha == 0) continue;
                protectedPixels++;
                var expected = original.GetPixel(x, y);
                if (pixel.Alpha != 255 || pixel.Red != expected.Red || pixel.Green != expected.Green || pixel.Blue != expected.Blue || allowed.GetPixel(x, y).Alpha != 0)
                    throw new InvalidDataException("Branding pixels must be original, opaque and outside the designable mask.");
            }
        if (protectedPixels == 0 || protectedPixels == (long)source.Width * source.Height)
            throw new InvalidDataException("Branding protection must be nonempty and localized.");
        return new(source.Sha256, mask.Metadata.Sha256, branding.Sha256);
    }
}
