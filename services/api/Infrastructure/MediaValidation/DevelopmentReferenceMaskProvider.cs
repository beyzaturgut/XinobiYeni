using Xinobi.Api.Features.ProductSurfaces;

namespace Xinobi.Api.Infrastructure.MediaValidation;

// Runtime development fixture, never AI inference. Both modes reuse immutable reference bytes.
public sealed class DevelopmentReferenceMaskProvider(ValidatedAlignedMask mask) : ISurfaceSegmentationProvider
{
    public Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken)
        => Result(request.Source, cancellationToken);

    public Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken)
    {
        foreach (var point in request.Points) point.ValidateFor(request.Source);
        return Result(request.Source, cancellationToken);
    }

    private Task<SegmentationResult> Result(SourceMediaIdentity source, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(new SegmentationResult(source,
            new ProviderProvenance("development-reference", "manual-reference-mask", "v1"),
            [new ProviderMaskCandidate(mask.ForSource(source))]));
    }
}
