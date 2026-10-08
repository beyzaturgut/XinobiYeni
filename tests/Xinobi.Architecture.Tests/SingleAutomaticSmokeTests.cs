using System.Net;
using System.Text;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;

namespace Xinobi.Architecture.Tests;

public sealed class SingleAutomaticSmokeTests
{
    private sealed class MockTransport(bool fail = false) : HttpMessageHandler
    {
        public int Calls;
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            Interlocked.Increment(ref Calls);
            Assert.Equal(HttpVersion.Version11, request.Version);
            Assert.True(request.Headers.ConnectionClose);
            return Task.FromResult(new HttpResponseMessage(fail ? HttpStatusCode.Unauthorized : HttpStatusCode.OK)
            {
                Content = new StringContent(fail ? "{\"message\":\"redacted\"}" :
                    "{\"prompt_results\":[{\"prompt_index\":0,\"predictions\":[{\"format\":\"rle\",\"confidence\":0.8,\"masks\":{\"size\":[1600,1066],\"counts\":[1000,100000,1604600]}}]}],\"time\":1}", Encoding.UTF8, "application/json")
            });
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
        Provider = "roboflow", ExternalInferenceEnabled = true, SingleAutomaticSmokeEnabled = true,
        Roboflow = new() { ApiKey = "synthetic-unit-test-not-a-real-key" }
    };
    [Fact]
    public async Task ExactlyOneMockRequestAllowedAndInteractiveNeverInvokesTransport()
    {
        var fixture = Fixture(); var transport = new MockTransport();
        var provider = new SingleAutomaticSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        Assert.Equal(0, provider.Evidence.RequestsAttempted);
        var result = await provider.GenerateAutomaticAsync(new(fixture.Source, new("body", SingleAutomaticSmokeProvider.Prompt)), default);
        Assert.Single(result.Candidates);
        Assert.Equal(1, transport.Calls);
        Assert.Equal(1, provider.Evidence.RequestsAttempted);
        Assert.Equal(200, provider.Evidence.HttpStatus);
        Assert.Equal(new[] { 1600, 1066 }, provider.Evidence.RleSize);
        Assert.NotNull(provider.Evidence.Alpha);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(new(fixture.Source, new("body", SingleAutomaticSmokeProvider.Prompt)), default));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateInteractiveAsync(new(fixture.Source, new("body", SingleAutomaticSmokeProvider.Prompt), [new SourcePoint(420, 920, PointIntent.Keep)]), default));
        Assert.Equal(1, transport.Calls);
    }
    [Fact]
    public async Task ConcurrentAutomaticAttemptsCannotBothReachMockTransport()
    {
        var fixture = Fixture(); var transport = new MockTransport();
        var provider = new SingleAutomaticSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        var request = new AutomaticSegmentationRequest(fixture.Source, new("body", SingleAutomaticSmokeProvider.Prompt));
        async Task<bool> Run()
        {
            try { await provider.GenerateAutomaticAsync(request, default); return true; }
            catch (SegmentationProviderException) { return false; }
        }
        var results = await Task.WhenAll(Run(), Run());
        Assert.Single(results, success => success);
        Assert.Equal(1, transport.Calls);
    }
    [Fact]
    public async Task FailedMockRequestConsumesBudgetWithoutRetry()
    {
        var fixture = Fixture(); var transport = new MockTransport(true);
        var provider = new SingleAutomaticSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        var request = new AutomaticSegmentationRequest(fixture.Source, new("body", SingleAutomaticSmokeProvider.Prompt));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(request, default));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(request, default));
        Assert.Equal(1, transport.Calls);
        Assert.Equal(401, provider.Evidence.HttpStatus);
    }
    [Theory]
    [InlineData("disabled")] [InlineData("external-disabled")] [InlineData("wrong-provider")] [InlineData("missing-key")] [InlineData("wrong-checksum")]
    public void InvalidPreflightNeverInvokesTransport(string problem)
    {
        var fixture = Fixture(); var transport = new MockTransport(); var options = Options();
        if (problem == "disabled") options.SingleAutomaticSmokeEnabled = false;
        if (problem == "external-disabled") options.ExternalInferenceEnabled = false;
        if (problem == "wrong-provider") options.Provider = "reference";
        if (problem == "missing-key") options.Roboflow.ApiKey = null;
        var source = problem == "wrong-checksum" ? new SourceMediaIdentity(fixture.Source.MediaVersionId, new string('a', 64), 1066, 1600) : fixture.Source;
        Assert.Throws<SegmentationProviderException>(() => new SingleAutomaticSmokeProvider(source, fixture.Bytes, new(), options, transport));
        Assert.Equal(0, transport.Calls);
    }
    [Fact]
    public async Task WrongPromptNeverInvokesTransport()
    {
        var fixture = Fixture(); var transport = new MockTransport();
        var provider = new SingleAutomaticSmokeProvider(fixture.Source, fixture.Bytes, new(), Options(), transport);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(new(fixture.Source, new("body", "different prompt")), default));
        Assert.Equal(0, transport.Calls);
    }
}
