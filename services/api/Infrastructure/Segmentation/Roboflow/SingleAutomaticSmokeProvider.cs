using System.Diagnostics;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

// Explicit one automatic request for one immutable fixture; never used by ordinary tests.
public sealed class SingleAutomaticSmokeProvider : ISurfaceSegmentationProvider
{
    public const string SourcePath = "apps/web/public/assets/products/tea-maker-101-blue.webp";
    public const string SourceChecksum = "da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414";
    public const string Prompt = "lower kettle body";
    private readonly RoboflowSurfaceSegmentationProvider _provider;
    private readonly SourceMediaIdentity _source;
    private readonly DevelopmentMaskBuffer _masks;
    public SmokeEvidence Evidence { get; } = new();

    public SingleAutomaticSmokeProvider(SourceMediaIdentity source, byte[] bytes, DevelopmentMaskBuffer masks,
        SurfaceSegmentationOptions options, HttpMessageHandler? testTransport = null)
    {
        var actual = new AlignedImageInspector().InspectSource(bytes, DevelopmentTeaMakerMedia.MediaVersionReference);
        if (!options.SingleAutomaticSmokeEnabled || !options.ExternalInferenceEnabled || options.Provider != "roboflow" ||
            string.IsNullOrWhiteSpace(options.Roboflow.ApiKey) || source != actual ||
            source.MediaVersionId != DevelopmentTeaMakerMedia.MediaVersionReference || source.Sha256 != SourceChecksum ||
            source.Width != 1066 || source.Height != 1600 || options.Roboflow.BaseUrl != "https://serverless.roboflow.com")
            throw new SegmentationProviderException("smoke_preflight_failed", 409);
        _source = source; _masks = masks;
        var snapshot = bytes.ToArray();
        // Fresh HTTP/1.1; no redirects, cookies, negotiation or retry middleware.
        var handler = new OneRequestHandler(testTransport ?? new SocketsHttpHandler
        {
            AllowAutoRedirect = false, UseCookies = false, Credentials = null,
            AutomaticDecompression = DecompressionMethods.None, PooledConnectionLifetime = TimeSpan.Zero
        }, Evidence);
        var client = new HttpClient(handler) { Timeout = Timeout.InfiniteTimeSpan };
        _provider = new RoboflowSurfaceSegmentationProvider(client, options.Roboflow, true, identity =>
        {
            if (identity != source) throw new SegmentationProviderException("smoke_source_mismatch", 409);
            return snapshot.ToArray();
        }, masks);
        Evidence.CredentialPresent = true; Evidence.ExternalInferenceEnabled = true;
        Evidence.Provider = "roboflow"; Evidence.Source = source; Evidence.Prompt = Prompt;
    }

    public async Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken)
    {
        if (request.Source != _source || request.Surface.AutomaticPrompt != Prompt || Evidence.RequestsAttempted != 0)
            throw new SegmentationProviderException("smoke_preflight_failed", 409);
        var result = await _provider.GenerateAutomaticAsync(request, cancellationToken);
        var selected = result.Candidates.Single();
        Evidence.Selection = _masks.Evidence(selected.Mask.AssetReference);
        Evidence.NormalizedMask = selected.Mask;
        Evidence.Alpha = _masks.Alpha(selected.Mask.AssetReference);
        return result;
    }
    public Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken)
        => throw new SegmentationProviderException("interactive_inference_not_authorized", 403);

    internal sealed class OneRequestHandler(HttpMessageHandler inner, SmokeEvidence evidence, bool interactive = false) : DelegatingHandler(inner)
    {
        private int _attempts;
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            var authorizedUrl = interactive ? "https://serverless.roboflow.com/sam3/visual_segment" : "https://serverless.roboflow.com/sam3/concept_segment";
            if (request.Method != HttpMethod.Post || request.RequestUri?.AbsoluteUri != authorizedUrl)
                throw new SegmentationProviderException("smoke_request_not_authorized", 403);
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
            var root = body.RootElement;
            var image = root.GetProperty("image"); var prompts = root.GetProperty("prompts");
            if (image.GetProperty("type").GetString() != "base64" || root.GetProperty("format").GetString() != "rle" ||
                Convert.ToHexString(SHA256.HashData(Convert.FromBase64String(image.GetProperty("value").GetString()!))).ToLowerInvariant() != SourceChecksum)
                throw new SegmentationProviderException("smoke_request_not_authorized", 403);
            if (interactive)
            {
                var sets = prompts.GetProperty("prompts");
                if (sets.GetArrayLength() != 1 || root.GetProperty("multimask_output").GetBoolean())
                    throw new SegmentationProviderException("smoke_request_not_authorized", 403);
                var points = sets[0].GetProperty("points");
                if (points.GetArrayLength() != 2 || points[0].GetProperty("x").GetDouble() != 420 || points[0].GetProperty("y").GetDouble() != 920 || !points[0].GetProperty("positive").GetBoolean() ||
                    points[1].GetProperty("x").GetDouble() != 245 || points[1].GetProperty("y").GetDouble() != 730 || points[1].GetProperty("positive").GetBoolean())
                    throw new SegmentationProviderException("smoke_request_not_authorized", 403);
            }
            else if (prompts.GetArrayLength() != 1 || prompts[0].GetProperty("type").GetString() != "text" || prompts[0].GetProperty("text").GetString() != Prompt)
                throw new SegmentationProviderException("smoke_request_not_authorized", 403);
            if (Interlocked.CompareExchange(ref _attempts, 1, 0) != 0)
                throw new SegmentationProviderException("smoke_budget_exhausted", 409);
            evidence.RequestsAttempted = 1;
            request.Version = HttpVersion.Version11; request.VersionPolicy = HttpVersionPolicy.RequestVersionExact;
            request.Headers.ConnectionClose = true;
            var timer = Stopwatch.StartNew();
            try
            {
                var response = await base.SendAsync(request, token);
                evidence.HttpStatus = (int)response.StatusCode;
                try
                {
                    await response.Content.LoadIntoBufferAsync(16 * 1024 * 1024, token);
                    CaptureShape(await response.Content.ReadAsByteArrayAsync(token), evidence, interactive);
                }
                catch (JsonException) { evidence.ResponseShape = "non-json"; }
                return response; // Same captured response feeds strict parser; no second HTTP call.
            }
            finally { evidence.ElapsedMilliseconds = timer.ElapsedMilliseconds; }
        }
        private static void CaptureShape(byte[] bytes, SmokeEvidence evidence, bool interactive)
        {
            using var document = JsonDocument.Parse(bytes, new JsonDocumentOptions { MaxDepth = 32 });
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object) { evidence.ResponseShape = "unexpected-root"; return; }
            evidence.TopLevelProperties = Names(root); evidence.ResponseShape = "json-object";
            JsonElement predictions;
            if (interactive && root.TryGetProperty("predictions", out predictions)) { }
            else
            {
                if (!root.TryGetProperty("prompt_results", out var results) || results.ValueKind != JsonValueKind.Array || results.GetArrayLength() != 1) return;
                evidence.PromptResultProperties = Names(results[0]);
                if (!results[0].TryGetProperty("predictions", out predictions)) return;
            }
            if (predictions.ValueKind != JsonValueKind.Array) return;
            evidence.CandidateCount = predictions.GetArrayLength();
            if (predictions.GetArrayLength() == 0) return;
            evidence.PredictionProperties = Names(predictions[0]);
            evidence.ScoresPresent = predictions.EnumerateArray().Any(p => p.TryGetProperty("confidence", out _));
            var selected = predictions.EnumerateArray().Select((prediction, index) => new
            {
                Prediction = prediction, Index = index,
                Score = prediction.TryGetProperty("confidence", out var score) && score.TryGetDouble(out var number) && double.IsFinite(number) ? number : double.NegativeInfinity
            }).OrderByDescending(p => p.Score).ThenBy(p => p.Index).First().Prediction;
            if (selected.TryGetProperty("format", out var format) && format.ValueKind == JsonValueKind.String) evidence.MaskFormat = format.GetString();
            if (selected.TryGetProperty("masks", out var mask))
            {
                evidence.MaskValueKind = mask.ValueKind.ToString();
                if (mask.ValueKind != JsonValueKind.Object) return;
                evidence.MaskProperties = Names(mask);
                if (mask.TryGetProperty("size", out var size) && size.ValueKind == JsonValueKind.Array && size.GetArrayLength() == 2 &&
                    size[0].TryGetInt32(out var h) && size[1].TryGetInt32(out var w)) evidence.RleSize = [h, w];
                if (mask.TryGetProperty("counts", out var counts)) evidence.CountsKind = counts.ValueKind.ToString();
            }
        }
        private static string[] Names(JsonElement value) => value.ValueKind != JsonValueKind.Object ? [] : value.EnumerateObject()
            .Select(p => p.Name).Where(n => n.Length <= 64 && n.All(c => char.IsAsciiLetterOrDigit(c) || c == '_')).ToArray();
    }
}

public sealed class SmokeEvidence
{
    public int RequestsAttempted { get; internal set; }
    public bool CredentialPresent { get; internal set; }
    public bool ExternalInferenceEnabled { get; internal set; }
    public string? Provider { get; internal set; }
    public string SourcePath => SingleAutomaticSmokeProvider.SourcePath;
    public SourceMediaIdentity? Source { get; internal set; }
    public string? Prompt { get; internal set; }
    public IReadOnlyList<SourcePoint>? Points { get; internal set; }
    public int? HttpStatus { get; internal set; }
    public long? ElapsedMilliseconds { get; internal set; }
    public string? ResponseShape { get; internal set; }
    public string[]? TopLevelProperties { get; internal set; }
    public string[]? PromptResultProperties { get; internal set; }
    public string[]? PredictionProperties { get; internal set; }
    public int? CandidateCount { get; internal set; }
    public bool? ScoresPresent { get; internal set; }
    public string? MaskFormat { get; internal set; }
    public string? MaskValueKind { get; internal set; }
    public string[]? MaskProperties { get; internal set; }
    public int[]? RleSize { get; internal set; }
    public string? CountsKind { get; internal set; }
    public ProviderSelectionEvidence? Selection { get; internal set; }
    public MaskMetadata? NormalizedMask { get; internal set; }
    public MaskAlphaStatistics? Alpha { get; internal set; }
    public string CreditConsumption => "Exact credit consumption was not confirmed by the inference response.";
}
