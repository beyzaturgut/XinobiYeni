using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Features.ProductSurfaces.Catalog;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.MaskProcessing;

/// <summary>Local, deterministic WebP mask import; normalized to RGBA PNG for the renderer. No inference or external calls.</summary>
public static class ManualSurfaceMasks
{
    public static byte[] Webp(byte[] bytes, string mode, SourceMediaIdentity source, long maxPixels = 20_000_000)
    {
        if (bytes.Length > 8 * 1024 * 1024 || bytes.Length < 12 || !bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) || !bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8) || mode is not ("alpha" or "luminance"))
            throw new SurfaceException("invalid_mask_webp", "Yalnız en fazla 8 MB WebP yükleyin ve maske türünü seçin.");
        using var data = SKData.CreateCopy(bytes);
        using var codec = SKCodec.Create(data);
        if (codec is null || codec.EncodedFormat != SKEncodedImageFormat.Webp || codec.FrameCount > 1 || bytes.Length > 20 && bytes.AsSpan(12, 4).SequenceEqual("VP8X"u8) && (bytes[20] & 2) != 0)
            throw new SurfaceException("invalid_mask_webp", "Tek kareli WebP maske gerekli; animasyon kabul edilmez.");
        if (codec.Info.Width != source.Width || codec.Info.Height != source.Height)
            throw new SurfaceException("mask_dimensions_mismatch", $"WebP tam {source.Width}×{source.Height} piksel olmalı; otomatik esnetme yapılmaz.");
        if ((long)source.Width * source.Height > maxPixels)
            throw new SurfaceException("mask_processing_capacity", "Maske işleme bellek bütçesini aşıyor; kaynak küçültülmedi.", 413);
        using var bitmap = new SKBitmap(new SKImageInfo(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        if (codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success)
            throw new SurfaceException("invalid_mask_webp", "WebP okunamadı.");
        var pixels = bitmap.Pixels;
        for (var i = 0; i < pixels.Length; i++)
        {
            var pixel = pixels[i];
            var inside = mode == "alpha" ? pixel.Alpha >= 128 : pixel.Alpha >= 128 && (299 * pixel.Red + 587 * pixel.Green + 114 * pixel.Blue) >= 128000;
            pixels[i] = inside ? SKColors.White : SKColors.Transparent;
        }
        bitmap.Pixels = pixels;
        return Encode(bitmap, source, maxPixels);
    }

    // Existing drafts remain canonical RGBA PNG; exports are real lossless WebP.
    public static byte[] ExportWebp(byte[] mask)
    {
        using var bitmap = SKBitmap.Decode(mask) ?? throw new InvalidDataException("Mask cannot be decoded.");
        using var pixels = bitmap.PeekPixels();
        using var encoded = pixels.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless, 100))
            ?? throw new InvalidDataException("Mask cannot be encoded as WebP.");
        return encoded.ToArray();
    }

    private static byte[] Encode(SKBitmap bitmap, SourceMediaIdentity source, long maxPixels)
    {
        using var png = bitmap.Encode(SKEncodedImageFormat.Png, 100);
        var bytes = png.ToArray();
        try { new AlignedImageInspector(maxPixels).ValidateMask(bytes, "dev:manual-surface-mask", source, source); }
        catch (InvalidDataException) { throw new SurfaceException("mask_empty_or_full", "Maske boş ya da tamamen dolu olamaz. Şeffaf WebP veya siyah-beyaz maske seçimini kontrol edin."); }
        return bytes;
    }
}
