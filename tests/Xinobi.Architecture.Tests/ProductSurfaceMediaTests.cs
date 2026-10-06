using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xunit.Abstractions;

namespace Xinobi.Architecture.Tests;

public sealed class ProductSurfaceMediaTests(ITestOutputHelper output)
{
    private readonly AlignedImageInspector _inspector = new();
    private static string RepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "XinobiYeni.slnx"))) directory = directory.Parent;
        return directory?.FullName ?? throw new InvalidOperationException("Repository fixtures not found.");
    }

    private static byte[] Png(int width, int height, params byte[] alphas)
    {
        using var bitmap = new SKBitmap(new SKImageInfo(width, height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        for (var y = 0; y < height; y++)
            for (var x = 0; x < width; x++) bitmap.SetPixel(x, y, new SKColor(120, 80, 50, alphas[(y * width + x) % alphas.Length]));
        using var data = bitmap.Encode(SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }

    private SourceMediaIdentity TinySource() => _inspector.InspectSource(Png(2, 2, 255), "dev:tiny:v1");

    [Fact]
    public void RealTeaMakerSourceAndMaskAreDecodedAndChecksummed()
    {
        var fixture = new DevelopmentTeaMakerMedia(RepositoryRoot(), _inspector);
        var source = fixture.Resolve(DevelopmentTeaMakerMedia.AssetReference, DevelopmentTeaMakerMedia.ProductReference, "blue");
        Assert.Equal(1066, source.Width);
        Assert.Equal(1600, source.Height);
        Assert.Equal("da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414", source.Sha256);
        var mask = fixture.ValidateReferenceMask(source);
        Assert.Equal(1066, mask.Metadata.Width);
        Assert.Equal(1600, mask.Metadata.Height);
        Assert.Equal("8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06", mask.Metadata.Sha256);
        Assert.Equal(mask, fixture.ValidateReferenceMask(source));
        Assert.Equal(0, mask.Alpha.Minimum);
        Assert.Equal(255, mask.Alpha.Maximum);
        Assert.True(mask.Alpha.IntermediatePixels > 0);
        Assert.Equal(1066L * 1600, mask.Alpha.TransparentPixels + mask.Alpha.OpaquePixels + mask.Alpha.IntermediatePixels);
        output.WriteLine($"Source={source.Width}x{source.Height} SHA256={source.Sha256}");
        output.WriteLine($"Mask={mask.Metadata.Width}x{mask.Metadata.Height} SHA256={mask.Metadata.Sha256} Alpha={mask.Alpha}");
    }

    [Theory]
    [InlineData(0)] [InlineData(255)] [InlineData(1)] [InlineData(254)] [InlineData(128)]
    public void EmptyFullAndNearEmptyFullMasksAreRejected(byte alpha)
    {
        var source = TinySource();
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask(Png(2, 2, alpha), "mask", source, source));
    }

    [Fact]
    public void WrongSizeAndUndecodableMasksAreRejected()
    {
        var source = TinySource();
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask(Png(3, 2, 0, 255), "mask", source, source));
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask([1, 2, 3], "mask", source, source));
        Assert.Throws<InvalidDataException>(() => _inspector.InspectSource([1, 2, 3], "source"));
        var truncated = Png(2, 2, 0, 255)[..33];
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask(truncated, "mask", source, source));
    }

    [Fact]
    public void IntermediateAlphaAndOriginalBytesArePreserved()
    {
        var source = TinySource();
        var bytes = Png(2, 2, 0, 64, 128, 255);
        var before = bytes.ToArray();
        var first = _inspector.ValidateMask(bytes, "mask", source, source);
        Assert.Equal(first, _inspector.ValidateMask(bytes, "mask", source, source));
        Assert.Equal(before, bytes);
        Assert.Equal(2, first.Alpha.IntermediatePixels);
        Assert.Equal(111.75, first.Alpha.MeanAlpha);
        Assert.Equal(1, first.Alpha.TransparentPixels);
        Assert.Equal(1, first.Alpha.OpaquePixels);
    }

    [Fact]
    public void RgbWithoutAlphaAndNearlyEmptyOrFullMixedMasksAreRejected()
    {
        var source = TinySource();
        using var rgb = new SKBitmap(new SKImageInfo(2, 2, SKColorType.Rgba8888, SKAlphaType.Opaque));
        rgb.Erase(SKColors.Blue);
        using var encoded = rgb.Encode(SKEncodedImageFormat.Png, 100);
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask(encoded.ToArray(), "mask", source, source));
        var largeSource = _inspector.InspectSource(Png(20, 20, 255), "dev:larger:v1");
        var almostEmpty = new byte[400];
        almostEmpty[0] = 255;
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask(Png(20, 20, almostEmpty), "mask", largeSource, largeSource));
        var almostFull = Enumerable.Repeat((byte)255, 400).ToArray();
        almostFull[0] = 0;
        Assert.Throws<InvalidDataException>(() => _inspector.ValidateMask(Png(20, 20, almostFull), "mask", largeSource, largeSource));
    }

    [Theory]
    [InlineData(true)] [InlineData(false)]
    public void DifferentChecksumOrVersionCannotReuseValidatedMask(bool changeChecksum)
    {
        var source = TinySource();
        var other = new SourceMediaIdentity(changeChecksum ? source.MediaVersionId : "dev:tiny:v2",
            changeChecksum ? new string('a', 64) : source.Sha256, 2, 2);
        var bytes = Png(2, 2, 0, 255);
        var mask = _inspector.ValidateMask(bytes, "mask", source, source);
        Assert.Throws<InvalidOperationException>(() => mask.ForSource(other));
        Assert.Throws<InvalidOperationException>(() => _inspector.ValidateMask(bytes, "mask", source, other));
    }

    [Theory]
    [InlineData("other-asset", "cay-makinesi-101", "blue")]
    [InlineData(DevelopmentTeaMakerMedia.AssetReference, "other-product", "blue")]
    [InlineData(DevelopmentTeaMakerMedia.AssetReference, "cay-makinesi-101", "gray")]
    public void DevelopmentAssociationCannotCrossMediaProductOrVariant(string media, string product, string variant)
    {
        var fixture = new DevelopmentTeaMakerMedia(RepositoryRoot(), _inspector);
        Assert.Throws<InvalidOperationException>(() => fixture.Resolve(media, product, variant));
    }

    [Fact]
    public async Task ValidatedMaskEntersNewPendingRevisionsWithoutReplacingApproval()
    {
        var fixture = new DevelopmentTeaMakerMedia(RepositoryRoot(), _inspector);
        var source = fixture.Identity;
        var mask = fixture.ValidateReferenceMask(source);
        var provider = new FakeSurfaceSegmentationProvider
        {
            ResultFactory = current => new SegmentationResult(current, new ProviderProvenance("fixture", "manual-reference"),
                [new ProviderMaskCandidate(mask.ForSource(current))])
        };
        var service = new SurfaceSegmentationService(provider);
        var analysis = new SurfaceAnalysis(source, new SurfaceIntent("lower-body-preview", "lower kettle body"));
        var automatic = await service.GenerateAutomaticAsync(analysis, source);
        var first = Assert.Single(automatic.Candidates);
        Assert.Equal(CandidateReviewStatus.Pending, first.ReviewStatus);
        Assert.Null(analysis.GetApprovedCandidate(source));
        analysis.Review(automatic.Id, first.Id, source, ReviewOutcome.Approve, "test-reviewer");
        var interactive = await service.GenerateInteractiveAsync(analysis, source, automatic.Id, first.Id,
            [new SourcePoint(420, 920, PointIntent.Keep), new SourcePoint(245, 730, PointIntent.Exclude)]);
        var next = Assert.Single(interactive.Candidates);
        Assert.NotEqual(first.Id, next.Id);
        Assert.Equal(CandidateReviewStatus.Pending, next.ReviewStatus);
        Assert.Same(first, analysis.GetApprovedCandidate(source));
        Assert.Equal(first.Id, interactive.PreviousCandidateId);
    }
}
