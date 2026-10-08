namespace Xinobi.Api.Features.ProductSurfaces;

// Product/media onboarding provenance; neither DesignVersion nor PrintArea nor common AuditLog.
public sealed record MaskDerivation(SourceMediaIdentity Source, Guid RawRevisionId, Guid RawCandidateId,
    string RawMaskSha256, string Algorithm, string AlgorithmVersion, int Connectivity, int MaxEnclosedHoleAreaPixels,
    int HolesFound, int HolesFilled, int PixelsFilled, string DerivedMaskSha256, Guid DerivedRevisionId, Guid DerivedCandidateId);
