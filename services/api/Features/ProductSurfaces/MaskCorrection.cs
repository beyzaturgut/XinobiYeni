namespace Xinobi.Api.Features.ProductSurfaces;

public enum MaskStrokeOperation { Add, Remove }
public sealed record MaskStrokePoint(double X, double Y);
public sealed record MaskStroke(MaskStrokeOperation Operation, double Radius, IReadOnlyList<MaskStrokePoint> Points);

// Development limits bound CPU/payload. No printing dimensions or customer design history.
public static class MaskCorrectionRules
{
    public const int MaxOperations = 100;
    public const int MaxPointsPerStroke = 2000;
    public const int MaxTotalPoints = 5000;
    public const double MinRadius = 1;
    public const double MaxRadius = 32;

    public static IReadOnlyList<MaskStroke> Snapshot(IEnumerable<MaskStroke> operations, SourceMediaIdentity source)
    {
        ArgumentNullException.ThrowIfNull(operations);
        var strokes = operations.Take(MaxOperations + 1).ToArray();
        if (strokes.Length is 0 or > MaxOperations) throw new ArgumentException("invalid_operations");
        var total = 0;
        var result = new List<MaskStroke>();
        foreach (var stroke in strokes)
        {
            if (stroke is null || !Enum.IsDefined(stroke.Operation) || !double.IsFinite(stroke.Radius) ||
                stroke.Radius < MinRadius || stroke.Radius > MaxRadius || stroke.Points is null ||
                stroke.Points.Count is 0 or > MaxPointsPerStroke) throw new ArgumentException("invalid_stroke");
            total += stroke.Points.Count;
            if (total > MaxTotalPoints) throw new ArgumentException("point_limit");
            foreach (var p in stroke.Points)
                if (p is null || !double.IsFinite(p.X) || !double.IsFinite(p.Y) || p.X < 0 || p.Y < 0 ||
                    p.X >= source.Width || p.Y >= source.Height) throw new ArgumentException("invalid_source_point");
            result.Add(stroke with { Points = Array.AsReadOnly(stroke.Points.ToArray()) });
        }
        return result.AsReadOnly();
    }
}

public sealed record MaskCorrectionProvenance(SourceMediaIdentity Source, Guid ParentRevisionId, Guid ParentCandidateId,
    string ParentMaskSha256, string Algorithm, string AlgorithmVersion, IReadOnlyList<MaskStroke> Operations,
    string OutputMaskSha256, Guid DerivedRevisionId, Guid DerivedCandidateId, string Reviewer);
