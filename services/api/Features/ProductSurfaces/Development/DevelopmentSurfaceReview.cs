using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;
using System.Text.Json;
using Xinobi.Api.Infrastructure.MaskProcessing;

namespace Xinobi.Api.Features.ProductSurfaces.Development;

// Single-process development fixture. Restart loses candidate bytes/history; not shared Asset storage.
public sealed class DevelopmentSurfaceReview
{
    public const string Route = "/api/v1/admin/dev/product-surfaces/tea-maker-101-blue";
    public const string Reviewer = "development-local-reviewer";
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly DevelopmentTeaMakerMedia _media;
    private readonly SurfaceSegmentationService _service;
    private readonly DeferredProvider _deferred;
    private readonly SurfaceAnalysis _analysis;
    private readonly byte[] _sourceBytes;
    private readonly DevelopmentMaskBuffer _masks = new();
    private readonly string _provider;
    private readonly string _label;
    private readonly Guid _session = Guid.NewGuid();
    private SegmentationRevision? _displayed;
    private long _version = 1;
    private bool _inFlight;
    private string? _lastError;
    private readonly bool _refinementEnabled;
    private SegmentationRevision? _rawRevision;
    public SmokeEvidence? SmokeEvidence { get; private set; }

    private DevelopmentSurfaceReview(string root, SurfaceSegmentationOptions options,
        Func<SourceMediaIdentity, byte[], DevelopmentMaskBuffer, ISurfaceSegmentationProvider>? mockProvider, bool teaMakerRefinementEnabled)
    {
        var inspector = new AlignedImageInspector();
        _media = new DevelopmentTeaMakerMedia(root, inspector);
        _sourceBytes = File.ReadAllBytes(Path.Combine(root, "apps/web/public/assets/products/tea-maker-101-blue.webp"));
        var source = inspector.InspectSource(_sourceBytes, DevelopmentTeaMakerMedia.MediaVersionReference);
        if (source != _media.Identity) throw new InvalidDataException("Source changed during initialization.");
        _analysis = new SurfaceAnalysis(source, new SurfaceIntent("lower-body-preview", "lower kettle body"));
        _provider = options.Provider;
        _refinementEnabled = teaMakerRefinementEnabled;
        ISurfaceSegmentationProvider provider;
        if (_refinementEnabled)
        {
            if (_provider != "reference" || options.ExternalInferenceEnabled || options.SingleAutomaticSmokeEnabled || options.SingleInteractiveSmokeEnabled ||
                source.Sha256 != TeaMakerRefinementFixture.SourceSha256 || source.Width != 1066 || source.Height != 1600)
                throw new InvalidOperationException("Local refinement requires the exact fixture and all inference gates disabled.");
            var bytes = File.ReadAllBytes(Path.Combine(root, TeaMakerRefinementFixture.MaskPath));
            var raw = inspector.ValidateMask(bytes, "dev:tea-maker-blue:raw-interactive", source, source);
            if (raw.Metadata.Sha256 != TeaMakerRefinementFixture.RawSha256 || raw.Alpha.OpaquePixels != 257148 || raw.Alpha.IntermediatePixels != 0)
                throw new InvalidDataException("raw_fixture_mismatch");
            _masks.Add(raw, bytes);
            _rawRevision = _analysis.RestorePendingRevision(TeaMakerRefinementFixture.RawRevisionId, TeaMakerRefinementFixture.RawCandidateId,
                new SegmentationResult(source, new ProviderProvenance("roboflow", "sam3"), [new ProviderMaskCandidate(raw.Metadata,
                    new ProviderScore("confidence", 0.9453125, "Recorded Step 4B-3 provider score; not designability approval."))]),
                SegmentationMode.Interactive, Guid.Parse("a48b1d6c-a1c3-446d-92b3-50a1f690e353"), TeaMakerRefinementFixture.Points);
            _displayed = _rawRevision; _masks.Bind(_rawRevision);
            provider = new DevelopmentReferenceMaskProvider(raw);
            _label = "Yerel maske incelemesi — kayıtlı ham aday; dış inference kapalı. Tea Maker için kapalı bölge düzenlemesi açık.";
        }
        else if (_provider == "reference")
        {
            var bytes = File.ReadAllBytes(Path.Combine(root, "apps/web/public/assets/personalization/tea-maker-101-blue-designable.png"));
            var mask = inspector.ValidateMask(bytes, DevelopmentTeaMakerMedia.MaskReference, source, source);
            _masks.Add(mask, bytes);
            provider = new DevelopmentReferenceMaskProvider(mask);
            _label = "Yerel test sağlayıcısı — düzeltme noktaları kaydedilir; maske AI ile yeniden hesaplanmaz.";
        }
        else if (_provider == "roboflow")
        {
            if (mockProvider is null && options.SingleInteractiveSmokeEnabled)
            {
                var smoke = new SingleInteractiveSmokeProvider(source, _sourceBytes, _masks, options);
                provider = smoke;
                SmokeEvidence = smoke.Evidence;
                _label = "Roboflow SAM 3 — yalnız bir interactive smoke çağrısı yetkili; otomatik inference kapalı.";
            }
            else if (mockProvider is null && options.SingleAutomaticSmokeEnabled)
            {
                var smoke = new SingleAutomaticSmokeProvider(source, _sourceBytes, _masks, options);
                provider = smoke;
                SmokeEvidence = smoke.Evidence;
                _label = "Roboflow SAM 3 — yalnız bir otomatik smoke çağrısı yetkili; interactive inference kapalı.";
            }
            else
            {
            provider = mockProvider?.Invoke(source, _sourceBytes.ToArray(), _masks)
                ?? new RoboflowSurfaceSegmentationProvider(new HttpClient(new OutboundDisabledHandler()),
                    new RoboflowSegmentationOptions(), false, _ => _sourceBytes.ToArray(), _masks);
            _label = mockProvider is null
                ? "Roboflow sağlayıcısı seçili — dış inference bu adımda kapalı. Gerçek AI çağrısı yapılmaz."
                : "Mock HTTP test sağlayıcısı — gerçek AI çağrısı yapılmaz.";
            }
        }
        else throw new InvalidOperationException("Unsupported segmentation provider.");
        _deferred = new DeferredProvider(provider);
        _service = new SurfaceSegmentationService(_deferred);
        if (options.SingleInteractiveSmokeEnabled) RestoreAutomaticSnapshot(options, inspector, source);
    }

    // Local smoke handoff only: exact previous pending identities, never an inference or Asset persistence.
    private void RestoreAutomaticSnapshot(SurfaceSegmentationOptions options, AlignedImageInspector inspector, SourceMediaIdentity source)
    {
        using var document = System.Text.Json.JsonDocument.Parse(File.ReadAllText(options.AutomaticSnapshotPath!));
        var jsonOptions = new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web);
        var root = document.RootElement;
        var review = root.GetProperty("review").Deserialize<ReviewSnapshot>(jsonOptions)!;
        var evidence = root.GetProperty("evidence");
        var metadata = evidence.GetProperty("normalizedMask").Deserialize<MaskMetadata>(jsonOptions)!;
        var selected = evidence.GetProperty("selection").Deserialize<ProviderSelectionEvidence>(jsonOptions)!;
        var candidate = review.Candidate;
        if (review.Source != source || review.ProductReference != DevelopmentTeaMakerMedia.ProductReference ||
            review.VariantReference != DevelopmentTeaMakerMedia.VariantReference || review.AssetReference != DevelopmentTeaMakerMedia.AssetReference ||
            review.ActiveApproval is not null || review.RevisionCount != 1 || candidate is null || candidate.Mode != "automatic" ||
            candidate.Status != "pending" || candidate.PreviousCandidateId is not null || candidate.Points.Count != 0 ||
            candidate.RevisionId == Guid.Empty || candidate.CandidateId == Guid.Empty || metadata.Sha256 != SingleInteractiveSmokeProvider.AutomaticMaskChecksum)
            throw new InvalidDataException("automatic_snapshot_mismatch");
        var bytes = File.ReadAllBytes(options.AutomaticMaskPath!);
        var mask = inspector.ValidateMask(bytes, metadata.AssetReference, source, source);
        if (mask.Metadata != metadata) throw new InvalidDataException("automatic_mask_mismatch");
        _masks.Add(mask, bytes, selected);
        _displayed = _analysis.RestorePendingAutomatic(candidate.RevisionId, candidate.CandidateId,
            new SegmentationResult(source, new ProviderProvenance("roboflow", "sam3"), [new ProviderMaskCandidate(metadata,
                selected.Score is double score ? new ProviderScore("confidence", score, "Provider segmentation score; not designability approval.") : null)]));
        _masks.Bind(_displayed);
        _version = review.StateVersion;
    }

    // The factory is an in-process test seam, never a client-supplied provider.
    public static async Task<DevelopmentSurfaceReview> CreateAsync(string root, SurfaceSegmentationOptions? options = null,
        Func<SourceMediaIdentity, byte[], DevelopmentMaskBuffer, ISurfaceSegmentationProvider>? mockProvider = null, bool teaMakerRefinementEnabled = false)
    {
        var state = new DevelopmentSurfaceReview(root, options ?? new(), mockProvider, teaMakerRefinementEnabled);
        if (state._provider == "reference" && !state._refinementEnabled)
        {
            state._displayed = await state._service.GenerateAutomaticAsync(state._analysis, state.CurrentSource());
            state._masks.Bind(state._displayed);
        }
        return state;
    }

    private SourceMediaIdentity CurrentSource()
    {
        try { return _media.Resolve(DevelopmentTeaMakerMedia.AssetReference, DevelopmentTeaMakerMedia.ProductReference, DevelopmentTeaMakerMedia.VariantReference); }
        catch (Exception error) when (error is IOException or InvalidOperationException or InvalidDataException)
        { throw new ReviewHttpException(409, "source_changed"); }
    }

    public async Task<ReviewSnapshot> GetAsync()
    {
        await _gate.WaitAsync();
        try { CurrentSource(); return Snapshot(); }
        finally { _gate.Release(); }
    }

    public async Task<ReviewSnapshot> GenerateAsync(RevisionRequest request, CancellationToken cancellationToken = default)
    {
        Task<SegmentationRevision> execution;
        var start = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        long operationVersion;
        await _gate.WaitAsync(cancellationToken);
        try
        {
            CheckExpected(request.SessionId, request.ExpectedStateVersion);
            if (_refinementEnabled) throw new ReviewHttpException(409, "local_refinement_inference_disabled");
            var source = CurrentSource();
            if (_analysis.Revisions.Count >= 100) throw new ReviewHttpException(409, "development_revision_limit");
            SourcePoint[] points = [];
            if (request.Mode == "automatic")
            {
                if (request.Points is { Length: > 0 } || request.PreviousRevisionId is not null || request.PreviousCandidateId is not null)
                    throw new ReviewHttpException(422, "invalid_automatic_input");
            }
            else if (request.Mode == "interactive")
            {
                CheckTarget(request.PreviousRevisionId ?? Guid.Empty, request.PreviousCandidateId ?? Guid.Empty);
                if (request.Points is not { Length: > 0 and <= 100 }) throw new ReviewHttpException(422, "invalid_points");
                try
                {
                    points = request.Points.Select(point => point is null ? throw new ArgumentException() :
                        new SourcePoint(point.X, point.Y, point.Intent switch
                        { "keep" => PointIntent.Keep, "exclude" => PointIntent.Exclude, _ => throw new ArgumentException() })).ToArray();
                    foreach (var point in points) point.ValidateFor(source);
                }
                catch (ArgumentException) { throw new ReviewHttpException(422, "invalid_points"); }
            }
            else throw new ReviewHttpException(422, "invalid_mode");
            cancellationToken.ThrowIfCancellationRequested();
            _inFlight = true; _lastError = null; _version++;
            operationVersion = _version;
            _deferred.Start = start.Task;
            // BeginRevision is synchronous under the gate; only this undisplayed revision
            // is completed outside it. All conflicting mutations are blocked by _inFlight.
            execution = request.Mode == "automatic"
                ? _service.GenerateAutomaticAsync(_analysis, source, cancellationToken)
                : _service.GenerateInteractiveAsync(_analysis, source, _displayed!.Id, _displayed.Candidates[0].Id, points, cancellationToken);
        }
        finally { _gate.Release(); }
        start.SetResult(); // Provider invocation happens only after the critical section exits.
        SegmentationRevision? revision = null;
        Exception? failure = null;
        try { revision = await execution; }
        catch (Exception error) { failure = error; }
        // Always finalize even if the request was cancelled; never hold the gate across HTTP.
        await _gate.WaitAsync();
        try
        {
            try
            {
                if (failure is not null) throw failure;
                cancellationToken.ThrowIfCancellationRequested();
                if (!_inFlight || _version != operationVersion) throw new ReviewHttpException(409, "stale_review");
                if (CurrentSource() != _analysis.Source) throw new ReviewHttpException(409, "source_changed");
                _masks.Bind(revision!);
                _displayed = revision;
            }
            catch (Exception error)
            {
                var safe = error switch
                {
                    ReviewHttpException review => review,
                    SegmentationProviderException provider => new ReviewHttpException(provider.Status, provider.Message),
                    OperationCanceledException => new ReviewHttpException(408, "provider_cancelled"),
                    _ => new ReviewHttpException(502, "provider_failed")
                };
                _lastError = safe.Message;
                if (revision is not null) revision.Fail("commit_rejected");
                throw safe;
            }
            finally { _inFlight = false; _version++; }
            return Snapshot();
        }
        finally { _gate.Release(); }
    }

    public async Task<ReviewSnapshot> ReviewAsync(Guid revisionId, Guid candidateId, DecisionRequest request)
    {
        await _gate.WaitAsync();
        try
        {
            CheckExpected(request.SessionId, request.ExpectedStateVersion);
            var source = CurrentSource(); CheckTarget(revisionId, candidateId);
            var outcome = request.Outcome switch
            { "approve" => ReviewOutcome.Approve, "reject" => ReviewOutcome.Reject, _ => throw new ReviewHttpException(422, "invalid_outcome") };
            if (_displayed!.Candidates[0].ReviewStatus != CandidateReviewStatus.Pending) throw new ReviewHttpException(409, "candidate_already_reviewed");
            _analysis.Review(revisionId, candidateId, source, outcome, Reviewer);
            _version++; return Snapshot();
        }
        finally { _gate.Release(); }
    }

    public async Task<ReviewSnapshot> RefineAsync(Guid revisionId, Guid candidateId, RefinementRequest request)
    {
        await _gate.WaitAsync();
        try
        {
            CheckExpected(request.SessionId, request.ExpectedStateVersion);
            if (!_refinementEnabled || _rawRevision is null) throw new ReviewHttpException(409, "refinement_not_enabled");
            var source = CurrentSource(); CheckTarget(revisionId, candidateId);
            if (revisionId != _rawRevision.Id || candidateId != _rawRevision.Candidates[0].Id)
                throw new ReviewHttpException(409, "refinement_requires_raw_candidate");
            var rawBytes = _masks.Get(revisionId, candidateId, source);
            var inspector = new AlignedImageInspector();
            var raw = inspector.ValidateMask(rawBytes, _rawRevision.Candidates[0].Mask.AssetReference, source, source);
            var result = new DesignableMaskRefiner().Refine(rawBytes, raw, source, TeaMakerRefinementFixture.Policy, "dev:refined-mask:" + Guid.NewGuid());
            if (result.HolesFound != 1 || result.HolesFilled != 1 || result.PixelsFilled != 5718 ||
                result.RawForeground != 257148 || result.DerivedForeground != 262866 || raw.Metadata.Sha256 != TeaMakerRefinementFixture.RawSha256)
                throw new ReviewHttpException(409, "refinement_fixture_measurements_mismatch");
            if (CurrentSource() != source) throw new ReviewHttpException(409, "source_changed");
            _masks.Add(result.Mask, result.Bytes);
            var derived = _analysis.Derive(revisionId, candidateId, source, result.Mask.Metadata,
                DesignableMaskRefiner.Algorithm, DesignableMaskRefiner.Version, DesignableMaskRefiner.Connectivity,
                TeaMakerRefinementFixture.Policy.MaxEnclosedHoleAreaPixels, result.HolesFound, result.HolesFilled, result.PixelsFilled);
            _masks.Bind(derived); _displayed = derived; _version++;
            return Snapshot();
        }
        finally { _gate.Release(); }
    }
    public async Task<ReviewSnapshot> CorrectAsync(Guid revisionId, Guid candidateId, CorrectionRequest request)
    {
        await _gate.WaitAsync();
        try
        {
            CheckExpected(request.SessionId, request.ExpectedStateVersion);
            var source = CurrentSource(); CheckTarget(revisionId, candidateId);
            if (_analysis.Revisions.Count >= 100) throw new ReviewHttpException(409, "development_revision_limit");
            IReadOnlyList<MaskStroke> operations;
            try
            {
                if (request.Operations is null) throw new ArgumentException();
                operations = MaskCorrectionRules.Snapshot(request.Operations.Select(s => s is null ? throw new ArgumentException() :
                    new MaskStroke(s.Operation switch { "add" => MaskStrokeOperation.Add, "remove" => MaskStrokeOperation.Remove, _ => throw new ArgumentException() },
                        s.Radius, s.Points?.Select(p => p is null ? throw new ArgumentException() : new MaskStrokePoint(p.X, p.Y)).ToArray() ?? throw new ArgumentException())), source);
            }
            catch (ArgumentException) { throw new ReviewHttpException(422, "invalid_correction"); }
            var bytes = _masks.Get(revisionId, candidateId, source);
            var inspector = new AlignedImageInspector();
            var parent = inspector.ValidateMask(bytes, Find(revisionId, candidateId).Mask.AssetReference, source, source);
            MaskCorrectionResult result;
            try { result = new ManualMaskCorrector().Correct(bytes, parent, source, operations, "dev:corrected-mask:" + Guid.NewGuid()); }
            catch (InvalidDataException) { throw new ReviewHttpException(422, "invalid_corrected_mask"); }
            if (CurrentSource() != source) throw new ReviewHttpException(409, "source_changed");
            _masks.Add(result.Mask, result.Bytes);
            var derived = _analysis.Correct(revisionId, candidateId, source, result.Mask.Metadata, operations,
                ManualMaskCorrector.Algorithm, ManualMaskCorrector.Version, Reviewer);
            _masks.Bind(derived); _displayed = derived; _version++;
            return Snapshot();
        }
        finally { _gate.Release(); }
    }

    private void CheckExpected(Guid session, long version)
    {
        if (session != _session || version != _version || _inFlight) throw new ReviewHttpException(409, "stale_review");
    }
    private void CheckTarget(Guid revision, Guid candidate)
    {
        Find(revision, candidate);
        if (_displayed is null || revision != _displayed.Id || candidate != _displayed.Candidates[0].Id)
            throw new ReviewHttpException(409, "stale_candidate");
    }
    private MaskCandidate Find(Guid revision, Guid candidate) =>
        _analysis.Revisions.FirstOrDefault(item => item.Id == revision)?.Candidates.FirstOrDefault(item => item.Id == candidate)
        ?? throw new ReviewHttpException(404, "candidate_not_found");
    public async Task<byte[]> SourceBytesAsync()
    {
        await _gate.WaitAsync();
        try { CurrentSource(); return _sourceBytes.ToArray(); }
        finally { _gate.Release(); }
    }
    public async Task<byte[]> MaskBytesAsync(Guid revision, Guid candidate)
    {
        await _gate.WaitAsync();
        try
        {
            var source = CurrentSource(); Find(revision, candidate);
            try { return _masks.Get(revision, candidate, source); }
            catch (KeyNotFoundException) { throw new ReviewHttpException(404, "candidate_not_found"); }
        }
        finally { _gate.Release(); }
    }
    private ReviewSnapshot Snapshot()
    {
        var candidate = _displayed?.Candidates[0];
        return new ReviewSnapshot(_session, _version, _analysis.Source, DevelopmentTeaMakerMedia.ProductReference,
            DevelopmentTeaMakerMedia.VariantReference, DevelopmentTeaMakerMedia.AssetReference, Route + "/source",
            candidate is null ? null : new CandidateSnapshot(_displayed!.Id, candidate.Id, _displayed.Mode.ToString().ToLowerInvariant(),
                candidate.ReviewStatus.ToString().ToLowerInvariant(), _displayed.PreviousCandidateId,
                _displayed.Points.Select(p => new ReviewPoint(p.X, p.Y, p.Intent == PointIntent.Keep ? "keep" : "exclude")).ToArray(),
                $"{Route}/revisions/{_displayed.Id}/candidates/{candidate.Id}/mask"), _analysis.ActiveApproval, _analysis.Revisions.Count,
            _provider, _label, _inFlight, _lastError,
            _refinementEnabled && _displayed == _rawRevision,
            _rawRevision is null ? null : new CandidateSnapshot(_rawRevision.Id, _rawRevision.Candidates[0].Id, "interactive",
                _rawRevision.Candidates[0].ReviewStatus.ToString().ToLowerInvariant(), _rawRevision.PreviousCandidateId,
                _rawRevision.Points.Select(p => new ReviewPoint(p.X, p.Y, p.Intent == PointIntent.Keep ? "keep" : "exclude")).ToArray(),
                $"{Route}/revisions/{_rawRevision.Id}/candidates/{_rawRevision.Candidates[0].Id}/mask"),
            _displayed?.Derivation, _displayed?.Correction);
    }

    // BeginRevision remains under the gate; actual provider invocation waits outside it.
    // Only one operation can be in flight, so the captured start task cannot be overwritten.
    private sealed class DeferredProvider(ISurfaceSegmentationProvider inner) : ISurfaceSegmentationProvider
    {
        public Task Start { get; set; } = Task.CompletedTask;
        public async Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken token)
        { await Start.WaitAsync(token); return await inner.GenerateAutomaticAsync(request, token); }
        public async Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken token)
        { await Start.WaitAsync(token); return await inner.GenerateInteractiveAsync(request, token); }
    }
}
