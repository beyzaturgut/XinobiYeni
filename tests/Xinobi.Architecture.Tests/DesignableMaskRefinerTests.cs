using System.Security.Cryptography;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Features.ProductSurfaces.Development;
using Xinobi.Api.Infrastructure.MaskProcessing;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Architecture.Tests;

public sealed class DesignableMaskRefinerTests
{
    internal static string Repo()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "XinobiYeni.slnx"))) dir = dir.Parent;
        return dir!.FullName;
    }
    private static byte[] Png(string[] rows)
    {
        using var b = new SKBitmap(new SKImageInfo(rows[0].Length, rows.Length, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        b.Pixels = rows.SelectMany(row => row.Select(c => new SKColor(70, 110, 210, c == '#' ? (byte)255 : c == '+' ? (byte)127 : (byte)0))).ToArray();
        using var pixmap = b.PeekPixels()!; using var data = pixmap.Encode(SKEncodedImageFormat.Png, 100)!;
        return data.ToArray();
    }
    internal static SKColor[] Pixels(byte[] png)
    {
        using var data = SKData.CreateCopy(png); using var codec = SKCodec.Create(data)!;
        using var b = new SKBitmap(new SKImageInfo(codec.Info.Width, codec.Info.Height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        Assert.Equal(SKCodecResult.Success, codec.GetPixels(b.Info, b.GetPixels()));
        return b.Pixels;
    }
    internal static (bool[] Exterior, int Components, int[] HoleAreas, bool[] OuterBoundary) Topology(byte[] png, int w, int h)
    {
        var pixels = Pixels(png); var visited = new bool[w * h]; var exterior = new bool[w * h];
        var queue = new int[w * h]; var holes = new List<int>(); int foregroundComponents = 0;
        for (var seed = 0; seed < pixels.Length; seed++)
        {
            if (visited[seed]) continue;
            bool fg = pixels[seed].Alpha > 0, border = false; int head = 0, tail = 1;
            queue[0] = seed; visited[seed] = true;
            while (head < tail)
            {
                var at = queue[head++]; var x = at % w; var y = at / w;
                border |= x == 0 || x == w - 1 || y == 0 || y == h - 1;
                for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++)
                {
                    var xx = x + dx; var yy = y + dy;
                    if (xx < 0 || xx >= w || yy < 0 || yy >= h) continue;
                    var next = yy * w + xx;
                    if (!visited[next] && (pixels[next].Alpha > 0) == fg) { visited[next] = true; queue[tail++] = next; }
                }
            }
            if (fg) foregroundComponents++;
            else if (border) for (var j = 0; j < tail; j++) exterior[queue[j]] = true;
            else holes.Add(tail);
        }
        var boundary = new bool[w * h];
        for (var at = 0; at < pixels.Length; at++)
        {
            if (pixels[at].Alpha == 0) continue;
            var x = at % w; var y = at / w;
            if (x == 0 || y == 0 || x == w - 1 || y == h - 1) boundary[at] = true;
            for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++)
            {
                var xx = x + dx; var yy = y + dy;
                if (xx >= 0 && xx < w && yy >= 0 && yy < h && exterior[yy * w + xx]) boundary[at] = true;
            }
        }
        return (exterior, foregroundComponents, holes.Order().ToArray(), boundary);
    }
    private static MaskRefinementResult Run(byte[] bytes, int w, int h, int threshold)
    {
        var source = new SourceMediaIdentity("synthetic:source:v1", new string('a', 64), w, h);
        var raw = new AlignedImageInspector().ValidateMask(bytes, "test:raw", source, source);
        return new DesignableMaskRefiner().Refine(bytes, raw, source, new(threshold), "test:derived");
    }
    private static void AssertPreserved(byte[] raw, byte[] derived, int w, int h)
    {
        var a = Pixels(raw); var b = Pixels(derived);
        var before = Topology(raw, w, h); var after = Topology(derived, w, h);
        Assert.Equal(before.Exterior, after.Exterior);
        Assert.Equal(before.OuterBoundary, after.OuterBoundary);
        for (var i = 0; i < a.Length; i++) if (a[i].Alpha > 0 || before.Exterior[i]) Assert.Equal(a[i], b[i]);
    }
    [Theory]
    [InlineData(0, 0)] [InlineData(1, 1)] [InlineData(2, 1)]
    public void TinyEnclosedHoleInclusiveThreshold(int threshold, int expected)
    {
        var bytes = Png([".....", ".###.", ".#.#.", ".###.", "....."]); var original = bytes.ToArray();
        var result = Run(bytes, 5, 5, threshold);
        Assert.Equal(1, result.HolesFound); Assert.Equal(expected, result.HolesFilled); Assert.Equal(expected, result.PixelsFilled);
        Assert.Equal(original, bytes); AssertPreserved(bytes, result.Bytes, 5, 5);
        Assert.Equal(result.Bytes, Run(bytes, 5, 5, threshold).Bytes);
        Assert.Equal(0, result.Mask.Alpha.IntermediatePixels);
    }
    [Fact]
    public void MultipleHoles()
    {
        var bytes = Png([".........", ".###.###.", ".#.#.#.#.", ".###.###.", "........."]);
        var result = Run(bytes, 9, 5, 1);
        Assert.Equal(2, result.HolesFound); Assert.Equal(2, result.PixelsFilled); AssertPreserved(bytes, result.Bytes, 9, 5);
    }
    [Theory]
    [InlineData(2, 0)] [InlineData(3, 3)]
    public void ExactThresholdAndAboveThreshold(int threshold, int expected)
    {
        var bytes = Png([".......", ".#####.", ".#####.", ".#...#.", ".#####.", ".#####.", "......."]);
        var result = Run(bytes, 7, 7, threshold); Assert.Equal(expected, result.PixelsFilled); AssertPreserved(bytes, result.Bytes, 7, 7);
    }
    [Theory]
    [InlineData("channel")] [InlineData("diagonal")] [InlineData("handle")]
    [InlineData("concave")] [InlineData("thin")] [InlineData("noise")]
    [InlineData("bottom-spike")] [InlineData("large")]
    public void ProtectedGeometryIsUnchanged(string kind)
    {
        string[] rows = kind switch
        {
            "channel" => [".......", ".##.##.", ".##.##.", ".##.##.", ".#####.", ".#####.", "......."],
            "diagonal" => [".....", "..##.", ".#.#.", ".###.", "....."],
            "handle" => [".......", ".#####.", ".#.....", ".#.....", ".#####.", "......."],
            "concave" => [".......", ".#####.", ".###...", ".##....", ".#####.", "......."],
            "thin" => [".......", "...#...", "...#...", ".#####.", "......."],
            "noise" => [".......", ".##....", ".##....", ".....#.", "......."],
            "bottom-spike" => [".......", ".#####.", ".#####.", "...#...", "......."],
            _ => [".......", ".#####.", ".#...#.", ".#...#.", ".#...#.", ".#####.", "......."]
        };
        var bytes = Png(rows); var result = Run(bytes, rows[0].Length, rows.Length, 4);
        Assert.Equal(0, result.PixelsFilled); Assert.Equal(Pixels(bytes), Pixels(result.Bytes));
        AssertPreserved(bytes, result.Bytes, rows[0].Length, rows.Length);
    }
    [Fact]
    public void IntermediateAlphaForegroundIsPreserved()
    {
        var bytes = Png([".....", ".#+#.", ".#.#.", ".###.", "....."]);
        var result = Run(bytes, 5, 5, 1); Assert.Equal(1, result.Mask.Alpha.IntermediatePixels);
        AssertPreserved(bytes, result.Bytes, 5, 5);
    }
    [Fact]
    public void WrongSourceAndNegativePolicyRejected()
    {
        var bytes = Png([".....", ".###.", ".#.#.", ".###.", "....."]);
        Assert.Throws<ArgumentOutOfRangeException>(() => Run(bytes, 5, 5, -1));
        var source = new SourceMediaIdentity("a", new string('a', 64), 5, 5);
        var raw = new AlignedImageInspector().ValidateMask(bytes, "raw", source, source);
        Assert.Throws<InvalidOperationException>(() => new DesignableMaskRefiner().Refine(bytes, raw,
            new("b", new string('a', 64), 5, 5), new(1), "derived"));
    }
    [Fact]
    public void ExactTeaMakerRegression()
    {
        var bytes = File.ReadAllBytes(Path.Combine(Repo(), TeaMakerRefinementFixture.MaskPath)); var original = bytes.ToArray();
        Assert.Equal(TeaMakerRefinementFixture.RawSha256, Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant());
        var sourceBytes = File.ReadAllBytes(Path.Combine(Repo(), "apps/web/public/assets/products/tea-maker-101-blue.webp"));
        var inspector = new AlignedImageInspector(); var source = inspector.InspectSource(sourceBytes, DevelopmentTeaMakerMedia.MediaVersionReference);
        Assert.Equal(TeaMakerRefinementFixture.SourceSha256, source.Sha256);
        var raw = inspector.ValidateMask(bytes, "raw", source, source);
        var result = new DesignableMaskRefiner().Refine(bytes, raw, source, TeaMakerRefinementFixture.Policy, "derived");
        var before = Topology(bytes, 1066, 1600); var after = Topology(result.Bytes, 1066, 1600);
        Assert.Equal(5, before.Components); Assert.Equal(new[] { 5718 }, before.HoleAreas);
        Assert.Equal(1, result.HolesFound); Assert.Equal(1, result.HolesFilled); Assert.Equal(5718, result.PixelsFilled);
        Assert.Equal(257148, result.RawForeground); Assert.Equal(262866, result.DerivedForeground);
        Assert.Equal(1, after.Components); Assert.Empty(after.HoleAreas); Assert.Equal(original, bytes);
        Assert.Equal(1066, result.Mask.Metadata.Width); Assert.Equal(1600, result.Mask.Metadata.Height);
        Assert.Equal(0, result.Mask.Alpha.IntermediatePixels); AssertPreserved(bytes, result.Bytes, 1066, 1600);
        var repeated = new DesignableMaskRefiner().Refine(bytes, raw, source, TeaMakerRefinementFixture.Policy, "derived");
        Assert.Equal(result.Bytes, repeated.Bytes); Assert.Equal(result.Mask.Metadata.Sha256, repeated.Mask.Metadata.Sha256);
        Assert.NotEqual(raw.Metadata.Sha256, result.Mask.Metadata.Sha256);
    }
}
