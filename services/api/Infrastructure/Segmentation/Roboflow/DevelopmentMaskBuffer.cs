using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

// Development-only immutable byte snapshots. Not Asset ownership/persistence.
public sealed class DevelopmentMaskBuffer
{
    private readonly object _gate = new();
    private readonly Dictionary<string, Entry> _entries = [];
    private readonly Dictionary<(Guid Revision, Guid Candidate), string> _candidates = [];
    private sealed record Entry(ValidatedAlignedMask Mask, byte[] Bytes, ProviderSelectionEvidence? Evidence);

    public void Add(ValidatedAlignedMask mask, byte[] bytes, ProviderSelectionEvidence? evidence = null)
    {
        var snapshot = bytes.ToArray();
        var checkedMask = new AlignedImageInspector().ValidateMask(snapshot, mask.Metadata.AssetReference, mask.Source, mask.Source);
        if (checkedMask.Metadata != mask.Metadata) throw new InvalidDataException("mask_snapshot_mismatch");
        lock (_gate)
        {
            if (_entries.TryGetValue(mask.Metadata.AssetReference, out var previous) && previous.Mask != mask)
                throw new InvalidDataException("mask_reference_conflict");
            _entries[mask.Metadata.AssetReference] = new Entry(mask, snapshot, evidence);
        }
    }

    public void Bind(SegmentationRevision revision)
    {
        lock (_gate)
        {
            foreach (var candidate in revision.Candidates)
            {
                if (!_entries.TryGetValue(candidate.Mask.AssetReference, out var entry) || entry.Mask.Source != candidate.Source || entry.Mask.Metadata != candidate.Mask)
                    throw new InvalidDataException("candidate_snapshot_missing");
            }
            foreach (var candidate in revision.Candidates)
                _candidates.Add((revision.Id, candidate.Id), candidate.Mask.AssetReference);
        }
    }

    public byte[] Get(Guid revision, Guid candidate, SourceMediaIdentity source)
    {
        lock (_gate)
        {
            if (!_candidates.TryGetValue((revision, candidate), out var key)) throw new KeyNotFoundException();
            var entry = _entries[key];
            if (entry.Mask.Source != source) throw new InvalidOperationException("mask_source_mismatch");
            return entry.Bytes.ToArray();
        }
    }

    public ProviderSelectionEvidence? Evidence(string maskReference)
    {
        lock (_gate) return _entries[maskReference].Evidence;
    }

    public MaskAlphaStatistics Alpha(string maskReference)
    {
        lock (_gate) return _entries[maskReference].Mask.Alpha;
    }
}
