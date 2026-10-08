namespace Xinobi.Api.Features.ProductSurfaces;

// In-process orchestration only: no endpoints, persistence, jobs or provider SDKs.
public sealed class SurfaceSegmentationService(ISurfaceSegmentationProvider provider)
{
    private readonly ISurfaceSegmentationProvider _provider = provider ?? throw new ArgumentNullException(nameof(provider));

    public async Task<SegmentationRevision> GenerateAutomaticAsync(
        SurfaceAnalysis analysis, SourceMediaIdentity currentSource, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(analysis);
        analysis.EnsureCurrentSource(currentSource);
        cancellationToken.ThrowIfCancellationRequested();
        var request = new AutomaticSegmentationRequest(analysis.Source, analysis.Surface);
        var revision = analysis.BeginRevision(SegmentationMode.Automatic, null, Array.Empty<SourcePoint>());
        return await ExecuteAsync(revision, () => _provider.GenerateAutomaticAsync(request, cancellationToken));
    }

    public async Task<SegmentationRevision> GenerateInteractiveAsync(
        SurfaceAnalysis analysis, SourceMediaIdentity currentSource,
        Guid previousRevisionId, Guid previousCandidateId, IEnumerable<SourcePoint> points,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(analysis);
        analysis.EnsureCurrentSource(currentSource);
        analysis.FindCandidate(previousRevisionId, previousCandidateId);
        var request = new InteractiveSegmentationRequest(analysis.Source, analysis.Surface, points);
        cancellationToken.ThrowIfCancellationRequested();
        // Lineage stays in the domain and is intentionally absent from the provider request.
        var revision = analysis.BeginRevision(SegmentationMode.Interactive, previousCandidateId, request.Points);
        return await ExecuteAsync(revision, () => _provider.GenerateInteractiveAsync(request, cancellationToken));
    }

    private static async Task<SegmentationRevision> ExecuteAsync(SegmentationRevision revision, Func<Task<SegmentationResult>> generate)
    {
        try
        {
            revision.Complete(await generate());
            return revision;
        }
        catch (OperationCanceledException)
        {
            revision.Fail("cancelled");
            throw;
        }
        catch
        {
            revision.Fail("segmentation_failed");
            throw;
        }
    }
}
