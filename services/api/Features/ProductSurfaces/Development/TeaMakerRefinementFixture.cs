using Xinobi.Api.Infrastructure.MaskProcessing;

namespace Xinobi.Api.Features.ProductSurfaces.Development;

// Explicit fixture policy. No default policy for any other product/variant/source version.
public static class TeaMakerRefinementFixture
{
    public const string MaskPath = "tests/Xinobi.Architecture.Tests/Fixtures/tea-maker-blue-interactive-raw.png";
    public const string SourceSha256 = "da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414";
    public const string RawSha256 = "7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf";
    public static readonly Guid RawRevisionId = Guid.Parse("115133d1-70a6-4377-a48d-b98556286b61");
    public static readonly Guid RawCandidateId = Guid.Parse("327d232c-4315-4ee0-aa06-b3abe2507151");
    public static EnclosedHolePolicy Policy => new(5718);
    public static IReadOnlyList<SourcePoint> Points => Array.AsReadOnly(new[] { new SourcePoint(420, 920, PointIntent.Keep), new SourcePoint(245, 730, PointIntent.Exclude) });
}
