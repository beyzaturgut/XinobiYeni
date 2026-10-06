using System.Net;
using System.Text;
using System.Text.Json;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;

namespace Xinobi.Architecture.Tests;

public sealed class SingleInteractiveSmokeTests
{
    private sealed class MockTransport(bool fail = false) : HttpMessageHandler
    {
        public int Calls;
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            Interlocked.Increment(ref Calls);
            Assert.Equal("/sam3/visual_segment", request.RequestUri!.AbsolutePath);
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
            var root = body.RootElement;
            Assert.False(root.GetProperty("multimask_output").GetBoolean());
            var prompts = root.GetProperty("prompts").GetProperty("prompts");
            Assert.Equal(1, prompts.GetArrayLength());
            var points = prompts[0].GetProperty("points");
            Assert.Equal(2, points.GetArrayLength());
            Assert.Equal(420, points[0].GetProperty("x").GetDouble());
            Assert.Equal(920, points[0].GetProperty("y").GetDouble());
            Assert.True(points[0].GetProperty("positive").GetBoolean());
            Assert.Equal(245, points[1].GetProperty("x").GetDouble());
            Assert.Equal(730, points[1].GetProperty("y").GetDouble());
            Assert.False(points[1].GetProperty("positive").GetBoolean());
            return new HttpResponseMessage(fail ? HttpStatusCode.Unauthorized : HttpStatusCode.OK)
            {
                Content = new StringContent(fail ? "{}" :
                    "{\"predictions\":[{\"format\":\"rle\",\"confidence\":0.8,\"masks\":{\"size\":[1600,1066],\"counts\":[1000,100000,1604600]}}],\"time\":1}", Encoding.UTF8, "application/json")
            };
        }
    }
    private static (SourceMediaIdentity Source, byte[] Bytes) Fixture()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "XinobiYeni.slnx"))) directory = directory.Parent;
        var bytes = File.ReadAllBytes(Path.Combine(directory!.FullName, SingleAutomaticSmokeProvider.SourcePath));
        return (new AlignedImageInspector().InspectSource(bytes, DevelopmentTeaMakerMedia.MediaVersionReference), bytes);
    }
    private static SurfaceSegmentationOptions Options() => new()
    {
        Provider = "roboflow", ExternalInferenceEnabled = true, SingleInteractiveSmokeEnabled = true,
        Roboflow = new() { ApiKey = "synthetic-test-only" }
    };
    [Theory]
    [InlineData(false)] [InlineData(true)]
    public async Task OneInteractiveAttemptConsumesBudgetEvenOnFailure(bool fail)
    {
        var fixture = Fixture(); var transport = new MockTransport(fail);
        var provider = new SingleInteractiveSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        var request = new InteractiveSegmentationRequest(fixture.Source, new("body", "lower kettle body"), SingleInteractiveSmokeProvider.AuthorizedPoints);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(new(fixture.Source, new("body", "lower kettle body")), default));
        Assert.Equal(0, transport.Calls);
        if (fail) await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateInteractiveAsync(request, default));
        else Assert.Single((await provider.GenerateInteractiveAsync(request, default)).Candidates);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateInteractiveAsync(request, default));
        Assert.Equal(1, transport.Calls);
        Assert.Equal(1, provider.Evidence.RequestsAttempted);
    }
    [Theory]
    [InlineData(421)] [InlineData(419.999)]
    public async Task ChangedCoordinatesRejectedBeforeTransport(double x)
    {
        var fixture = Fixture(); var transport = new MockTransport();
        var provider = new SingleInteractiveSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        var request = new InteractiveSegmentationRequest(fixture.Source, new("body", "lower kettle body"),
            [new(x, 920, PointIntent.Keep), new(245, 730, PointIntent.Exclude)]);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateInteractiveAsync(request, default));
        Assert.Equal(0, transport.Calls);
    }
    [Fact]
    public async Task ExtraOrReorderedPointsRejectedBeforeTransport()
    {
        var fixture = Fixture(); var transport = new MockTransport();
        var provider = new SingleInteractiveSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        foreach (var points in new[] { SingleInteractiveSmokeProvider.AuthorizedPoints.Reverse().ToArray(),
            SingleInteractiveSmokeProvider.AuthorizedPoints.Append(new SourcePoint(1, 1, PointIntent.Keep)).ToArray() })
            await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateInteractiveAsync(new(fixture.Source, new("body", "lower kettle body"), points), default));
        Assert.Equal(0, transport.Calls);
    }
    [Fact]
    public void BothSmokeModesCannotBeEnabled()
    {
        var fixture = Fixture(); var options = Options(); options.SingleAutomaticSmokeEnabled = true;
        Assert.Throws<SegmentationProviderException>(() => new SingleInteractiveSmokeProvider(fixture.Source, fixture.Bytes, new(), options, new MockTransport()));
    }
}
