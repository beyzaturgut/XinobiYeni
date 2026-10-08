namespace Xinobi.Api.Features.ProductSurfaces;

public sealed record SourceMediaIdentity
{
    public string MediaVersionId { get; }
    public string Sha256 { get; }
    public int Width { get; }
    public int Height { get; }

    public SourceMediaIdentity(string mediaVersionId, string sha256, int width, int height)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(mediaVersionId);
        Sha256 = MaskMetadata.ValidateChecksum(sha256);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(width);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(height);
        MediaVersionId = mediaVersionId;
        Width = width;
        Height = height;
    }
}

public sealed record SurfaceIntent
{
    public string Key { get; }
    public string AutomaticPrompt { get; }

    public SurfaceIntent(string key, string automaticPrompt)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentException.ThrowIfNullOrWhiteSpace(automaticPrompt);
        Key = key;
        AutomaticPrompt = automaticPrompt;
    }
}

public enum PointIntent { Keep, Exclude }

// Pixel coordinates refer to the canonical source image, never the admin display.
public sealed record SourcePoint(double X, double Y, PointIntent Intent)
{
    public void ValidateFor(SourceMediaIdentity source)
    {
        ArgumentNullException.ThrowIfNull(source);
        if (!double.IsFinite(X) || X < 0 || X >= source.Width)
            throw new ArgumentOutOfRangeException(nameof(X));
        if (!double.IsFinite(Y) || Y < 0 || Y >= source.Height)
            throw new ArgumentOutOfRangeException(nameof(Y));
        if (!Enum.IsDefined(Intent)) throw new ArgumentOutOfRangeException(nameof(Intent));
    }
}

public sealed record AutomaticSegmentationRequest(SourceMediaIdentity Source, SurfaceIntent Surface);

public sealed class InteractiveSegmentationRequest
{
    public SourceMediaIdentity Source { get; }
    public SurfaceIntent Surface { get; }
    public IReadOnlyList<SourcePoint> Points { get; }

    // No previous mask/candidate is passed to inference: this is a new point-prompted result.
    public InteractiveSegmentationRequest(SourceMediaIdentity source, SurfaceIntent surface, IEnumerable<SourcePoint> points)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(surface);
        ArgumentNullException.ThrowIfNull(points);
        var snapshot = points.ToArray();
        if (snapshot.Length == 0) throw new ArgumentException("At least one source point is required.", nameof(points));
        foreach (var point in snapshot)
        {
            ArgumentNullException.ThrowIfNull(point);
            point.ValidateFor(source);
        }
        Source = source;
        Surface = surface;
        Points = Array.AsReadOnly(snapshot);
    }
}

// Metadata declares the aligned RGBA PNG contract; raster decoding belongs to a later adapter.
public sealed record MaskMetadata
{
    public string AssetReference { get; }
    public string Sha256 { get; }
    public int Width { get; }
    public int Height { get; }
    public string Format => "rgba-png";

    public MaskMetadata(string assetReference, string sha256, int width, int height)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(assetReference);
        Sha256 = ValidateChecksum(sha256);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(width);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(height);
        AssetReference = assetReference;
        Width = width;
        Height = height;
    }

    internal static string ValidateChecksum(string checksum)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(checksum);
        if (checksum.Length != 64 || checksum.Any(character => !Uri.IsHexDigit(character)))
            throw new ArgumentException("A SHA-256 hex checksum is required.", nameof(checksum));
        return checksum.ToLowerInvariant();
    }
}

// Keep the provider's named score and meaning; it is not a generic approval probability.
public sealed record ProviderScore
{
    public string Name { get; }
    public double Value { get; }
    public string? Description { get; }

    public ProviderScore(string name, double value, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        if (!double.IsFinite(value)) throw new ArgumentOutOfRangeException(nameof(value));
        Name = name;
        Value = value;
        Description = description;
    }
}

public sealed record ProviderProvenance(string Provider, string Model, string? ModelVersion = null, string? RequestId = null);
public sealed record ProviderMaskCandidate(MaskMetadata Mask, ProviderScore? Score = null);

public sealed class SegmentationResult
{
    public SourceMediaIdentity Source { get; }
    public ProviderProvenance Provenance { get; }
    public IReadOnlyList<ProviderMaskCandidate> Candidates { get; }

    public SegmentationResult(SourceMediaIdentity source, ProviderProvenance provenance, IEnumerable<ProviderMaskCandidate> candidates)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(provenance);
        ArgumentException.ThrowIfNullOrWhiteSpace(provenance.Provider);
        ArgumentException.ThrowIfNullOrWhiteSpace(provenance.Model);
        ArgumentNullException.ThrowIfNull(candidates);
        var snapshot = candidates.ToArray();
        if (snapshot.Length == 0) throw new ArgumentException("At least one candidate is required.", nameof(candidates));
        foreach (var candidate in snapshot)
        {
            ArgumentNullException.ThrowIfNull(candidate);
            ArgumentNullException.ThrowIfNull(candidate.Mask);
        }
        Source = source;
        Provenance = provenance;
        Candidates = Array.AsReadOnly(snapshot);
    }
}

public interface ISurfaceSegmentationProvider
{
    Task<SegmentationResult> GenerateAutomaticAsync(AutomaticSegmentationRequest request, CancellationToken cancellationToken);
    Task<SegmentationResult> GenerateInteractiveAsync(InteractiveSegmentationRequest request, CancellationToken cancellationToken);
}
