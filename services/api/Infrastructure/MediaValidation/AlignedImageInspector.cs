using System.Security.Cryptography;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;

namespace Xinobi.Api.Infrastructure.MediaValidation;

public sealed record MaskAlphaStatistics(byte Minimum, byte Maximum, long TransparentPixels,
    long OpaquePixels, long IntermediatePixels, double MeanAlpha);

// Structural validation only; not PrintArea, semantic alignment or production approval.
public sealed record ValidatedAlignedMask(SourceMediaIdentity Source, MaskMetadata Metadata, MaskAlphaStatistics Alpha)
{
    public MaskMetadata ForSource(SourceMediaIdentity currentSource)
    {
        if (Source != currentSource) throw new InvalidOperationException("Mask source identity does not match.");
        return Metadata;
    }
}

public sealed class AlignedImageInspector(long maxPixels = 20_000_000)
{
    private const int MaxEncodedBytes = 32 * 1024 * 1024;

    public SourceMediaIdentity InspectSource(ReadOnlySpan<byte> encoded, string mediaVersionReference)
    {
        using var bitmap = Decode(encoded);
        return new SourceMediaIdentity(mediaVersionReference, Checksum(encoded), bitmap.Width, bitmap.Height);
    }

    public ValidatedAlignedMask ValidateMask(ReadOnlySpan<byte> encoded, string maskReference,
        SourceMediaIdentity boundSource, SourceMediaIdentity currentSource)
    {
        ArgumentNullException.ThrowIfNull(boundSource);
        ArgumentNullException.ThrowIfNull(currentSource);
        if (boundSource != currentSource) throw new InvalidOperationException("Mask source identity is stale or mismatched.");
        // The renderer contract is RGBA PNG, not grayscale/RGB with inferred alpha.
        ReadOnlySpan<byte> signature = [137, 80, 78, 71, 13, 10, 26, 10];
        if (encoded.Length < 26 || !encoded[..8].SequenceEqual(signature) || encoded[25] != 6)
            throw new InvalidDataException("An RGBA PNG mask is required.");
        using var bitmap = Decode(encoded);
        if (bitmap.Width != currentSource.Width || bitmap.Height != currentSource.Height)
            throw new InvalidDataException("Mask dimensions must exactly match the source.");
        byte min = 255, max = 0;
        long zero = 0, opaque = 0, intermediate = 0, sum = 0;
        foreach (var pixel in bitmap.Pixels)
        {
            var alpha = pixel.Alpha;
            min = Math.Min(min, alpha);
            max = Math.Max(max, alpha);
            sum += alpha;
            if (alpha == 0) zero++;
            else if (alpha == 255) opaque++;
            else intermediate++;
        }
        var mean = (double)sum / ((long)bitmap.Width * bitmap.Height);
        // Conservative structural guard: <=1/255 average coverage is effectively empty,
        // >=254/255 is effectively full. No pixel is changed or thresholded.
        if (zero == 0 || mean <= 1 || mean >= 254)
            throw new InvalidDataException("Mask is effectively empty or full.");
        return new ValidatedAlignedMask(boundSource,
            new MaskMetadata(maskReference, Checksum(encoded), bitmap.Width, bitmap.Height),
            new MaskAlphaStatistics(min, max, zero, opaque, intermediate, mean));
    }

    private static string Checksum(ReadOnlySpan<byte> encoded) => Convert.ToHexString(SHA256.HashData(encoded)).ToLowerInvariant();

    private SKBitmap Decode(ReadOnlySpan<byte> encoded)
    {
        if (encoded.Length == 0 || encoded.Length > MaxEncodedBytes) throw new InvalidDataException("Encoded image size is invalid.");
        using var data = SKData.CreateCopy(encoded.ToArray());
        using var codec = SKCodec.Create(data) ?? throw new InvalidDataException("Image cannot be decoded.");
        var info = codec.Info;
        if (info.Width <= 0 || info.Height <= 0 || (long)info.Width * info.Height > maxPixels)
            throw new InvalidDataException("Decoded image dimensions exceed validation limits.");
        var bitmap = new SKBitmap(new SKImageInfo(info.Width, info.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        if (codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success)
        {
            bitmap.Dispose();
            throw new InvalidDataException("Image could not be fully decoded.");
        }
        return bitmap;
    }
}
