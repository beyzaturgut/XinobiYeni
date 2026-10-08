using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.MaskProcessing;

public sealed record EnclosedHolePolicy(int MaxEnclosedHoleAreaPixels);
public sealed record MaskRefinementResult(byte[] Bytes, ValidatedAlignedMask Mask, int HolesFound,
    int HolesFilled, int PixelsFilled, int RawForeground, int DerivedForeground);

// Explicit policy only. Never changes exterior background, foreground, or source dimensions.
public sealed class DesignableMaskRefiner
{
    public const string Algorithm = "enclosed-background-fill";
    public const string Version = "1";
    public const int Connectivity = 8;

    public MaskRefinementResult Refine(byte[] rawBytes, ValidatedAlignedMask raw, SourceMediaIdentity source,
        EnclosedHolePolicy policy, string derivedReference)
    {
        ArgumentNullException.ThrowIfNull(policy);
        ArgumentOutOfRangeException.ThrowIfNegative(policy.MaxEnclosedHoleAreaPixels);
        var inspector = new AlignedImageInspector();
        var checkedRaw = inspector.ValidateMask(rawBytes, raw.Metadata.AssetReference, raw.Source, source);
        if (checkedRaw != raw) throw new InvalidDataException("raw_mask_snapshot_mismatch");
        using var data = SKData.CreateCopy(rawBytes);
        using var codec = SKCodec.Create(data)!;
        using var bitmap = new SKBitmap(new SKImageInfo(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        if (codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success) throw new InvalidDataException("mask_decode_failed");
        var pixels = bitmap.Pixels;
        var w = source.Width; var h = source.Height; var n = checked(w * h);
        var visited = new bool[n]; var queue = new int[n];
        int rawForeground = pixels.Count(p => p.Alpha > 0), holes = 0, filled = 0, added = 0;

        int Flood(int seed)
        {
            int head = 0, tail = 1; queue[0] = seed; visited[seed] = true;
            while (head < tail)
            {
                var at = queue[head++]; var x = at % w; var y = at / w;
                for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++)
                {
                    if (dx == 0 && dy == 0) continue;
                    var xx = x + dx; var yy = y + dy;
                    if (xx < 0 || xx >= w || yy < 0 || yy >= h) continue;
                    var next = yy * w + xx;
                    if (!visited[next] && pixels[next].Alpha == 0)
                    { visited[next] = true; queue[tail++] = next; }
                }
            }
            return tail;
        }
        void Exterior(int at) { if (!visited[at] && pixels[at].Alpha == 0) Flood(at); }
        for (var x = 0; x < w; x++) { Exterior(x); Exterior((h - 1) * w + x); }
        for (var y = 0; y < h; y++) { Exterior(y * w); Exterior(y * w + w - 1); }
        for (var at = 0; at < n; at++)
        {
            if (visited[at] || pixels[at].Alpha != 0) continue;
            var area = Flood(at); holes++;
            if (area > policy.MaxEnclosedHoleAreaPixels) continue;
            filled++; added += area;
            for (var j = 0; j < area; j++)
            {
                var index = queue[j]; var pixel = pixels[index];
                pixels[index] = new SKColor(pixel.Red, pixel.Green, pixel.Blue, 255);
            }
        }
        bitmap.Pixels = pixels;
        // Encode the unpremultiplied raster directly; avoid SKImage premultiplication round trips.
        using var pixmap = bitmap.PeekPixels() ?? throw new InvalidDataException("mask_raster_unavailable");
        using var encoded = pixmap.Encode(SKEncodedImageFormat.Png, 100) ?? throw new InvalidDataException("mask_encode_failed");
        var bytes = encoded.ToArray();
        var mask = inspector.ValidateMask(bytes, derivedReference, source, source);
        return new(bytes, mask, holes, filled, added, rawForeground, rawForeground + added);
    }
}
