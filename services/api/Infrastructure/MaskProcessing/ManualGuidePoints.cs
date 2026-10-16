using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces.Catalog;

namespace Xinobi.Api.Infrastructure.MaskProcessing;

/// <summary>Samples the interior of a rough painted guide, never its uncertain edge. Sampling only; final bounds are applied separately by GuidedMaskBounds.</summary>
public static class ManualGuidePoints
{
    public static SurfacePoint[] Sample(byte[] png)
    {
        using var bitmap = SKBitmap.Decode(png) ?? throw new SurfaceException("guide_invalid", "Kılavuz maske okunamadı.");
        var w = bitmap.Width; var h = bitmap.Height;
        if ((long)w * h > 20_000_000) throw new SurfaceException("guide_too_large", "Kılavuz en fazla 20 milyon piksel olabilir.");
        var pixels = bitmap.Pixels;
        var distance = new int[pixels.Length];
        for (var y = 0; y < h; y++) for (var x = 0; x < w; x++)
        {
            var i = y * w + x;
            distance[i] = pixels[i].Alpha == 0 ? 0 : 1 + Math.Min(x > 0 ? distance[i - 1] : 0, y > 0 ? distance[i - w] : 0);
        }
        for (var y = h - 1; y >= 0; y--) for (var x = w - 1; x >= 0; x--)
        {
            var i = y * w + x;
            if (distance[i] > 0) distance[i] = Math.Min(distance[i], 1 + Math.Min(x + 1 < w ? distance[i + 1] : 0, y + 1 < h ? distance[i + w] : 0));
        }
        var margin = Math.Max(2, Math.Min(w, h) / 200);
        var spacing = Math.Max(8, Math.Min(w, h) / 10);
        var points = new List<SurfacePoint>();
        // Bounded repeated scans, with spatial suppression, favour broad interiors over small edge spills.
        for (var sample = 0; sample < 12; sample++)
        {
            var best = -1; var clearance = margin;
            for (var i = 0; i < distance.Length; i++) if (distance[i] > clearance) { best = i; clearance = distance[i]; }
            if (best < 0) break;
            var px = best % w; var py = best / w;
            points.Add(new SurfacePoint(px + .5, py + .5, true));
            for (var y = Math.Max(0, py - spacing); y <= Math.Min(h - 1, py + spacing); y++)
                for (var x = Math.Max(0, px - spacing); x <= Math.Min(w - 1, px + spacing); x++)
                    if ((x - px) * (x - px) + (y - py) * (y - py) <= spacing * spacing) distance[y * w + x] = 0;
        }
        if (points.Count == 0) throw new SurfaceException("guide_too_thin", "Bölgenin içini daha geniş boyayın; ince sınır çizgisi yerine dolu bir kılavuz kullanın.");
        return points.ToArray();
    }
}
