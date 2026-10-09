using System.Net;
using System.Text.Json;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

public sealed record Cm101AttemptRecord(int SchemaVersion, Guid AttemptId, string ProductId, string VariantId,
    SourceMediaIdentity Source, string Target, DateTimeOffset AuthorizedAtUtc, string Consent,
    string State, bool MockTest);

// CreateNew + exclusive sharing is the claim: no check-then-write, replacement or budget refund.
public sealed class Cm101AttemptLedger(string reviewDirectory)
{
    public string Claim(Guid attemptId, bool mockTest)
    {
        if (attemptId == Guid.Empty) throw new SegmentationProviderException("cm101_attempt_id_required", 409);
        var directory = Path.Combine(reviewDirectory, "attempts");
        Directory.CreateDirectory(directory);
        var path = Path.Combine(directory, attemptId.ToString("D") + ".json");
        try
        {
            using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            var record = new Cm101AttemptRecord(1, attemptId, Cm101CatalogSourceResolver.ProductId,
                Cm101CatalogSourceResolver.VariantId, Cm101CatalogSourceResolver.Source,
                Cm101CatalogSourceResolver.Target.AutomaticPrompt, DateTimeOffset.UtcNow,
                "Explicit one-attempt opt-in; third-party image transmission and possible credit usage acknowledged.",
                "claimed-no-refund", mockTest);
            JsonSerializer.Serialize(file, record, Json);
            file.Flush(flushToDisk: true);
            return path;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        { throw new SegmentationProviderException("cm101_attempt_unavailable_or_consumed", 409); }
    }
    internal static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { WriteIndented = true };
}

public sealed class Cm101RestrictedRequestHandler(HttpMessageHandler inner) : DelegatingHandler(inner)
{
    private int attempts;
    public static SocketsHttpHandler CreateTransport() => new()
    {
        AllowAutoRedirect = false, UseCookies = false, UseProxy = false, Credentials = null,
        AutomaticDecompression = DecompressionMethods.None, PooledConnectionLifetime = TimeSpan.Zero,
        ConnectTimeout = TimeSpan.FromSeconds(15), MaxConnectionsPerServer = 1
    };
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
    {
        if (request.Method != HttpMethod.Post || request.RequestUri?.AbsoluteUri != "https://serverless.roboflow.com/sam3/concept_segment")
            throw new SegmentationProviderException("cm101_transport_not_authorized", 403);
        using var document = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
        var root = document.RootElement;
        var image = root.GetProperty("image");
        var prompts = root.GetProperty("prompts");
        if (image.GetProperty("type").GetString() != "base64" || root.GetProperty("format").GetString() != "rle" ||
            prompts.GetArrayLength() != 1 || prompts[0].GetProperty("type").GetString() != "text" ||
            prompts[0].GetProperty("text").GetString() != Cm101CatalogSourceResolver.Target.AutomaticPrompt)
            throw new SegmentationProviderException("cm101_transport_not_authorized", 403);
        var bytes = Convert.FromBase64String(image.GetProperty("value").GetString()!);
        if (bytes.Length > Cm101CatalogSourceResolver.MaxEncodedBytes ||
            new AlignedImageInspector().InspectSource(bytes, Cm101CatalogSourceResolver.Source.MediaVersionId) != Cm101CatalogSourceResolver.Source)
            throw new SegmentationProviderException("cm101_transport_source_mismatch", 409);
        if (Interlocked.CompareExchange(ref attempts, 1, 0) != 0)
            throw new SegmentationProviderException("cm101_transport_attempt_exhausted", 409);
        request.Version = HttpVersion.Version11;
        request.VersionPolicy = HttpVersionPolicy.RequestVersionExact;
        request.Headers.ConnectionClose = true;
        return await base.SendAsync(request, token); // No retries, authentication handlers or redirect middleware.
    }
}

public sealed class Cm101PendingCandidateRunner(Cm101CatalogSourceResolver source, string reviewDirectory)
{
    public async Task<string> ExecuteAsync(Guid attemptId, Cm101CandidateGates gates,
        Func<string?> loadCredential, Func<HttpMessageHandler> createTransport,
        bool mockTest = false, CancellationToken cancellationToken = default)
    {
        if (!gates.Allows) throw new SegmentationProviderException("cm101_automatic_disabled", 503);
        cancellationToken.ThrowIfCancellationRequested();
        var sourceBytes = await source.ResolveAsync(Cm101CatalogSourceResolver.ProductId, Cm101CatalogSourceResolver.VariantId);
        var output = Path.Combine(reviewDirectory, "pending", attemptId.ToString("D"));
        if (Directory.Exists(output) || File.Exists(output)) throw new SegmentationProviderException("cm101_review_output_exists", 409);
        new Cm101AttemptLedger(reviewDirectory).Claim(attemptId, mockTest);
        // From this point every outcome is consumed, including missing credential, timeout and storage failure.
        var key = loadCredential();
        if (string.IsNullOrWhiteSpace(key)) throw new SegmentationProviderException("cm101_credential_not_configured", 503);
        using var client = new HttpClient(new Cm101RestrictedRequestHandler(createTransport())) { Timeout = Timeout.InfiniteTimeSpan };
        var masks = new DevelopmentMaskBuffer();
        var adapter = new Cm101AutomaticSegmentationProvider(source, gates, () =>
            new RoboflowSurfaceSegmentationProvider(client, new() { ApiKey = key }, true, source.ReadValidatedBytes, masks));
        var analysis = new SurfaceAnalysis(Cm101CatalogSourceResolver.Source, Cm101CatalogSourceResolver.Target);
        var revision = await new SurfaceSegmentationService(adapter).GenerateAutomaticAsync(analysis, analysis.Source, cancellationToken);
        var candidate = revision.Candidates.Single();
        if (candidate.ReviewStatus != CandidateReviewStatus.Pending || analysis.ActiveApproval is not null)
            throw new SegmentationProviderException("cm101_candidate_not_pending", 409);
        var maskBytes = masks.Bytes(candidate.Mask.AssetReference);
        new AlignedImageInspector().ValidateMask(maskBytes, candidate.Mask.AssetReference, analysis.Source, analysis.Source);
        var reviewBytes = CreateReviewImage(sourceBytes, maskBytes);
        // Immutable files only in this isolated pending directory. Metadata is the final completeness marker.
        Directory.CreateDirectory(output);
        WriteNew(Path.Combine(output, "source.webp"), sourceBytes);
        WriteNew(Path.Combine(output, "candidate-mask.png"), maskBytes);
        WriteNew(Path.Combine(output, "review-overlay.png"), reviewBytes);
        WriteNew(Path.Combine(output, "candidate.json"), JsonSerializer.SerializeToUtf8Bytes(new {
            schemaVersion = 1, attemptId, productId = Cm101CatalogSourceResolver.ProductId,
            variantId = Cm101CatalogSourceResolver.VariantId, source = analysis.Source,
            target = analysis.Surface, analysisId = analysis.Id, revisionId = revision.Id,
            candidateId = candidate.Id, mask = candidate.Mask, score = candidate.Score, provenance = revision.Provenance,
            status = "pending", executionKind = mockTest ? "MOCK TEST ONLY" : "REAL ROBOFLOW OUTPUT",
            brandingProtectionValidated = false, requiredVisualReview = Cm101CatalogSourceResolver.RequiredReview,
            reviewImage = new { filename = "review-overlay.png", maximumHeight = 1600, maskIsFullResolution = true },
            createdAtUtc = DateTimeOffset.UtcNow
        }, Cm101AttemptLedger.Json));
        return output;
    }
    private static void WriteNew(string path, byte[] bytes)
    {
        using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        file.Write(bytes);
        file.Flush(flushToDisk: true);
    }
    private static byte[] CreateReviewImage(byte[] sourceBytes, byte[] maskBytes)
    {
        using var original = SKBitmap.Decode(sourceBytes);
        using var mask = SKBitmap.Decode(maskBytes);
        var scale = Math.Min(1d, 1600d / original.Height);
        var width = (int)Math.Round(original.Width * scale);
        var height = (int)Math.Round(original.Height * scale);
        using var result = new SKBitmap(new SKImageInfo(width, height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        using var canvas = new SKCanvas(result);
        canvas.Scale((float)width / original.Width, (float)height / original.Height);
        canvas.DrawBitmap(original, 0, 0, new SKSamplingOptions(SKFilterMode.Linear));
        using var tint = new SKPaint { ColorFilter = SKColorFilter.CreateBlendMode(new SKColor(0, 190, 255, 110), SKBlendMode.SrcIn) };
        canvas.DrawBitmap(mask, 0, 0, new SKSamplingOptions(SKFilterMode.Linear), tint);
        using var image = SKImage.FromBitmap(result);
        using var encoded = image.Encode(SKEncodedImageFormat.Png, 100);
        return encoded.ToArray(); // Review-only downscale; source identity and candidate mask are unchanged.
    }
}
