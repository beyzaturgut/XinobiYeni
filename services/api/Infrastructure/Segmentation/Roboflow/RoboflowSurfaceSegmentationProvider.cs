using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

// HttpClient must be explicitly injected. No constructor/fallback creates network transport.
public sealed class RoboflowSurfaceSegmentationProvider(HttpClient client, RoboflowSegmentationOptions options,
    bool externalInferenceEnabled, Func<SourceMediaIdentity, byte[]> resolveSource, DevelopmentMaskBuffer masks) : ISurfaceSegmentationProvider
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    public Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken)
        => SendAsync(request.Source, "/sam3/concept_segment", image => new AutomaticPayload(image, [new TextPrompt("text", request.Surface.AutomaticPrompt)]), true, cancellationToken);

    public Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken)
    {
        foreach (var point in request.Points) point.ValidateFor(request.Source);
        return SendAsync(request.Source, "/sam3/visual_segment", image => new InteractivePayload(image,
            new PointPrompts([new PointPrompt(request.Points.Select(p => new ProviderPoint(p.X, p.Y, p.Intent == PointIntent.Keep)).ToArray())])), false, cancellationToken);
    }

    private async Task<SegmentationResult> SendAsync(SourceMediaIdentity source, string path, Func<RoboflowImage, object> payload, bool automatic, CancellationToken cancellationToken)
    {
        if (!externalInferenceEnabled) throw new SegmentationProviderException("external_inference_disabled", 503);
        if (string.IsNullOrWhiteSpace(options.ApiKey) || options.TimeoutSeconds is < 1 or > 120 ||
            !Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out var baseUri) || baseUri.Scheme != "https" ||
            baseUri.Host != "serverless.roboflow.com" || !baseUri.IsDefaultPort || baseUri.UserInfo.Length != 0 || baseUri.AbsolutePath != "/" || baseUri.Query.Length != 0 || baseUri.Fragment.Length != 0)
            throw new SegmentationProviderException("provider_configuration_invalid", 503);
        cancellationToken.ThrowIfCancellationRequested();
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        deadline.CancelAfter(TimeSpan.FromSeconds(options.TimeoutSeconds));
        try
        {
            var bytes = resolveSource(source).ToArray();
            if (bytes.Length > 20 * 1024 * 1024 || new AlignedImageInspector().InspectSource(bytes, source.MediaVersionId) != source)
                throw new SegmentationProviderException("provider_source_mismatch", 409);
            using var request = new HttpRequestMessage(HttpMethod.Post, new Uri(baseUri, path));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload(new RoboflowImage("base64", Convert.ToBase64String(bytes))), Json), Encoding.UTF8, "application/json");
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, deadline.Token);
            if (!response.IsSuccessStatusCode)
                throw new SegmentationProviderException((int)response.StatusCode switch
                {
                    400 or 422 => "provider_request_rejected", 401 or 403 => "provider_authentication_failed",
                    429 => "provider_rate_limited", _ => "provider_unavailable"
                }, (int)response.StatusCode is 401 or 403 or 429 or >= 500 ? 503 : 502);
            // Bound before parsing; never deserialize/log unrestricted error bodies.
            using var stream = await response.Content.ReadAsStreamAsync(deadline.Token);
            using var body = new MemoryStream();
            var buffer = new byte[8192]; int read;
            while ((read = await stream.ReadAsync(buffer, deadline.Token)) > 0)
            {
                if (body.Length + read > 16 * 1024 * 1024) throw new SegmentationProviderException("provider_response_too_large");
                body.Write(buffer, 0, read);
            }
            using var document = JsonDocument.Parse(body.ToArray(), new JsonDocumentOptions { MaxDepth = 32 });
            var root = document.RootElement;
            // Selected contract: PCS prompt_results; PVS top-level predictions. No historic-schema guessing.
            JsonElement predictions;
            if (automatic)
            {
                var results = root.GetProperty("prompt_results");
                if (results.GetArrayLength() != 1 || results[0].GetProperty("prompt_index").GetInt32() != 0) throw new InvalidDataException();
                predictions = results[0].GetProperty("predictions");
            }
            else predictions = root.GetProperty("predictions");
            if (predictions.ValueKind != JsonValueKind.Array || predictions.GetArrayLength() is < 1 or > 100 || (!automatic && predictions.GetArrayLength() != 1)) throw new InvalidDataException();
            var normalizer = new RoboflowMaskNormalizer();
            var normalized = new List<(ValidatedAlignedMask Mask, byte[] Bytes, double? Score, int Order)>();
            int order = 0;
            foreach (var prediction in predictions.EnumerateArray())
            {
                if (prediction.GetProperty("format").GetString() != "rle") throw new InvalidDataException();
                double? score = prediction.TryGetProperty("confidence", out var value) ? value.GetDouble() : null;
                if (score is not null && !double.IsFinite(score.Value)) throw new InvalidDataException();
                var result = normalizer.Normalize(prediction.GetProperty("masks"), source, "dev:segmentation-mask:" + Guid.NewGuid());
                normalized.Add((result.Mask, result.Bytes, score, order++));
            }
            var selected = normalized.OrderByDescending(item => item.Score ?? double.NegativeInfinity).ThenBy(item => item.Order).First();
            // Source snapshot must still be exact after await; no remote claim substitutes for this check.
            if (new AlignedImageInspector().InspectSource(resolveSource(source), source.MediaVersionId) != source)
                throw new SegmentationProviderException("provider_source_mismatch", 409);
            deadline.Token.ThrowIfCancellationRequested();
            masks.Add(selected.Mask, selected.Bytes, new ProviderSelectionEvidence(selected.Order, normalized.Count, selected.Score));
            return new SegmentationResult(source, new ProviderProvenance("roboflow", "sam3"),
                [new ProviderMaskCandidate(selected.Mask.Metadata, selected.Score is null ? null : new ProviderScore("confidence", selected.Score.Value, "Provider segmentation score; not designability approval."))]);
        }
        catch (SegmentationProviderException) { throw; }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { throw new OperationCanceledException(cancellationToken); }
        catch (OperationCanceledException) { throw new SegmentationProviderException("provider_timeout", 504); }
        catch (HttpRequestException) { throw new SegmentationProviderException("provider_network_failure", 503); }
        catch (Exception error) when (error is JsonException or InvalidDataException or InvalidOperationException or KeyNotFoundException or FormatException or ArgumentException or IOException)
        { throw new SegmentationProviderException("provider_invalid_response"); }
    }
}
