using System.Text.RegularExpressions;
using SkiaSharp;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
namespace Xinobi.Api.Orders;

/// <summary>Checks the immutable order snapshot only. Never consults the live catalogue or customer configuration.</summary>
public static class OrderSnapshotIntegrity
{
    public static bool SingleSource(CustomerOrderLine line) => line.Personalization is { } p && (p.SchemaVersion == 2 || p.SurfaceBinding is not null);
    public static void Validate(CustomerOrderLine line)
    {
        if (!SingleSource(line)) return;
        var p = line.Personalization!; var b = p.SurfaceBinding; var placement = p.Placement;
        if (p.SchemaVersion != 2 || b is null || placement is null || p.Files?.Pattern is null
            || b.ProductId != line.ProductId || b.FulfillmentVariantId != line.VariantId || b.ProfileRevision < 1 || b.SourceRevision < 1
            || !Regex.IsMatch(b.SurfaceId ?? "", $"^source-{b.SourceRevision}-mask-[a-f0-9]{{32}}$")
            || !Hash(b.ProductSourceSha256) || !Hash(b.MaskSha256) || !Hash(p.SourceSha256)
            || p.ConfigurationId is null || !Regex.IsMatch(p.ConfigurationId, "^[a-f0-9]{32}$") || p.ConfigurationRevision is not > 0
            || placement.SourceWidth != b.Width || placement.SourceHeight != b.Height || placement.SurfaceVersion != b.MaskSha256
            || p.SourceSha256 != p.Files.Pattern.Sha256 || p.Mime != p.Files.Pattern.Mime
            || p.Files.ProductSource is { } source && source.Sha256 != b.ProductSourceSha256)
            throw ProblemException.Unavailable("Sipariş yüzey kaydı");
        try { Designs.PlacementRules.Validate(placement, singleSource: true); }
        catch (ProblemException) { throw ProblemException.Unavailable("Sipariş yerleşim kaydı"); }
    }
    private static bool Hash(string? value) => value is not null && Regex.IsMatch(value, "^[a-f0-9]{64}$");
}

/// <summary>No resize or fixed canvas. Decode admission uses the same configurable RAM budget as source masking.</summary>
public static class OrderImageIntegrity
{
    private static readonly object DecodeGate = new();
    public static long PixelBudget(IConfiguration? configuration) => Math.Clamp(configuration?.GetValue<long?>("ProductSurfaces:MaskProcessingMemoryMiB") ?? 512, 16, 1024) * 1024 * 1024 / 16;
    public static (int Width, int Height, string Mime) Inspect(byte[] bytes, bool decode = false, long pixelBudget = long.MaxValue)
    {
        if (bytes.Length is 0 or > 32 * 1024 * 1024) throw new InvalidDataException("Invalid image length.");
        using var data = SKData.CreateCopy(bytes);
        using var codec = SKCodec.Create(data) ?? throw new InvalidDataException("Image cannot be read.");
        var mime = codec.EncodedFormat switch { SKEncodedImageFormat.Png => "image/png", SKEncodedImageFormat.Jpeg => "image/jpeg", SKEncodedImageFormat.Webp => "image/webp", _ => null };
        var info = codec.Info;
        if (mime is null || info.Width < 1 || info.Height < 1 || codec.FrameCount > 1) throw new InvalidDataException("Invalid image header.");
        if (decode)
        {
            if ((long)info.Width * info.Height > pixelBudget) throw new InvalidDataException("Image exceeds decoding memory budget.");
            lock (DecodeGate)
            {
                using var bitmap = new SKBitmap(new SKImageInfo(info.Width, info.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
                if (bitmap.GetPixels() == IntPtr.Zero || codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success)
                    throw new InvalidDataException("Image could not be fully decoded.");
            }
        }
        return (info.Width, info.Height, mime);
    }
}
