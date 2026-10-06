using Xinobi.Api.Features.ProductSurfaces;

namespace Xinobi.Architecture.Tests;

// Test double only: returns metadata, never uploads media or creates raster masks.
internal sealed class FakeSurfaceSegmentationProvider : ISurfaceSegmentationProvider
{
    public List<AutomaticSegmentationRequest> AutomaticRequests { get; } = [];
    public List<InteractiveSegmentationRequest> InteractiveRequests { get; } = [];
    public Func<SourceMediaIdentity, SegmentationResult>? ResultFactory { get; set; }
    public Exception? Failure { get; set; }
    public ProviderScore? Score { get; set; }
    private int _sequence;

    public Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken)
    {
        AutomaticRequests.Add(request);
        return Generate(request.Source, cancellationToken);
    }

    public Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken)
    {
        InteractiveRequests.Add(request);
        return Generate(request.Source, cancellationToken);
    }

    private Task<SegmentationResult> Generate(SourceMediaIdentity source, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (Failure is not null) throw Failure;
        var sequence = ++_sequence;
        return Task.FromResult(ResultFactory?.Invoke(source) ?? new SegmentationResult(
            source, new ProviderProvenance("test-provider", "test-model", "fixture-v1", $"request-{sequence}"),
            [new ProviderMaskCandidate(new MaskMetadata($"test-mask-{sequence}", sequence.ToString("x64"), source.Width, source.Height), Score)]));
    }
}
