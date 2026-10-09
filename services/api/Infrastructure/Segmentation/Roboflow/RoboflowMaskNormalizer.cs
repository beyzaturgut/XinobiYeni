using System.Text.Json;
using System.Runtime.InteropServices;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

public sealed class RoboflowMaskNormalizer
{
    public (ValidatedAlignedMask Mask, byte[] Bytes) Normalize(JsonElement rle, SourceMediaIdentity source, string reference)
    {
        try
        {
            long pixels = (long)source.Width * source.Height;
            if (pixels <= 0 || pixels > 20_000_000 || rle.ValueKind != JsonValueKind.Object) throw new InvalidDataException();
            var size = rle.GetProperty("size");
            if (size.GetArrayLength() != 2 || size[0].GetInt32() != source.Height || size[1].GetInt32() != source.Width) throw new InvalidDataException();
            var counts = rle.GetProperty("counts");
            var runs = counts.ValueKind == JsonValueKind.String ? DecodeCompressed(counts.GetString()!, (int)pixels + 1) : DecodeArray(counts, (int)pixels + 1);
            var membership = new bool[(int)pixels];
            long position = 0;
            for (var runIndex = 0; runIndex < runs.Count; runIndex++)
            {
                var run = runs[runIndex];
                if (run < 0 || run > pixels - position) throw new InvalidDataException();
                if ((runIndex & 1) != 0) Array.Fill(membership, true, (int)position, (int)run);
                position += run;
            }
            if (position != pixels) throw new InvalidDataException();
            using var bitmap = new SKBitmap(new SKImageInfo(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
            // One row scratch buffer rather than another full-resolution SKColor array.
            var row = new byte[checked(source.Width * 4)];
            Array.Fill(row, (byte)255);
            for (var y = 0; y < source.Height; y++)
            {
                for (var x = 0; x < source.Width; x++)
                {
                    // SKBitmap.Pixels historically clears RGB for fully transparent pixels.
                    var value = membership[x * source.Height + y] ? (byte)255 : (byte)0;
                    row[x * 4] = row[x * 4 + 1] = row[x * 4 + 2] = row[x * 4 + 3] = value;
                }
                Marshal.Copy(row, 0, IntPtr.Add(bitmap.GetPixels(), checked(y * bitmap.RowBytes)), row.Length);
            }
            using var image = SKImage.FromBitmap(bitmap);
            using var encoded = image.Encode(SKEncodedImageFormat.Png, 100);
            var bytes = encoded.ToArray();
            return (new AlignedImageInspector().ValidateMask(bytes, reference, source, source), bytes);
        }
        catch (Exception error) when (error is InvalidDataException or InvalidOperationException or KeyNotFoundException or FormatException or OverflowException or ArgumentException)
        { throw new SegmentationProviderException("provider_invalid_mask"); }
    }

    private static List<long> DecodeArray(JsonElement counts, int limit)
    {
        if (counts.ValueKind != JsonValueKind.Array || counts.GetArrayLength() > limit) throw new InvalidDataException();
        return counts.EnumerateArray().Select(value => value.GetInt64()).ToList();
    }

    // COCO compressed signed 5-bit varints, with the two-runs-back delta after run 2.
    private static List<long> DecodeCompressed(string counts, int limit)
    {
        if (counts.Length > limit * 7L) throw new InvalidDataException();
        List<long> runs = [];
        int offset = 0;
        while (offset < counts.Length)
        {
            long value = 0; int shift = 0; int code;
            do
            {
                if (offset >= counts.Length || shift >= 60) throw new InvalidDataException();
                code = counts[offset++] - 48;
                if (code is < 0 or > 63) throw new InvalidDataException();
                value |= (long)(code & 31) << shift;
                shift += 5;
            } while ((code & 32) != 0);
            if ((code & 16) != 0) value |= -1L << shift;
            if (runs.Count > 2) value = checked(value + runs[^2]);
            if (value < 0 || runs.Count >= limit) throw new InvalidDataException();
            runs.Add(value);
        }
        return runs;
    }
}
