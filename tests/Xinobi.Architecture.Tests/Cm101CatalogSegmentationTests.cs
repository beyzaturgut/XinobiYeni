using System.Net;
using System.Text;
using System.Text.Json;
using SkiaSharp;
using Xinobi.Api.Catalog;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class Cm101SourceFactAttribute : FactAttribute
{
    public Cm101SourceFactAttribute()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("XINOBI_CM101_TEST_SOURCE")))
            Skip = "Supply the exact local CM source via XINOBI_CM101_TEST_SOURCE; no downloads or synthetic source substitution.";
    }
}

public sealed class Cm101CatalogSegmentationTests
{
    private sealed class Catalog : ICatalogSource
    {
        public CommerceState State { get; set; } = new([
            new(Cm101CatalogSourceResolver.ProductId, "CM", "tea", true, "", "", [
                new(Cm101CatalogSourceResolver.VariantId, "101", "navy", 1, Cm101CatalogSourceResolver.ImagePath)], true)
        ], [], new([], "", ""));
        public Task<CommerceState> ReadAsync() => Task.FromResult(State);
    }
    private sealed class MockHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        public int Calls;
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        { Interlocked.Increment(ref Calls); return respond(request); }
    }
    private static readonly Cm101CandidateGates Enabled = new(true, true, true, true, "roboflow");
    private static AutomaticSegmentationRequest Request => new(Cm101CatalogSourceResolver.Source, Cm101CatalogSourceResolver.Target);
    private static string Response(int h = 5315, int w = 3543) => JsonSerializer.Serialize(new {
        prompt_results = new[] { new { prompt_index = 0, predictions = new[] {
            new { format = "rle", masks = new { size = new[] {h,w}, counts = new[] {5315*800, 5315*600, 5315*(3543-1400)} }, confidence = .9 }
        } } }
    });
    private static HttpResponseMessage Ok(string json) => new(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    [Theory]
    [InlineData(false,true,true,true,"roboflow")]
    [InlineData(true,false,true,true,"roboflow")]
    [InlineData(true,true,false,true,"roboflow")]
    [InlineData(true,true,true,false,"roboflow")]
    [InlineData(true,true,true,true,"reference")]
    public async Task DisabledGateNeverConstructsProvider(bool dev, bool review, bool enabled, bool external, string provider)
    {
        var calls = 0;
        var guarded = new Cm101AutomaticSegmentationProvider(new(new Catalog(), "unused"), new(dev,review,enabled,external,provider), () => { calls++; throw new Exception(); });
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request, default));
        Assert.Equal(0, calls);
        Assert.False(new Cm101CandidateGates().Allows);
    }
    [Fact]
    public async Task DifferentSourceTargetAndInteractiveFailWithoutProvider()
    {
        var calls = 0;
        var guarded = new Cm101AutomaticSegmentationProvider(new(new Catalog(), "unused"), Enabled, () => { calls++; throw new Exception(); });
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request with { Surface = new("upper", "upper teapot body") }, default));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request with { Source = new("wrong", new string('a',64),3543,5315) }, default));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateInteractiveAsync(new(Request.Source, Request.Surface, [new(10,10,PointIntent.Keep)]), default));
        Assert.Equal(0, calls);
    }
    [Fact]
    public async Task WrongCatalogIdentityImageAndInactiveProductFailClosed()
    {
        var catalog = new Catalog();
        var source = new Cm101CatalogSourceResolver(catalog, "unused");
        await Assert.ThrowsAsync<SegmentationProviderException>(() => source.ResolveAsync("DEMO-P101", "DEMO-V101-B"));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => source.ResolveAsync(Cm101CatalogSourceResolver.ProductId, "other"));
        foreach (var product in new[] {
            catalog.State.Products[0] with { Active = false },
            catalog.State.Products[0] with { Personalizable = false },
            catalog.State.Products[0] with { Variants = [catalog.State.Products[0].Variants[0] with { Image = "https://example.invalid/image.webp" }] },
            catalog.State.Products[0] with { Variants = [] }
        }) {
            catalog.State = catalog.State with { Products = [product] };
            await Assert.ThrowsAsync<SegmentationProviderException>(() => source.ResolveAsync(Cm101CatalogSourceResolver.ProductId, Cm101CatalogSourceResolver.VariantId));
        }
    }
    [Fact]
    public void FullResolutionRleIsAlignedAndWrongDimensionsRejected()
    {
        using var document = JsonDocument.Parse(Response());
        var rle = document.RootElement.GetProperty("prompt_results")[0].GetProperty("predictions")[0].GetProperty("masks");
        var normalized = new RoboflowMaskNormalizer().Normalize(rle, Request.Source, "test:synthetic-only");
        Assert.Equal(3543, normalized.Mask.Metadata.Width);
        Assert.Equal(5315, normalized.Mask.Metadata.Height);
        Assert.Equal(5315L * 600, normalized.Mask.Alpha.OpaquePixels);
        using var wrong = JsonDocument.Parse("{\"size\":[1600,1066],\"counts\":[1,2,3]}");
        Assert.Throws<SegmentationProviderException>(() => new RoboflowMaskNormalizer().Normalize(wrong.RootElement, Request.Source, "bad"));
    }
    [Fact]
    public void RowBufferPreservesOriginalNormalizerBytes()
    {
        var source = new SourceMediaIdentity("test", new string('a',64),4,3);
        using var rle = JsonDocument.Parse("{\"size\":[3,4],\"counts\":[2,4,6]}");
        var actual = new RoboflowMaskNormalizer().Normalize(rle.RootElement, source, "test");
        using var bitmap = new SKBitmap(new SKImageInfo(4,3,SKColorType.Rgba8888,SKAlphaType.Unpremul));
        var pixels = new SKColor[12];
        for(var x=0;x<4;x++) for(var y=0;y<3;y++) pixels[y*4+x] = new(255,255,255,(byte)(x*3+y is >=2 and <6 ? 255 : 0));
        bitmap.Pixels = pixels;
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png,100);
        Assert.Equal(data.ToArray(), actual.Bytes);
    }
    private sealed class SourceFixture : IDisposable
    {
        public string DirectoryPath { get; } = Path.Combine(Path.GetTempPath(), "cm101-mock-" + Guid.NewGuid().ToString("N"));
        public SourceFixture() { Directory.CreateDirectory(DirectoryPath); File.Copy(Environment.GetEnvironmentVariable("XINOBI_CM101_TEST_SOURCE")!, Path.Combine(DirectoryPath, Cm101CatalogSourceResolver.FileName)); }
        public void Dispose() => Directory.Delete(DirectoryPath, true);
    }
    [Cm101SourceFact]
    public async Task ExactSourcePayloadCreatesOnlyPendingCandidateAndDoesNotApprove()
    {
        using var fixture = new SourceFixture();
        var catalog = new Catalog(); var source = new Cm101CatalogSourceResolver(catalog,fixture.DirectoryPath);
        var bytes = await source.ResolveAsync(Cm101CatalogSourceResolver.ProductId,Cm101CatalogSourceResolver.VariantId);
        Assert.Equal(Request.Source, new AlignedImageInspector().InspectSource(bytes,Request.Source.MediaVersionId));
        var handler = new MockHandler(async request => {
            Assert.Equal("/sam3/concept_segment", request.RequestUri!.AbsolutePath);
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            Assert.Equal(Convert.ToBase64String(bytes),body.RootElement.GetProperty("image").GetProperty("value").GetString());
            Assert.Equal(Request.Surface.AutomaticPrompt,body.RootElement.GetProperty("prompts")[0].GetProperty("text").GetString());
            return Ok(Response());
        });
        using var client = new HttpClient(handler);
        var buffer = new DevelopmentMaskBuffer();
        var guarded = new Cm101AutomaticSegmentationProvider(source,Enabled,() => new RoboflowSurfaceSegmentationProvider(client,new() { ApiKey="FAKE-MOCK-ONLY" },true,source.ReadValidatedBytes,buffer));
        var analysis = new SurfaceAnalysis(Request.Source,Request.Surface);
        var revision = await new SurfaceSegmentationService(guarded).GenerateAutomaticAsync(analysis,Request.Source);
        Assert.Equal(CandidateReviewStatus.Pending,Assert.Single(revision.Candidates).ReviewStatus);
        Assert.Null(analysis.ActiveApproval);
        Assert.Equal(1,handler.Calls);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request,default));
        Assert.Equal(1,handler.Calls);
    }
    [Cm101SourceFact]
    public async Task InvalidResponseAndTimeoutDoNotRetryOrCreateCandidate()
    {
        using var fixture = new SourceFixture();
        var source = new Cm101CatalogSourceResolver(new Catalog(),fixture.DirectoryPath);
        foreach(var timeout in new[] { false,true }) {
            var handler = new MockHandler(_ => timeout ? throw new TaskCanceledException() : Task.FromResult(Ok(Response(1600,1066))));
            using var client = new HttpClient(handler);
            var guarded = new Cm101AutomaticSegmentationProvider(source,Enabled,() => new RoboflowSurfaceSegmentationProvider(client,new() { ApiKey="FAKE-MOCK-ONLY" },true,source.ReadValidatedBytes,new()));
            var analysis = new SurfaceAnalysis(Request.Source,Request.Surface);
            await Assert.ThrowsAsync<SegmentationProviderException>(() => new SurfaceSegmentationService(guarded).GenerateAutomaticAsync(analysis,Request.Source));
            Assert.Empty(Assert.Single(analysis.Revisions).Candidates);
            Assert.Null(analysis.ActiveApproval);
            await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request,default));
            Assert.Equal(1,handler.Calls);
        }
    }
    [Cm101SourceFact]
    public async Task ChangedBytesOrCatalogDuringRequestFailClosed()
    {
        using var fixture = new SourceFixture();
        var catalog = new Catalog(); var source = new Cm101CatalogSourceResolver(catalog,fixture.DirectoryPath);
        var handler = new MockHandler(_ => { catalog.State = catalog.State with { Products=[] }; return Task.FromResult(Ok(Response())); });
        using var client = new HttpClient(handler);
        var guarded = new Cm101AutomaticSegmentationProvider(source,Enabled,() => new RoboflowSurfaceSegmentationProvider(client,new() { ApiKey="FAKE-MOCK-ONLY" },true,source.ReadValidatedBytes,new()));
        var analysis = new SurfaceAnalysis(Request.Source,Request.Surface);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => new SurfaceSegmentationService(guarded).GenerateAutomaticAsync(analysis,Request.Source));
        Assert.Empty(Assert.Single(analysis.Revisions).Candidates);
        File.WriteAllBytes(Path.Combine(fixture.DirectoryPath,Cm101CatalogSourceResolver.FileName),[1,2,3]);
        Assert.Throws<SegmentationProviderException>(() => source.ReadValidatedBytes(Request.Source));
    }

    [Cm101SourceFact]
    public async Task ConcurrentRequestsCannotBothInvokeHttp()
    {
        using var fixture = new SourceFixture();
        var source = new Cm101CatalogSourceResolver(new Catalog(),fixture.DirectoryPath);
        var entered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var handler = new MockHandler(async _ => { entered.SetResult(); await release.Task; return Ok(Response()); });
        using var client = new HttpClient(handler);
        var guarded = new Cm101AutomaticSegmentationProvider(source,Enabled,() => new RoboflowSurfaceSegmentationProvider(client,new() { ApiKey="FAKE-MOCK-ONLY" },true,source.ReadValidatedBytes,new()));
        var first = guarded.GenerateAutomaticAsync(Request,default);
        await entered.Task;
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request,default));
        release.SetResult();
        await first;
        Assert.Equal(1,handler.Calls);
    }
    [Cm101SourceFact]
    public async Task MissingAndOversizedBytesFailBeforeProviderConstruction()
    {
        using var fixture = new SourceFixture();
        var path = Path.Combine(fixture.DirectoryPath,Cm101CatalogSourceResolver.FileName);
        var source = new Cm101CatalogSourceResolver(new Catalog(),fixture.DirectoryPath);
        var constructed=0;
        var guarded = new Cm101AutomaticSegmentationProvider(source,Enabled,() => { constructed++; throw new Exception(); });
        File.Delete(path);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request,default));
        using(var file = File.Create(path)) file.SetLength(Cm101CatalogSourceResolver.MaxEncodedBytes+1L);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => guarded.GenerateAutomaticAsync(Request,default));
        Assert.Equal(0,constructed);
    }
    [Cm101SourceFact]
    public void BrandingCheckRequiresOriginalPixelsExcludedFromMaskAndStillNeedsVisualReview()
    {
        using var fixture = new SourceFixture();
        var sourceBytes = new Cm101CatalogSourceResolver(new Catalog(),fixture.DirectoryPath).ReadValidatedBytes(Request.Source);
        using var document = JsonDocument.Parse(Response());
        var normalized = new RoboflowMaskNormalizer().Normalize(document.RootElement.GetProperty("prompt_results")[0].GetProperty("predictions")[0].GetProperty("masks"),Request.Source,"test:mock-mask");
        using var original = SKBitmap.Decode(sourceBytes);
        using var branding = new SKBitmap(new SKImageInfo(3543,5315,SKColorType.Rgba8888,SKAlphaType.Unpremul));
        branding.Erase(SKColors.Transparent);
        // Synthetic protection patch for structural tests only; this does NOT claim to cover the real logo.
        for(var x=40;x<60;x++) for(var y=40;y<60;y++) branding.SetPixel(x,y,original.GetPixel(x,y));
        var bytes = Encode(branding);
        var check = Cm101BrandingProtectionValidator.Validate(sourceBytes,normalized.Bytes,bytes);
        Assert.True(check.RequiresManualVisualReview);
        Assert.Equal(Request.Source.Sha256,check.SourceChecksum);
        branding.SetPixel(40,40,SKColors.Magenta);
        Assert.Throws<InvalidDataException>(() => Cm101BrandingProtectionValidator.Validate(sourceBytes,normalized.Bytes,Encode(branding)));
        branding.Erase(SKColors.Transparent);
        branding.SetPixel(900,40,original.GetPixel(900,40)); // Inside synthetic designable stripe.
        Assert.Throws<InvalidDataException>(() => Cm101BrandingProtectionValidator.Validate(sourceBytes,normalized.Bytes,Encode(branding)));
        using var wrong = new SKBitmap(new SKImageInfo(4,3,SKColorType.Rgba8888,SKAlphaType.Unpremul));
        wrong.Erase(SKColors.Transparent);
        Assert.Throws<InvalidDataException>(() => Cm101BrandingProtectionValidator.Validate(sourceBytes,normalized.Bytes,Encode(wrong)));
    }
    private static byte[] Encode(SKBitmap bitmap)
    {
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png,100);
        return data.ToArray();
    }
}
