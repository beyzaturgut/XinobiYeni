using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Features.ProductSurfaces.Catalog;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.MaskProcessing;

/// <summary>Intersect AI output with the painted guide plus an explicit, bounded Manhattan pixel tolerance.</summary>
public static class GuidedMaskBounds
{
    public static byte[] Apply(byte[] candidate, byte[] guide, SourceMediaIdentity source, int tolerance)
    {
        if (tolerance is < 0 or > 16) throw new SurfaceException("invalid_guide_tolerance", "Kenar toleransı 0–16 kaynak pikseli olmalı.");
        var inspector = new AlignedImageInspector();
        inspector.ValidateMask(candidate, "dev:guided-candidate", source, source);
        inspector.ValidateMask(guide, "dev:painted-guide", source, source);
        using var input = SKBitmap.Decode(candidate);
        using var painted = SKBitmap.Decode(guide);
        var w = source.Width; var h = source.Height;
        var guidePixels = painted.Pixels;
        var distances = new int[guidePixels.Length];
        var infinity = w + h;
        for (var y = 0; y < h; y++) for (var x = 0; x < w; x++)
        {
            var i = y * w + x;
            distances[i] = guidePixels[i].Alpha > 0 ? 0 : Math.Min(x > 0 ? distances[i - 1] + 1 : infinity, y > 0 ? distances[i - w] + 1 : infinity);
        }
        for (var y = h - 1; y >= 0; y--) for (var x = w - 1; x >= 0; x--)
        {
            var i = y * w + x;
            distances[i] = Math.Min(distances[i], Math.Min(x + 1 < w ? distances[i + 1] + 1 : infinity, y + 1 < h ? distances[i + w] + 1 : infinity));
        }
        var pixels = input.Pixels;
        for (var i = 0; i < pixels.Length; i++) pixels[i] = pixels[i].Alpha > 0 && distances[i] <= tolerance ? SKColors.White : SKColors.Transparent;
        using var output = new SKBitmap(new SKImageInfo(w, h, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        output.Pixels = pixels;
        using var png = output.Encode(SKEncodedImageFormat.Png, 100);
        var bytes = png.ToArray();
        try { inspector.ValidateMask(bytes, "dev:bounded-guide-result", source, source); }
        catch (InvalidDataException) { throw new SurfaceException("guide_no_overlap", "Roboflow sonucu boyadığın alanla yeterince örtüşmedi. Boyaman korundu; yeni maske kaydedilmedi.", 422); }
        return bytes;
    }
}
