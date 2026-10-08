using System.Text.Json.Serialization;

namespace Xinobi.Api.Features.ProductSurfaces.Development;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record RevisionRequest(Guid SessionId, long ExpectedStateVersion, string Mode,
    Guid? PreviousRevisionId, Guid? PreviousCandidateId, ReviewPoint[]? Points);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record ReviewPoint(double X, double Y, string Intent);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record DecisionRequest(Guid SessionId, long ExpectedStateVersion, string Outcome);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record RefinementRequest(Guid SessionId, long ExpectedStateVersion);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CorrectionRequest(Guid SessionId, long ExpectedStateVersion, CorrectionStroke[]? Operations);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CorrectionStroke(string Operation, double Radius, CorrectionPoint[]? Points);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CorrectionPoint(double X, double Y);
public sealed record CandidateSnapshot(Guid RevisionId, Guid CandidateId, string Mode, string Status,
    Guid? PreviousCandidateId, IReadOnlyList<ReviewPoint> Points, string MaskUrl);
public sealed record ReviewSnapshot(Guid SessionId, long StateVersion, SourceMediaIdentity Source,
    string ProductReference, string VariantReference, string AssetReference, string SourceUrl,
    CandidateSnapshot? Candidate, ReviewDecision? ActiveApproval, int RevisionCount,
    string Provider = "reference", string ProviderLabel = "Yerel test sağlayıcısı — düzeltme noktaları kaydedilir; maske AI ile yeniden hesaplanmaz.",
    bool OperationInProgress = false, string? LastError = null, bool RefinementAvailable = false,
    CandidateSnapshot? RawCandidate = null, MaskDerivation? Derivation = null, MaskCorrectionProvenance? Correction = null);
public sealed class ReviewHttpException(int status, string code) : Exception(code)
{
    public int Status { get; } = status;
}
