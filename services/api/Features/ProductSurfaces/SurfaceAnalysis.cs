namespace Xinobi.Api.Features.ProductSurfaces;

public enum SegmentationMode { Automatic, Interactive, Refinement, ManualCorrection }
public enum RevisionExecutionStatus { Running, Succeeded, Failed }
public enum CandidateReviewStatus { Pending, Approved, Rejected }
public enum ReviewOutcome { Approve, Reject }

public sealed record ReviewDecision(
    Guid RevisionId, Guid CandidateId, SourceMediaIdentity Source,
    ReviewOutcome Outcome, string Reviewer, DateTimeOffset ReviewedAtUtc);

public sealed class MaskCandidate
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid RevisionId { get; }
    public SourceMediaIdentity Source { get; }
    public MaskMetadata Mask { get; }
    public ProviderScore? Score { get; }
    public ReviewDecision? Decision { get; private set; }
    public CandidateReviewStatus ReviewStatus => Decision?.Outcome switch
    {
        ReviewOutcome.Approve => CandidateReviewStatus.Approved,
        ReviewOutcome.Reject => CandidateReviewStatus.Rejected,
        _ => CandidateReviewStatus.Pending
    };

    internal MaskCandidate(Guid revisionId, SourceMediaIdentity source, ProviderMaskCandidate candidate, Guid? restoredId = null)
    {
        if (restoredId == Guid.Empty) throw new ArgumentException("Candidate identity is empty.");
        Id = restoredId ?? Id;
        RevisionId = revisionId;
        Source = source;
        Mask = candidate.Mask;
        Score = candidate.Score;
    }

    internal void Review(ReviewDecision decision)
    {
        if (Decision is not null) throw new InvalidOperationException("This candidate has already been reviewed.");
        Decision = decision;
    }
}

public sealed class SegmentationRevision
{
    public Guid Id { get; } = Guid.NewGuid();
    public SourceMediaIdentity Source { get; }
    public SegmentationMode Mode { get; }
    public Guid? PreviousCandidateId { get; }
    public IReadOnlyList<SourcePoint> Points { get; }
    public RevisionExecutionStatus ExecutionStatus { get; private set; } = RevisionExecutionStatus.Running;
    public ProviderProvenance? Provenance { get; private set; }
    public MaskDerivation? Derivation { get; internal set; }
    public MaskCorrectionProvenance? Correction { get; internal set; }
    public string? FailureCode { get; private set; }
    public IReadOnlyList<MaskCandidate> Candidates { get; private set; } = Array.Empty<MaskCandidate>();

    internal SegmentationRevision(SourceMediaIdentity source, SegmentationMode mode, Guid? previousCandidateId, IReadOnlyList<SourcePoint> points, Guid? restoredId = null)
    {
        if (restoredId == Guid.Empty) throw new ArgumentException("Revision identity is empty.");
        Id = restoredId ?? Id;
        Source = source;
        Mode = mode;
        PreviousCandidateId = previousCandidateId;
        Points = Array.AsReadOnly(points.ToArray());
    }

    internal void Complete(SegmentationResult result, Guid? restoredCandidateId = null)
    {
        if (ExecutionStatus != RevisionExecutionStatus.Running) throw new InvalidOperationException("Revision is no longer running.");
        if (result.Source != Source) throw new InvalidOperationException("Provider result source identity does not match.");
        if (result.Candidates.Any(candidate => candidate.Mask.Width != Source.Width || candidate.Mask.Height != Source.Height))
            throw new InvalidOperationException("Candidate mask dimensions do not match the source.");
        if (restoredCandidateId is not null && result.Candidates.Count != 1) throw new ArgumentException("Exact restoration requires one candidate.");
        Candidates = Array.AsReadOnly(result.Candidates.Select(candidate => new MaskCandidate(Id, Source, candidate, restoredCandidateId)).ToArray());
        Provenance = result.Provenance;
        ExecutionStatus = RevisionExecutionStatus.Succeeded;
    }

    internal void Fail(string code)
    {
        ExecutionStatus = RevisionExecutionStatus.Failed;
        FailureCode = code;
    }
}

public sealed class SurfaceAnalysis
{
    private readonly List<SegmentationRevision> _revisions = [];
    public Guid Id { get; } = Guid.NewGuid();
    public SourceMediaIdentity Source { get; }
    public SurfaceIntent Surface { get; }
    public IReadOnlyList<SegmentationRevision> Revisions => _revisions.AsReadOnly();
    public ReviewDecision? ActiveApproval { get; private set; }

    public SurfaceAnalysis(SourceMediaIdentity source, SurfaceIntent surface)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(surface);
        Source = source;
        Surface = surface;
    }

    internal void EnsureCurrentSource(SourceMediaIdentity currentSource)
    {
        if (currentSource != Source) throw new InvalidOperationException("Source media identity is stale or mismatched.");
    }

    internal MaskCandidate FindCandidate(Guid revisionId, Guid candidateId)
    {
        return _revisions.SingleOrDefault(revision => revision.Id == revisionId)?.Candidates.SingleOrDefault(candidate => candidate.Id == candidateId)
            ?? throw new InvalidOperationException("The exact candidate/revision was not found in this analysis.");
    }

    internal SegmentationRevision BeginRevision(SegmentationMode mode, Guid? previousCandidateId, IReadOnlyList<SourcePoint> points)
    {
        var revision = new SegmentationRevision(Source, mode, previousCandidateId, points);
        _revisions.Add(revision);
        return revision;
    }

    // Internal identity-preserving reconstruction for a validated local development handoff.
    // No provider-specific DTOs, storage model, approval or inference is introduced here.
    internal SegmentationRevision RestorePendingAutomatic(Guid revisionId, Guid candidateId, SegmentationResult validatedResult)
        => RestorePendingRevision(revisionId, candidateId, validatedResult, SegmentationMode.Automatic, null, []);

    internal SegmentationRevision RestorePendingRevision(Guid revisionId, Guid candidateId, SegmentationResult validatedResult,
        SegmentationMode mode, Guid? previousCandidateId, IReadOnlyList<SourcePoint> points)
    {
        EnsureCurrentSource(validatedResult.Source);
        if (_revisions.Count != 0 || ActiveApproval is not null) throw new InvalidOperationException("Restoration requires an empty analysis.");
        foreach (var point in points) point.ValidateFor(Source);
        var revision = new SegmentationRevision(Source, mode, previousCandidateId, points, revisionId);
        revision.Complete(validatedResult, candidateId);
        _revisions.Add(revision);
        return revision;
    }

    internal SegmentationRevision Derive(Guid rawRevisionId, Guid rawCandidateId, SourceMediaIdentity source,
        MaskMetadata derivedMask, string algorithm, string version, int connectivity, int maxArea,
        int holesFound, int holesFilled, int pixelsFilled)
    {
        EnsureCurrentSource(source);
        var raw = FindCandidate(rawRevisionId, rawCandidateId);
        var parent = _revisions.Single(r => r.Id == rawRevisionId);
        if (parent.Mode == SegmentationMode.Refinement || derivedMask.AssetReference == raw.Mask.AssetReference)
            throw new InvalidOperationException("A refinement must derive from a raw candidate into a separate mask.");
        var revision = new SegmentationRevision(Source, SegmentationMode.Refinement, rawCandidateId, []);
        revision.Complete(new SegmentationResult(Source, parent.Provenance!, [new ProviderMaskCandidate(derivedMask)]));
        revision.Derivation = new(Source, rawRevisionId, rawCandidateId, raw.Mask.Sha256, algorithm, version,
            connectivity, maxArea, holesFound, holesFilled, pixelsFilled, derivedMask.Sha256, revision.Id, revision.Candidates[0].Id);
        _revisions.Add(revision);
        return revision;
    }

    internal SegmentationRevision Correct(Guid parentRevisionId, Guid parentCandidateId, SourceMediaIdentity source,
        MaskMetadata output, IEnumerable<MaskStroke> operations, string algorithm, string version, string reviewer)
    {
        EnsureCurrentSource(source);
        var parent = FindCandidate(parentRevisionId, parentCandidateId);
        if (output.AssetReference == parent.Mask.AssetReference) throw new InvalidOperationException("A correction needs a separate mask.");
        ArgumentException.ThrowIfNullOrWhiteSpace(reviewer);
        var snapshot = MaskCorrectionRules.Snapshot(operations, source);
        var revision = new SegmentationRevision(Source, SegmentationMode.ManualCorrection, parentCandidateId, []);
        revision.Complete(new SegmentationResult(Source, _revisions.Single(r => r.Id == parentRevisionId).Provenance!, [new ProviderMaskCandidate(output)]));
        revision.Correction = new(Source, parentRevisionId, parentCandidateId, parent.Mask.Sha256, algorithm, version,
            snapshot, output.Sha256, revision.Id, revision.Candidates[0].Id, reviewer);
        _revisions.Add(revision);
        return revision;
    }

    public ReviewDecision Review(Guid revisionId, Guid candidateId, SourceMediaIdentity currentSource, ReviewOutcome outcome, string reviewer)
    {
        EnsureCurrentSource(currentSource);
        ArgumentException.ThrowIfNullOrWhiteSpace(reviewer);
        if (!Enum.IsDefined(outcome)) throw new ArgumentOutOfRangeException(nameof(outcome));
        var candidate = FindCandidate(revisionId, candidateId);
        var decision = new ReviewDecision(revisionId, candidateId, Source, outcome, reviewer, DateTimeOffset.UtcNow);
        candidate.Review(decision);
        if (outcome == ReviewOutcome.Approve) ActiveApproval = decision;
        return decision;
    }

    // Stale approval remains in history but is never returned as usable for new media.
    public MaskCandidate? GetApprovedCandidate(SourceMediaIdentity currentSource)
    {
        if (currentSource != Source || ActiveApproval is null) return null;
        return FindCandidate(ActiveApproval.RevisionId, ActiveApproval.CandidateId);
    }
}
