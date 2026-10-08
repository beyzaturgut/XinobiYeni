using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.MaskProcessing;

public sealed record MaskCorrectionResult(byte[] Bytes, ValidatedAlignedMask Mask);

// Pixel-center capsule coverage, no antialiasing/morphology. Parent pixels outside strokes are preserved.
public sealed class ManualMaskCorrector
{
    public const string Algorithm = "source-pixel-capsule-strokes";
    public const string Version = "1";
    public const long MaxRasterVisits = 25_000_000;

    public MaskCorrectionResult Correct(byte[] parentBytes, ValidatedAlignedMask parent, SourceMediaIdentity source,
        IEnumerable<MaskStroke> operations, string outputReference)
    {
        var strokes = MaskCorrectionRules.Snapshot(operations, source);
        var inspector = new AlignedImageInspector();
        if (inspector.ValidateMask(parentBytes, parent.Metadata.AssetReference, parent.Source, source) != parent)
            throw new InvalidDataException("parent_mask_snapshot_mismatch");
        using var data = SKData.CreateCopy(parentBytes);
        using var codec = SKCodec.Create(data)!;
        using var bitmap = new SKBitmap(new SKImageInfo(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        if (codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success) throw new InvalidDataException("mask_decode_failed");
        Paint(bitmap, strokes, source);
        return Encode(bitmap, source, outputReference);
    }

    /// <summary>Draws a mask from nothing: the strokes alone become the designable area (fully manual masking).</summary>
    public MaskCorrectionResult StartFromStrokes(SourceMediaIdentity source, IEnumerable<MaskStroke> operations, string outputReference)
    {
        var strokes = MaskCorrectionRules.Snapshot(operations, source);
        using var bitmap = new SKBitmap(new SKImageInfo(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        bitmap.Erase(new SKColor(255, 255, 255, 0));
        Paint(bitmap, strokes, source);
        return Encode(bitmap, source, outputReference);
    }

    private static MaskCorrectionResult Encode(SKBitmap bitmap, SourceMediaIdentity source, string outputReference)
    {
        var inspector = new AlignedImageInspector();
        using var pixmap = bitmap.PeekPixels() ?? throw new InvalidDataException("mask_raster_unavailable");
        using var png = pixmap.Encode(SKEncodedImageFormat.Png, 100) ?? throw new InvalidDataException("mask_encode_failed");
        var bytes = png.ToArray();
        return new(bytes, inspector.ValidateMask(bytes, outputReference, source, source));
    }

    private static void Paint(SKBitmap bitmap, IReadOnlyList<MaskStroke> strokes, SourceMediaIdentity source)
    {
        var pixels = bitmap.Pixels;
        long visits = 0;
        foreach (var stroke in strokes)
        {
            for (var segment = 0; segment < Math.Max(1, stroke.Points.Count - 1); segment++)
            {
                var a = stroke.Points[segment]; var b = stroke.Points[Math.Min(segment + 1, stroke.Points.Count - 1)];
                var left = Math.Max(0, (int)Math.Floor(Math.Min(a.X, b.X) - stroke.Radius));
                var right = Math.Min(source.Width - 1, (int)Math.Ceiling(Math.Max(a.X, b.X) + stroke.Radius));
                var top = Math.Max(0, (int)Math.Floor(Math.Min(a.Y, b.Y) - stroke.Radius));
                var bottom = Math.Min(source.Height - 1, (int)Math.Ceiling(Math.Max(a.Y, b.Y) + stroke.Radius));
                visits += (long)(right - left + 1) * (bottom - top + 1);
                if (visits > MaxRasterVisits) throw new InvalidDataException("correction_work_limit");
                var vx = b.X - a.X; var vy = b.Y - a.Y; var length2 = vx * vx + vy * vy;
                for (var y = top; y <= bottom; y++) for (var x = left; x <= right; x++)
                {
                    var px = x + .5; var py = y + .5;
                    var t = length2 == 0 ? 0 : Math.Clamp(((px - a.X) * vx + (py - a.Y) * vy) / length2, 0, 1);
                    var dx = px - a.X - t * vx; var dy = py - a.Y - t * vy;
                    if (dx * dx + dy * dy > stroke.Radius * stroke.Radius) continue;
                    var at = y * source.Width + x; var p = pixels[at];
                    pixels[at] = new SKColor(p.Red, p.Green, p.Blue, stroke.Operation == MaskStrokeOperation.Add ? (byte)255 : (byte)0);
                }
            }
        }
        bitmap.Pixels = pixels;
    }
}
