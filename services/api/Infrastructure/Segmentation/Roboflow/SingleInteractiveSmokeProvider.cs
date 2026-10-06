using System.Net;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

public sealed class SingleInteractiveSmokeProvider : ISurfaceSegmentationProvider
{
    public const string AutomaticMaskChecksum = "6a7fe88baf2d0b5223476f1921650433443395e917c221fc396c6f75d7d7c3db";
    private readonly SourceMediaIdentity _source;
    private readonly RoboflowSurfaceSegmentationProvider _provider;
    private readonly DevelopmentMaskBuffer _masks;
    public SmokeEvidence Evidence { get; } = new();
    public static IReadOnlyList<SourcePoint> AuthorizedPoints => Array.AsReadOnly(new[]
    { new SourcePoint(420, 920, PointIntent.Keep), new SourcePoint(245, 730, PointIntent.Exclude) });

    public SingleInteractiveSmokeProvider(SourceMediaIdentity source, byte[] bytes, DevelopmentMaskBuffer masks,
        SurfaceSegmentationOptions options, HttpMessageHandler? testTransport = null)
    {
        if (!options.SingleInteractiveSmokeEnabled || options.SingleAutomaticSmokeEnabled || !options.ExternalInferenceEnabled || options.Provider != "roboflow" ||
            string.IsNullOrWhiteSpace(options.Roboflow.ApiKey) || options.Roboflow.BaseUrl != "https://serverless.roboflow.com" ||
            source.Width != 1066 || source.Height != 1600 || source.Sha256 != SingleAutomaticSmokeProvider.SourceChecksum ||
            source.MediaVersionId != DevelopmentTeaMakerMedia.MediaVersionReference || new AlignedImageInspector().InspectSource(bytes, source.MediaVersionId) != source)
            throw new SegmentationProviderException("interactive_smoke_preflight_failed", 409);
        foreach (var point in AuthorizedPoints) point.ValidateFor(source);
        _source = source; _masks = masks;
        var snapshot = bytes.ToArray();
        var handler = new SingleAutomaticSmokeProvider.OneRequestHandler(testTransport ?? new SocketsHttpHandler
        {
            AllowAutoRedirect = false, UseCookies = false, Credentials = null,
            AutomaticDecompression = DecompressionMethods.None, PooledConnectionLifetime = TimeSpan.Zero
        }, Evidence, interactive: true);
        _provider = new RoboflowSurfaceSegmentationProvider(new HttpClient(handler) { Timeout = Timeout.InfiniteTimeSpan }, options.Roboflow, true,
            identity => identity == source ? snapshot.ToArray() : throw new SegmentationProviderException("smoke_source_mismatch", 409), masks);
        Evidence.CredentialPresent = true; Evidence.ExternalInferenceEnabled = true; Evidence.Provider = "roboflow";
        Evidence.Source = source; Evidence.Points = AuthorizedPoints;
    }
    public Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken)
        => throw new SegmentationProviderException("automatic_inference_not_authorized", 403);

    public async Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken)
    {
        if (request.Source != _source || !request.Points.SequenceEqual(AuthorizedPoints) || Evidence.RequestsAttempted != 0)
            throw new SegmentationProviderException("interactive_smoke_preflight_failed", 409);
        var result = await _provider.GenerateInteractiveAsync(request, cancellationToken);
        var candidate = result.Candidates.Single();
        Evidence.Selection = _masks.Evidence(candidate.Mask.AssetReference);
        Evidence.NormalizedMask = candidate.Mask; Evidence.Alpha = _masks.Alpha(candidate.Mask.AssetReference);
        return result;
    }
}
