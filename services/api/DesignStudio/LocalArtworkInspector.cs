using System.Diagnostics;
using System.Globalization;
using SkiaSharp;

namespace Xinobi.Api.DesignStudio;

public record ArtworkInspection(bool HasText, int SuspiciousRegions, string Version = "tesseract-local-1");
public interface IArtworkInspector
{
    bool IsConfigured { get; }
    Task<ArtworkInspection> InspectAsync(GeneratedImage image, CancellationToken cancellationToken);
}

/// <summary>Only local processes and temporary files. Never sends artwork to an external service.</summary>
public sealed class LocalArtworkInspector(IConfiguration configuration) : IArtworkInspector
{
    private string? Executable
    {
        get
        {
            var configured = configuration["DesignStudio:Ocr:Executable"];
            if (!string.IsNullOrWhiteSpace(configured)) return Path.IsPathFullyQualified(configured) && File.Exists(configured) ? configured : null;
            var name = OperatingSystem.IsWindows() ? "tesseract.exe" : "tesseract";
            return (Environment.GetEnvironmentVariable("PATH") ?? "").Split(Path.PathSeparator)
                .Select(path => Path.Combine(path, name)).FirstOrDefault(File.Exists);
        }
    }
    public bool IsConfigured => Executable is not null;
    public static bool Suspicious(string tsv)
    {
        if (!tsv.StartsWith("level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext", StringComparison.Ordinal)) throw Unavailable();
        foreach (var line in tsv.Split('\n'))
        {
            var columns = line.TrimEnd('\r').Split('\t', 12);
            if (columns.Length != 12 || columns[0] != "5" ||
                !float.TryParse(columns[10], NumberStyles.Float, CultureInfo.InvariantCulture, out var confidence)) continue;
            // Even low-confidence marks can be signatures; do not require dictionary words.
            if (confidence >= 0 && columns[11].Count(char.IsLetterOrDigit) >= 2) return true;
        }
        return false;
    }
    public async Task<ArtworkInspection> InspectAsync(GeneratedImage image, CancellationToken cancellationToken)
    {
        var executable = Executable ?? throw Unavailable();
        if (image.Bytes.Length is 0 or > 12582912) throw Unavailable();
        var directory = Path.Combine(Path.GetTempPath(), "xinobi-ocr-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        try
        {
            using var stream = new SKMemoryStream(image.Bytes);
            using var codec = SKCodec.Create(stream);
            if (codec is null || codec.Info.Width < 1 || codec.Info.Height < 1 || (long)codec.Info.Width * codec.Info.Height > 40000000) throw Unavailable();
            var scale = Math.Min(1d, 2048d / Math.Max(codec.Info.Width, codec.Info.Height));
            var dimensions = codec.GetScaledDimensions((float)scale);
            using var bitmap = new SKBitmap(new SKImageInfo(dimensions.Width, dimensions.Height, SKColorType.Bgra8888, SKAlphaType.Premul));
            if (codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success) throw Unavailable();
            var width = bitmap.Width; var height = bitmap.Height;
            var cw = Math.Max(1, width / 3); var ch = Math.Max(1, height / 3);
            var regions = new[] { SKRect.Create(0, 0, width, height), SKRect.Create(0, 0, cw, ch),
                SKRect.Create(width-cw, 0, cw, ch), SKRect.Create(0, height-ch, cw, ch), SKRect.Create(width-cw, height-ch, cw, ch) };
            for (var index = 0; index < regions.Length; index++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var rect = regions[index]; var factor = index == 0 ? 1 : 2;
                using var crop = new SKBitmap((int)rect.Width * factor, (int)rect.Height * factor);
                using (var canvas = new SKCanvas(crop))
                {
                    canvas.Clear(SKColors.White);
                    canvas.DrawBitmap(bitmap, rect, SKRect.Create(0, 0, crop.Width, crop.Height), new SKSamplingOptions(SKFilterMode.Linear));
                }
                var path = Path.Combine(directory, index + ".png");
                using (var encoded = crop.Encode(SKEncodedImageFormat.Png, 100))
                using (var file = File.Create(path)) encoded.SaveTo(file);
                var tsv = await ReadAsync(executable, path, cancellationToken);
                if (Suspicious(tsv)) return new(true, 1);
            }
            return new(false, 0);
        }
        catch (DesignProviderException) { throw; }
        catch (Exception error) when (error is not OutOfMemoryException) { throw Unavailable(); }
        finally { try { Directory.Delete(directory, true); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }
    private static async Task<string> ReadAsync(string executable, string path, CancellationToken cancellationToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(10));
        var start = new ProcessStartInfo(executable) { UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true, CreateNoWindow = true };
        foreach (var arg in new[] { path, "stdout", "-l", "eng", "--psm", "11", "tsv" }) start.ArgumentList.Add(arg);
        using var process = Process.Start(start) ?? throw Unavailable();
        try
        {
            var stdout = ReadBounded(process.StandardOutput, timeout.Token);
            var stderr = ReadBounded(process.StandardError, timeout.Token);
            await Task.WhenAll(stdout, stderr, process.WaitForExitAsync(timeout.Token));
            if (process.ExitCode != 0) throw Unavailable();
            return await stdout;
        }
        finally { if (!process.HasExited) { process.Kill(entireProcessTree: true); await process.WaitForExitAsync(CancellationToken.None); } }
    }
    private static async Task<string> ReadBounded(StreamReader reader, CancellationToken token)
    {
        var result = new System.Text.StringBuilder(); var buffer = new char[4096]; int read;
        while ((read = await reader.ReadAsync(buffer.AsMemory(), token)) > 0)
        {
            if (result.Length + read > 1048576) throw Unavailable();
            result.Append(buffer, 0, read);
        }
        return result.ToString();
    }
    private static DesignProviderException Unavailable() => new("artwork_review_unavailable", "Yerel yazı denetimi çalışmadığı için görsel gösterilmedi. Tesseract kurulumu ve eng dil verisi kontrol edilmeli.");
}
