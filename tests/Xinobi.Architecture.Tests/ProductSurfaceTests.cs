using Xinobi.Api.Features.ProductSurfaces;

namespace Xinobi.Architecture.Tests;

public sealed class ProductSurfaceTests
{
    private static SourceMediaIdentity TeaMaker() => new("tea-maker-blue-v1", new string('a', 64), 1066, 1600);
    private static SurfaceAnalysis Analysis() => new(TeaMaker(), new SurfaceIntent("lower-vessel-body", "lower kettle body"));
    private static SourcePoint[] Points() => [new(420, 920, PointIntent.Keep), new(245, 730, PointIntent.Exclude)];

    [Fact]
    public async Task AutomaticRequestsCreateDistinctPendingRevisions()
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var service = new SurfaceSegmentationService(provider);
        var analysis = Analysis();
        var first = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var second = await service.GenerateAutomaticAsync(analysis, TeaMaker());

        Assert.Equal(2, analysis.Revisions.Count);
        Assert.NotEqual(first.Id, second.Id);
        Assert.Equal(SegmentationMode.Automatic, first.Mode);
        Assert.Equal(RevisionExecutionStatus.Succeeded, first.ExecutionStatus);
        Assert.Null(first.PreviousCandidateId);
        Assert.Empty(first.Points);
        Assert.Equal("lower kettle body", provider.AutomaticRequests[0].Surface.AutomaticPrompt);
        Assert.Equal(TeaMaker(), provider.AutomaticRequests[0].Source);
        Assert.All(analysis.Revisions.SelectMany(revision => revision.Candidates), candidate =>
        {
            Assert.Equal(CandidateReviewStatus.Pending, candidate.ReviewStatus);
            Assert.Null(candidate.Decision);
            Assert.Null(candidate.Score);
        });
        Assert.Null(analysis.ActiveApproval);
        Assert.Null(analysis.GetApprovedCandidate(TeaMaker()));
    }

    [Fact]
    public async Task InteractiveGenerationCreatesNewCandidateAndPreservesPreviousMaskAndApproval()
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var service = new SurfaceSegmentationService(provider);
        var analysis = Analysis();
        var automatic = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var previous = Assert.Single(automatic.Candidates);
        var originalMetadata = previous.Mask;
        var approval = analysis.Review(automatic.Id, previous.Id, TeaMaker(), ReviewOutcome.Approve, "test-admin");
        var interactive = await service.GenerateInteractiveAsync(analysis, TeaMaker(), automatic.Id, previous.Id, Points());
        var candidate = Assert.Single(interactive.Candidates);

        Assert.NotEqual(automatic.Id, interactive.Id);
        Assert.NotEqual(previous.Id, candidate.Id);
        Assert.Equal(SegmentationMode.Interactive, interactive.Mode);
        Assert.Equal(previous.Id, interactive.PreviousCandidateId);
        Assert.Equal(Points(), interactive.Points);
        Assert.Equal(Points(), Assert.Single(provider.InteractiveRequests).Points);
        Assert.Same(originalMetadata, previous.Mask);
        Assert.NotEqual(previous.Mask.AssetReference, candidate.Mask.AssetReference);
        Assert.Equal(CandidateReviewStatus.Pending, candidate.ReviewStatus);
        Assert.Equal(CandidateReviewStatus.Approved, previous.ReviewStatus);
        Assert.Same(approval, previous.Decision);
        Assert.Same(previous, analysis.GetApprovedCandidate(TeaMaker()));
        Assert.Equal(RevisionExecutionStatus.Succeeded, automatic.ExecutionStatus);
        Assert.Empty(automatic.Points);
    }

    [Fact]
    public async Task OnlyExplicitApprovalReplacesActiveCandidateAndHistoryRemainsIntact()
    {
        var service = new SurfaceSegmentationService(new FakeSurfaceSegmentationProvider());
        var analysis = Analysis();
        var first = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var oldCandidate = Assert.Single(first.Candidates);
        var oldDecision = analysis.Review(first.Id, oldCandidate.Id, TeaMaker(), ReviewOutcome.Approve, "admin-1");
        var second = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var newCandidate = Assert.Single(second.Candidates);
        Assert.Same(oldCandidate, analysis.GetApprovedCandidate(TeaMaker()));

        var decision = analysis.Review(second.Id, newCandidate.Id, TeaMaker(), ReviewOutcome.Approve, "admin-2");
        Assert.Same(newCandidate, analysis.GetApprovedCandidate(TeaMaker()));
        Assert.Equal(second.Id, decision.RevisionId);
        Assert.Equal(newCandidate.Id, decision.CandidateId);
        Assert.Equal(TeaMaker(), decision.Source);
        Assert.Equal("admin-2", decision.Reviewer);
        Assert.Equal(TimeSpan.Zero, decision.ReviewedAtUtc.Offset);
        Assert.Same(oldDecision, oldCandidate.Decision);
    }

    [Fact]
    public async Task ExplicitRejectionNeverCreatesApprovalAndCannotBeSilentlyReversed()
    {
        var analysis = Analysis();
        var revision = await new SurfaceSegmentationService(new FakeSurfaceSegmentationProvider()).GenerateAutomaticAsync(analysis, TeaMaker());
        var candidate = Assert.Single(revision.Candidates);
        analysis.Review(revision.Id, candidate.Id, TeaMaker(), ReviewOutcome.Reject, "test-admin");
        Assert.Equal(CandidateReviewStatus.Rejected, candidate.ReviewStatus);
        Assert.Null(analysis.ActiveApproval);
        Assert.Null(analysis.GetApprovedCandidate(TeaMaker()));
        Assert.Throws<InvalidOperationException>(() => analysis.Review(revision.Id, candidate.Id, TeaMaker(), ReviewOutcome.Approve, "test-admin"));
    }

    [Theory]
    [InlineData(-1, 920)]
    [InlineData(420, -1)]
    [InlineData(1066, 920)]
    [InlineData(420, 1600)]
    [InlineData(2000, 2000)]
    [InlineData(double.NaN, 920)]
    [InlineData(420, double.PositiveInfinity)]
    public async Task InvalidSourcePointsAreRejectedBeforeProviderCall(double x, double y)
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var service = new SurfaceSegmentationService(provider);
        var analysis = Analysis();
        var revision = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var candidate = Assert.Single(revision.Candidates);
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => service.GenerateInteractiveAsync(
            analysis, TeaMaker(), revision.Id, candidate.Id, [new SourcePoint(x, y, PointIntent.Keep)]));
        Assert.Empty(provider.InteractiveRequests);
        Assert.Single(analysis.Revisions);
    }

    [Fact]
    public void BoundaryPointsAreValidAndPointListsAreSnapshotted()
    {
        var points = new List<SourcePoint> { new(0, 0, PointIntent.Keep), new(1065, 1599, PointIntent.Exclude) };
        var request = new InteractiveSegmentationRequest(TeaMaker(), Analysis().Surface, points);
        points.Clear();
        Assert.Equal(2, request.Points.Count);
        Assert.Throws<ArgumentException>(() => new InteractiveSegmentationRequest(TeaMaker(), Analysis().Surface, []));
        Assert.Throws<ArgumentOutOfRangeException>(() => new InteractiveSegmentationRequest(TeaMaker(), Analysis().Surface, [new(1, 1, (PointIntent)99)]));
    }

    [Theory]
    [InlineData("checksum")]
    [InlineData("version")]
    [InlineData("dimensions")]
    public async Task ChangedSourcePreventsApprovalGenerationAndUse(string change)
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var service = new SurfaceSegmentationService(provider);
        var analysis = Analysis();
        var revision = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var candidate = Assert.Single(revision.Candidates);
        var changed = change switch
        {
            "checksum" => new SourceMediaIdentity("tea-maker-blue-v1", new string('b', 64), 1066, 1600),
            "version" => new SourceMediaIdentity("tea-maker-blue-v2", new string('a', 64), 1066, 1600),
            _ => new SourceMediaIdentity("tea-maker-blue-v1", new string('a', 64), 1600, 1066)
        };
        Assert.Throws<InvalidOperationException>(() => analysis.Review(revision.Id, candidate.Id, changed, ReviewOutcome.Approve, "test-admin"));
        Assert.Equal(CandidateReviewStatus.Pending, candidate.ReviewStatus);
        var decision = analysis.Review(revision.Id, candidate.Id, TeaMaker(), ReviewOutcome.Approve, "test-admin");
        Assert.Null(analysis.GetApprovedCandidate(changed));
        Assert.Same(decision, analysis.ActiveApproval); // History is preserved, not silently re-bound.
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenerateAutomaticAsync(analysis, changed));
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenerateInteractiveAsync(analysis, changed, revision.Id, candidate.Id, Points()));
        Assert.Single(provider.AutomaticRequests);
        Assert.Empty(provider.InteractiveRequests);
    }

    [Fact]
    public async Task ExactRevisionCandidatePairIsRequiredForReviewAndLineage()
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var service = new SurfaceSegmentationService(provider);
        var analysis = Analysis();
        var first = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var second = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var candidate = Assert.Single(first.Candidates);
        Assert.Throws<InvalidOperationException>(() => analysis.Review(second.Id, candidate.Id, TeaMaker(), ReviewOutcome.Approve, "test-admin"));
        Assert.Throws<ArgumentException>(() => analysis.Review(first.Id, candidate.Id, TeaMaker(), ReviewOutcome.Approve, ""));
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenerateInteractiveAsync(analysis, TeaMaker(), second.Id, candidate.Id, Points()));
        Assert.Equal(CandidateReviewStatus.Pending, candidate.ReviewStatus);
        Assert.Empty(provider.InteractiveRequests);
    }

    [Fact]
    public async Task ProviderScoresAndProvenanceArePreservedWithoutInventingConfidence()
    {
        var score = new ProviderScore("provider_quality", 82, "Provider-reported fixture value; not an approval probability.");
        var provider = new FakeSurfaceSegmentationProvider { Score = score };
        var analysis = Analysis();
        var revision = await new SurfaceSegmentationService(provider).GenerateAutomaticAsync(analysis, TeaMaker());
        Assert.Same(score, Assert.Single(revision.Candidates).Score);
        Assert.Equal(new ProviderProvenance("test-provider", "test-model", "fixture-v1", "request-1"), revision.Provenance);
        Assert.Null(analysis.ActiveApproval);
        Assert.Throws<ArgumentOutOfRangeException>(() => new ProviderScore("quality", double.NaN));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task MismatchedProviderResultsFailWithoutPublishingCandidates(bool wrongSource)
    {
        var provider = new FakeSurfaceSegmentationProvider
        {
            ResultFactory = source => new SegmentationResult(
                wrongSource ? new SourceMediaIdentity("other-media", new string('b', 64), source.Width, source.Height) : source,
                new ProviderProvenance("test-provider", "test-model"),
                [new ProviderMaskCandidate(new MaskMetadata("test-mask", new string('c', 64), wrongSource ? source.Width : 1, source.Height))])
        };
        var analysis = Analysis();
        await Assert.ThrowsAsync<InvalidOperationException>(() => new SurfaceSegmentationService(provider).GenerateAutomaticAsync(analysis, TeaMaker()));
        var revision = Assert.Single(analysis.Revisions);
        Assert.Equal(RevisionExecutionStatus.Failed, revision.ExecutionStatus);
        Assert.Empty(revision.Candidates);
        Assert.Null(analysis.ActiveApproval);
    }

    [Fact]
    public async Task ProviderFailurePreservesPreviousCandidateAndApproval()
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var service = new SurfaceSegmentationService(provider);
        var analysis = Analysis();
        var first = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var candidate = Assert.Single(first.Candidates);
        analysis.Review(first.Id, candidate.Id, TeaMaker(), ReviewOutcome.Approve, "test-admin");
        provider.Failure = new InvalidOperationException("Test provider failure");
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenerateInteractiveAsync(analysis, TeaMaker(), first.Id, candidate.Id, Points()));
        Assert.Equal(RevisionExecutionStatus.Failed, analysis.Revisions[1].ExecutionStatus);
        Assert.Equal("segmentation_failed", analysis.Revisions[1].FailureCode);
        Assert.Empty(analysis.Revisions[1].Candidates);
        Assert.Same(candidate, analysis.GetApprovedCandidate(TeaMaker()));
    }

    [Fact]
    public async Task CancellationBeforeInferenceDoesNotCreateAnAttempt()
    {
        var provider = new FakeSurfaceSegmentationProvider();
        var analysis = Analysis();
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        await Assert.ThrowsAsync<OperationCanceledException>(() => new SurfaceSegmentationService(provider).GenerateAutomaticAsync(analysis, TeaMaker(), cancellation.Token));
        Assert.Empty(analysis.Revisions);
        Assert.Empty(provider.AutomaticRequests);
    }

    [Fact]
    public async Task ProviderCancellationRecordsFailedAttemptWithoutCandidates()
    {
        var provider = new FakeSurfaceSegmentationProvider { Failure = new OperationCanceledException() };
        var analysis = Analysis();
        await Assert.ThrowsAsync<OperationCanceledException>(() => new SurfaceSegmentationService(provider).GenerateAutomaticAsync(analysis, TeaMaker()));
        var revision = Assert.Single(analysis.Revisions);
        Assert.Equal(RevisionExecutionStatus.Failed, revision.ExecutionStatus);
        Assert.Equal("cancelled", revision.FailureCode);
        Assert.Empty(revision.Candidates);
        Assert.Null(analysis.ActiveApproval);
    }

    [Fact]
    public async Task RejectingNewCandidateDoesNotRemoveExistingApproval()
    {
        var service = new SurfaceSegmentationService(new FakeSurfaceSegmentationProvider());
        var analysis = Analysis();
        var first = await service.GenerateAutomaticAsync(analysis, TeaMaker());
        var approved = Assert.Single(first.Candidates);
        var decision = analysis.Review(first.Id, approved.Id, TeaMaker(), ReviewOutcome.Approve, "test-admin");
        var next = await service.GenerateInteractiveAsync(analysis, TeaMaker(), first.Id, approved.Id, Points());
        var rejected = Assert.Single(next.Candidates);
        analysis.Review(next.Id, rejected.Id, TeaMaker(), ReviewOutcome.Reject, "test-admin");
        Assert.Equal(CandidateReviewStatus.Rejected, rejected.ReviewStatus);
        Assert.Same(decision, analysis.ActiveApproval);
        Assert.Same(approved, analysis.GetApprovedCandidate(TeaMaker()));
    }

    [Fact]
    public void SourceIdentityNormalizesChecksumAndRejectsInvalidMetadata()
    {
        Assert.Equal(TeaMaker(), new SourceMediaIdentity("tea-maker-blue-v1", new string('A', 64), 1066, 1600));
        Assert.Throws<ArgumentException>(() => new SourceMediaIdentity("media", "not-a-checksum", 1066, 1600));
        Assert.Throws<ArgumentOutOfRangeException>(() => new SourceMediaIdentity("media", new string('a', 64), 0, 1600));
        Assert.Throws<ArgumentException>(() => new SurfaceIntent("", "lower kettle body"));
        Assert.Throws<ArgumentException>(() => new SegmentationResult(TeaMaker(), new ProviderProvenance("test", "model"), []));
    }
}
