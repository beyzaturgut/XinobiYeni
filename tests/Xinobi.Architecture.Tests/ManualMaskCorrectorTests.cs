using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MaskProcessing;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Architecture.Tests;

public sealed class ManualMaskCorrectorTests
{
    private static readonly SourceMediaIdentity Source = new("test:v1", new string('a', 64), 40, 40);
    internal static MaskStroke Stroke(MaskStrokeOperation op, double radius, params MaskStrokePoint[] points) => new(op, radius, points);
    private static byte[] Parent(int w = 40, int h = 40)
    {
        using var b = new SKBitmap(new SKImageInfo(w, h, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        b.Pixels = Enumerable.Range(0, w * h).Select(i => new SKColor(30, 70, 120, i % w < w / 2 ? (byte)255 : (byte)0)).ToArray();
        using var pixmap = b.PeekPixels()!; using var png = pixmap.Encode(SKEncodedImageFormat.Png, 100)!; return png.ToArray();
    }
    private static MaskCorrectionResult Run(params MaskStroke[] strokes)
    {
        var bytes = Parent(); var mask = new AlignedImageInspector().ValidateMask(bytes, "parent", Source, Source);
        return new ManualMaskCorrector().Correct(bytes, mask, Source, strokes, "derived");
    }
    [Theory]
    [InlineData(MaskStrokeOperation.Add, 30, 255)]
    [InlineData(MaskStrokeOperation.Remove, 10, 0)]
    public void SinglePointCircleAndUntouchedPixels(MaskStrokeOperation op, int x, byte expected)
    {
        var result = Run(Stroke(op, 2, new MaskStrokePoint(x + .5, 20.5)));
        var pixels = DesignableMaskRefinerTests.Pixels(result.Bytes);
        Assert.Equal(expected, pixels[20 * 40 + x].Alpha);
        var parent = DesignableMaskRefinerTests.Pixels(Parent());
        for (var i = 0; i < pixels.Length; i++)
            if (Math.Pow(i % 40 + .5 - (x + .5), 2) + Math.Pow(i / 40 + .5 - 20.5, 2) > 4) Assert.Equal(parent[i], pixels[i]);
    }
    [Fact]
    public void FastContinuousStrokeHasNoGapsAndOrderedOperationsWin()
    {
        var add = Stroke(MaskStrokeOperation.Add, 1, new MaskStrokePoint(30.5, 2.5), new MaskStrokePoint(30.5, 37.5));
        var remove = Stroke(MaskStrokeOperation.Remove, 2, new MaskStrokePoint(30.5, 20.5));
        var p = DesignableMaskRefinerTests.Pixels(Run(add).Bytes);
        for (var y = 2; y <= 37; y++) Assert.Equal(255, p[y * 40 + 30].Alpha);
        Assert.Equal(0, DesignableMaskRefinerTests.Pixels(Run(add, remove).Bytes)[20 * 40 + 30].Alpha);
        Assert.Equal(255, DesignableMaskRefinerTests.Pixels(Run(remove, add).Bytes)[20 * 40 + 30].Alpha);
    }
    [Fact]
    public void MultiSegmentCornerAndEdgeClippingAreDeterministic()
    {
        var stroke = Stroke(MaskStrokeOperation.Add, 2, new MaskStrokePoint(39.9, 0), new MaskStrokePoint(30.5, 10.5), new MaskStrokePoint(30.5, 20.5));
        var bytes = Parent(); var original = bytes.ToArray();
        var mask = new AlignedImageInspector().ValidateMask(bytes, "parent", Source, Source);
        var corrector = new ManualMaskCorrector();
        var a = corrector.Correct(bytes, mask, Source, [stroke], "derived");
        var b = corrector.Correct(bytes, mask, Source, [stroke], "derived");
        Assert.Equal(original, bytes); Assert.Equal(a.Bytes, b.Bytes); Assert.Equal(a.Mask, b.Mask);
        Assert.Equal(40, a.Mask.Metadata.Width); Assert.Equal(40, a.Mask.Metadata.Height);
        Assert.Equal(0, a.Mask.Alpha.IntermediatePixels);
        Assert.Equal(255, DesignableMaskRefinerTests.Pixels(a.Bytes)[39].Alpha);
    }
    [Theory]
    [InlineData(-1, 20)] [InlineData(40, 20)] [InlineData(20, -1)] [InlineData(20, 40)]
    [InlineData(double.NaN, 20)] [InlineData(20, double.PositiveInfinity)]
    public void InvalidCoordinatesRejected(double x, double y) => Assert.Throws<ArgumentException>(() => Run(Stroke(MaskStrokeOperation.Add, 2, new MaskStrokePoint(x, y))));
    [Theory]
    [InlineData(0)] [InlineData(.5)] [InlineData(33)] [InlineData(double.NaN)] [InlineData(double.PositiveInfinity)]
    public void InvalidRadiusRejected(double radius) => Assert.Throws<ArgumentException>(() => Run(Stroke(MaskStrokeOperation.Add, radius, new MaskStrokePoint(20, 20))));
    [Fact]
    public void OperationAndPointLimitsAndUndefinedOperationRejected()
    {
        var stroke = Stroke(MaskStrokeOperation.Add, 2, new MaskStrokePoint(20, 20));
        Assert.Throws<ArgumentException>(() => MaskCorrectionRules.Snapshot([], Source));
        Assert.Throws<ArgumentException>(() => MaskCorrectionRules.Snapshot(Enumerable.Repeat(stroke, 101), Source));
        Assert.Throws<ArgumentException>(() => Run(stroke with { Operation = (MaskStrokeOperation)55 }));
        Assert.Throws<ArgumentException>(() => Run(stroke with { Points = Enumerable.Repeat(new MaskStrokePoint(20, 20), 2001).ToArray() }));
        var many = stroke with { Points = Enumerable.Repeat(new MaskStrokePoint(20, 20), 2000).ToArray() };
        Assert.Throws<ArgumentException>(() => Run(many, many, many));
    }
    [Fact]
    public void ExactSourceAndParentSnapshotRequired()
    {
        var bytes = Parent(); var inspector = new AlignedImageInspector(); var mask = inspector.ValidateMask(bytes, "parent", Source, Source);
        var other = new SourceMediaIdentity("test:v2", new string('b', 64), 40, 40);
        Assert.Throws<InvalidOperationException>(() => new ManualMaskCorrector().Correct(bytes, mask, other, [Stroke(MaskStrokeOperation.Add, 2, new MaskStrokePoint(30, 20))], "derived"));
        Assert.Throws<InvalidDataException>(() => new ManualMaskCorrector().Correct(bytes, mask with { Metadata = new("parent", new string('b', 64), 40, 40) }, Source,
            [Stroke(MaskStrokeOperation.Add, 2, new MaskStrokePoint(30, 20))], "derived"));
    }
    [Fact]
    public void WorkLimitRejectsPathologicalLongSegments()
    {
        var source = new SourceMediaIdentity("large-test", new string('a', 64), 200, 200);
        var bytes = Parent(200, 200); var mask = new AlignedImageInspector().ValidateMask(bytes, "parent", source, source);
        var points = Enumerable.Range(0, 1000).Select(i => new MaskStrokePoint(i % 2 == 0 ? 0 : 199, i % 2 == 0 ? 0 : 199)).ToArray();
        Assert.Throws<InvalidDataException>(() => new ManualMaskCorrector().Correct(bytes, mask, source, [Stroke(MaskStrokeOperation.Remove, 1, points)], "derived"));
    }
}
