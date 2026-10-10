using System.Net;
using System.Text;
using System.Text.Json;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Features.ProductSurfaces.Development;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;

namespace Xinobi.Architecture.Tests;

public sealed class RoboflowSurfaceSegmentationProviderTests
{
    private const string FakeKey = "unit-test-only-not-a-credential";
    private static readonly SurfaceIntent Intent = new("body", "lower kettle body");
    private static readonly byte[] SourceBytes = Png(4, 3);
    private static readonly SourceMediaIdentity Source = new AlignedImageInspector().InspectSource(SourceBytes, "dev:test:v1");

    // This handler cannot fall back: every request is answered by the supplied delegate.
    private sealed class MockHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        public int Calls { get; private set; }
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        { Calls++; return respond(request, cancellationToken); }
    }
    private static byte[] Png(int width, int height)
    {
        using var bitmap = new SKBitmap(new SKImageInfo(width, height, SKColorType.Rgba8888, SKAlphaType.Unpremul));
        bitmap.Erase(SKColors.Blue);
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }
    private static HttpResponseMessage Response(string body, HttpStatusCode code = HttpStatusCode.OK) =>
        new(code) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
    private static string Prediction(object counts, int h = 3, int w = 4, double? score = .82) => JsonSerializer.Serialize(new
    {
        format = "rle", masks = new { size = new[] { h, w }, counts }, confidence = score
    }, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
    private static string Automatic(params string[] predictions) => "{\"prompt_results\":[{\"prompt_index\":0,\"predictions\":[" + string.Join(',', predictions) + "]}]}";
    private static string Interactive(params string[] predictions) => "{\"predictions\":[" + string.Join(',', predictions) + "]}";
    private static RoboflowSurfaceSegmentationProvider Provider(MockHandler handler, DevelopmentMaskBuffer? masks = null, bool enabled = true, RoboflowSegmentationOptions? options = null) =>
        new(new HttpClient(handler), options ?? new RoboflowSegmentationOptions { ApiKey = FakeKey }, enabled, _ => SourceBytes.ToArray(), masks ?? new());

    [Fact]
    public async Task AutomaticSerializesSourcePromptBearerAndSelectsHighestActualScore()
    {
        var buffer = new DevelopmentMaskBuffer();
        var handler = new MockHandler(async (request, token) =>
        {
            Assert.Equal(HttpMethod.Post, request.Method);
            Assert.Equal("/sam3/concept_segment", request.RequestUri!.AbsolutePath);
            Assert.Equal("Bearer", request.Headers.Authorization!.Scheme);
            Assert.Equal(FakeKey, request.Headers.Authorization.Parameter);
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
            Assert.Equal(Convert.ToBase64String(SourceBytes), body.RootElement.GetProperty("image").GetProperty("value").GetString());
            Assert.Equal("base64", body.RootElement.GetProperty("image").GetProperty("type").GetString());
            Assert.Equal(Intent.AutomaticPrompt, body.RootElement.GetProperty("prompts")[0].GetProperty("text").GetString());
            Assert.Equal("rle", body.RootElement.GetProperty("format").GetString());
            return Response(Automatic(Prediction(new[] { 1, 2, 9 }, score: .5), Prediction(new[] { 2, 4, 6 }, score: .9), Prediction(new[] { 3, 1, 8 }, score: .9)));
        });
        var result = await Provider(handler, buffer).GenerateAutomaticAsync(new(Source, Intent), default);
        var candidate = Assert.Single(result.Candidates);
        Assert.Equal(.9, candidate.Score!.Value);
        Assert.Equal(new ProviderSelectionEvidence(1, 3, .9), buffer.Evidence(candidate.Mask.AssetReference));
        Assert.Equal(Source, result.Source);
        Assert.Equal(1, handler.Calls);
    }

    [Fact]
    public async Task MissingScoreUsesStableProviderOrderWithoutInventingConfidence()
    {
        var buffer = new DevelopmentMaskBuffer();
        var handler = new MockHandler((_, _) => Task.FromResult(Response(Automatic(Prediction(new[] { 1, 2, 9 }, score: null), Prediction(new[] { 2, 2, 8 }, score: null)))));
        var result = await Provider(handler, buffer).GenerateAutomaticAsync(new(Source, Intent), default);
        var candidate = Assert.Single(result.Candidates);
        Assert.Null(candidate.Score);
        Assert.Equal(new ProviderSelectionEvidence(0, 2, null), buffer.Evidence(candidate.Mask.AssetReference));
    }

    [Fact]
    public async Task InteractivePreservesDecimalPointOrderAndStartsNewPointPrompt()
    {
        var handler = new MockHandler(async (request, token) =>
        {
            Assert.Equal("/sam3/visual_segment", request.RequestUri!.AbsolutePath);
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
            var root = body.RootElement;
            var points = root.GetProperty("prompts").GetProperty("prompts")[0].GetProperty("points");
            Assert.Equal(1.25, points[0].GetProperty("x").GetDouble());
            Assert.Equal(2.125, points[0].GetProperty("y").GetDouble());
            Assert.True(points[0].GetProperty("positive").GetBoolean());
            Assert.False(points[1].GetProperty("positive").GetBoolean());
            Assert.Equal(.5, points[1].GetProperty("x").GetDouble());
            Assert.False(root.GetProperty("multimask_output").GetBoolean());
            Assert.False(root.TryGetProperty("previousCandidate", out _));
            Assert.Equal(Convert.ToBase64String(SourceBytes), root.GetProperty("image").GetProperty("value").GetString());
            return Response(Interactive(Prediction(new[] { 2, 3, 7 })));
        });
        await Provider(handler).GenerateInteractiveAsync(new(Source, Intent,
            [new SourcePoint(1.25, 2.125, PointIntent.Keep), new SourcePoint(.5, 1.5, PointIntent.Exclude)]), default);
        Assert.Equal(1, handler.Calls);
    }

    [Theory]
    [InlineData(400, "provider_request_rejected")] [InlineData(422, "provider_request_rejected")]
    [InlineData(401, "provider_authentication_failed")] [InlineData(403, "provider_authentication_failed")]
    [InlineData(429, "provider_rate_limited")] [InlineData(500, "provider_unavailable")] [InlineData(503, "provider_unavailable")]
    public async Task HttpFailureNeverLeaksRawResponseOrRetries(int status, string code)
    {
        var handler = new MockHandler((_, _) => Task.FromResult(Response(FakeKey + Convert.ToBase64String(SourceBytes), (HttpStatusCode)status)));
        var error = await Assert.ThrowsAsync<SegmentationProviderException>(() => Provider(handler).GenerateAutomaticAsync(new(Source, Intent), default));
        Assert.Equal(code, error.Message);
        Assert.Null(error.InnerException);
        Assert.DoesNotContain(FakeKey, error.ToString());
        Assert.DoesNotContain(Convert.ToBase64String(SourceBytes), error.ToString());
        Assert.Equal(1, handler.Calls);
    }

    [Theory]
    [InlineData("not json")] [InlineData("{}")]
    [InlineData("{\"predictions\":[]}")]
    [InlineData("{\"prompt_results\":[{\"prompt_index\":0,\"predictions\":[]}]}")]
    public async Task UnexpectedAutomaticResponseFailsClosed(string body)
    {
        var handler = new MockHandler((_, _) => Task.FromResult(Response(body)));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => Provider(handler).GenerateAutomaticAsync(new(Source, Intent), default));
    }

    [Fact]
    public async Task NestedPvsHistoricalSchemaIsNotSilentlyAccepted()
    {
        var handler = new MockHandler((_, _) => Task.FromResult(Response(Automatic(Prediction(new[] { 1, 2, 9 })))));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => Provider(handler).GenerateInteractiveAsync(new(Source, Intent, [new SourcePoint(1, 1, PointIntent.Keep)]), default));
    }

    [Fact]
    public async Task NetworkExceptionIsRedacted()
    {
        var handler = new MockHandler((_, _) => throw new HttpRequestException(FakeKey + Convert.ToBase64String(SourceBytes)));
        var error = await Assert.ThrowsAsync<SegmentationProviderException>(() => Provider(handler).GenerateAutomaticAsync(new(Source, Intent), default));
        Assert.Equal("provider_network_failure", error.Message);
        Assert.Null(error.InnerException);
    }

    [Fact]
    public async Task TimeoutAndCallerCancellationAreDistinctAndPropagated()
    {
        var handler = new MockHandler(async (_, token) => { await Task.Delay(Timeout.Infinite, token); return Response("{}"); });
        var provider = Provider(handler, options: new RoboflowSegmentationOptions { ApiKey = FakeKey, TimeoutSeconds = 1 });
        var error = await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(new(Source, Intent), default));
        Assert.Equal("provider_timeout", error.Message);
        using var cancel = new CancellationTokenSource();
        var task = provider.GenerateAutomaticAsync(new(Source, Intent), cancel.Token);
        cancel.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => task);
    }

    [Theory]
    [InlineData(false, "unit-test-only-not-a-credential", "https://serverless.roboflow.com")]
    [InlineData(true, null, "https://serverless.roboflow.com")]
    [InlineData(true, "unit-test-only-not-a-credential", "https://other.example")]
    [InlineData(true, "unit-test-only-not-a-credential", "http://serverless.roboflow.com")]
    public async Task GateAndConfigurationRejectBeforeTransport(bool enabled, string? key, string url)
    {
        var handler = new MockHandler((_, _) => throw new InvalidOperationException("Transport must not run."));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => Provider(handler, enabled: enabled,
            options: new RoboflowSegmentationOptions { ApiKey = key, BaseUrl = url }).GenerateAutomaticAsync(new(Source, Intent), default));
        Assert.Equal(0, handler.Calls);
    }

    [Theory]
    [InlineData("[1,2,9]", true)]
    [InlineData("\"129\"", true)] // canonical compressed COCO for the same runs
    [InlineData("[1,2,1,2,6]", true)] // separated foreground spans / hole
    [InlineData("[12]", false)] [InlineData("[0,12]", false)]
    [InlineData("[1,2,8]", false)] [InlineData("[1,2,10]", false)]
    [InlineData("[-1,3,10]", false)] [InlineData("[9223372036854775807]", false)]
    [InlineData("\"P\"", false)] [InlineData("\"/\"", false)]
    [InlineData("\"PPPPPPPPPPPPPPPPPPPP\"", false)]
    public void RleIsBoundedAndRejectsMalformedEmptyFullRuns(string counts, bool valid)
    {
        using var json = JsonDocument.Parse("{\"size\":[3,4],\"counts\":" + counts + "}");
        if (valid)
        {
            var result = new RoboflowMaskNormalizer().Normalize(json.RootElement, Source, "dev:mask");
            Assert.Equal(Source, result.Mask.Source);
            Assert.True(result.Mask.Alpha.OpaquePixels > 0);
            Assert.Equal(0, result.Mask.Alpha.IntermediatePixels);
        }
        else Assert.Throws<SegmentationProviderException>(() => new RoboflowMaskNormalizer().Normalize(json.RootElement, Source, "dev:mask"));
    }

    [Fact]
    public void AsymmetricColumnMajorCompressedDeltasAndHolesDecodeExactly()
    {
        // Runs [1,2,1,2,6] -> compressed [1,2,1,0,5]: i>2 delta from i-2.
        using var json = JsonDocument.Parse("{\"size\":[3,4],\"counts\":\"12105\"}");
        var result = new RoboflowMaskNormalizer().Normalize(json.RootElement, Source, "dev:mask");
        using var image = SKBitmap.Decode(result.Bytes);
        Assert.Equal(0, image.GetPixel(0, 0).Alpha);
        Assert.Equal(255, image.GetPixel(0, 1).Alpha);
        Assert.Equal(255, image.GetPixel(0, 2).Alpha);
        Assert.Equal(0, image.GetPixel(1, 0).Alpha);
        Assert.Equal(255, image.GetPixel(1, 1).Alpha);
        Assert.Equal(255, image.GetPixel(1, 2).Alpha);
        Assert.Equal(0, image.GetPixel(2, 1).Alpha);
    }

    [Fact]
    public void WrongSizeIsNeverResized()
    {
        using var json = JsonDocument.Parse("{\"size\":[4,3],\"counts\":[1,2,9]}");
        Assert.Throws<SegmentationProviderException>(() => new RoboflowMaskNormalizer().Normalize(json.RootElement, Source, "dev:mask"));
    }

    [Fact]
    public async Task SourceVersionChecksumMismatchPreventsHttpAndChangedSourceAfterAwaitRejectsResult()
    {
        var handler = new MockHandler((_, _) => Task.FromResult(Response(Automatic(Prediction(new[] { 1, 2, 9 })))));
        var wrong = new SourceMediaIdentity(Source.MediaVersionId, new string('a', 64), Source.Width, Source.Height);
        var error = await Assert.ThrowsAsync<SegmentationProviderException>(() => Provider(handler).GenerateAutomaticAsync(new(wrong, Intent), default));
        Assert.Equal("provider_source_mismatch", error.Message);
        Assert.Equal(0, handler.Calls);
        int resolutions = 0;
        var provider = new RoboflowSurfaceSegmentationProvider(new HttpClient(handler), new() { ApiKey = FakeKey }, true,
            _ => resolutions++ == 0 ? SourceBytes : Png(4, 4), new());
        Assert.Equal("provider_source_mismatch", (await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(new(Source, Intent), default))).Message);
    }

    [Theory]
    [InlineData("[12]")] [InlineData("[0,12]")] [InlineData("[1,2,9]", 4, 3)]
    public async Task InvalidProviderMasksFailRevisionWithoutCandidate(string counts, int h = 3, int w = 4)
    {
        using var array = JsonDocument.Parse(counts);
        var handler = new MockHandler((_, _) => Task.FromResult(Response(Automatic(Prediction(array.RootElement, h, w)))));
        var analysis = new SurfaceAnalysis(Source, Intent);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => new SurfaceSegmentationService(Provider(handler)).GenerateAutomaticAsync(analysis, Source));
        var revision = Assert.Single(analysis.Revisions);
        Assert.Equal(RevisionExecutionStatus.Failed, revision.ExecutionStatus);
        Assert.Empty(revision.Candidates);
        Assert.Null(analysis.ActiveApproval);
    }

    [Fact]
    public async Task BufferIsImmutableAndCannotCrossMediaVersionOrCandidate()
    {
        var masks = new DevelopmentMaskBuffer();
        var handler = new MockHandler((_, _) => Task.FromResult(Response(Automatic(Prediction(new[] { 1, 2, 9 })))));
        var analysis = new SurfaceAnalysis(Source, Intent);
        var revision = await new SurfaceSegmentationService(Provider(handler, masks)).GenerateAutomaticAsync(analysis, Source);
        masks.Bind(revision);
        var candidate = Assert.Single(revision.Candidates);
        var first = masks.Get(revision.Id, candidate.Id, Source);
        var saved = first.ToArray(); first[0] = 0;
        Assert.Equal(saved, masks.Get(revision.Id, candidate.Id, Source));
        Assert.Throws<InvalidOperationException>(() => masks.Get(revision.Id, candidate.Id, new SourceMediaIdentity("dev:other:v2", Source.Sha256, 4, 3)));
        Assert.Throws<KeyNotFoundException>(() => masks.Get(revision.Id, Guid.NewGuid(), Source));
    }

    private static string Repo()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "XinobiYeni.slnx"))) directory = directory.Parent;
        return directory!.FullName;
    }
    private static RevisionRequest AutomaticRequest(ReviewSnapshot state) => new(state.SessionId, state.StateVersion, "automatic", null, null, null);

    [Fact]
    public async Task ExternalInitializationAndGetNeverInferEvenIfFlagEnabled()
    {
        var handler = new MockHandler((_, _) => throw new InvalidOperationException());
        var review = await DevelopmentSurfaceReview.CreateAsync(Repo(), new() { Provider = "roboflow", ExternalInferenceEnabled = true },
            (source, bytes, masks) => new RoboflowSurfaceSegmentationProvider(new HttpClient(handler), new() { ApiKey = FakeKey }, true, _ => bytes, masks));
        Assert.Null((await review.GetAsync()).Candidate);
        Assert.Equal(0, (await review.GetAsync()).RevisionCount);
        Assert.Equal(0, handler.Calls);
    }

    [Fact]
    public async Task ExplicitAutomaticInteractiveAndMaskEndpointsUseDifferentSnapshotsPreservingApproval()
    {
        int calls = 0;
        var handler = new MockHandler((request, _) =>
        {
            // Tea Maker-sized, distinct aligned body test masks; no real AI quality claim.
            var prediction = Prediction(calls++ == 0 ? new[] { 1000, 100000, 1604600 } : new[] { 2000, 120000, 1583600 }, 1600, 1066);
            return Task.FromResult(Response(request.RequestUri!.AbsolutePath.EndsWith("concept_segment") ? Automatic(prediction) : Interactive(prediction)));
        });
        var review = await DevelopmentSurfaceReview.CreateAsync(Repo(), new() { Provider = "roboflow" },
            (source, bytes, masks) => new RoboflowSurfaceSegmentationProvider(new HttpClient(handler), new() { ApiKey = FakeKey }, true, _ => bytes, masks));
        var initial = await review.GetAsync();
        var first = await review.GenerateAsync(AutomaticRequest(initial));
        Assert.Equal("pending", first.Candidate!.Status);
        var approved = await review.ReviewAsync(first.Candidate.RevisionId, first.Candidate.CandidateId, new(first.SessionId, first.StateVersion, "approve"));
        var next = await review.GenerateAsync(new(approved.SessionId, approved.StateVersion, "interactive", first.Candidate.RevisionId, first.Candidate.CandidateId,
            [new(420, 920, "keep"), new(245, 730, "exclude")]));
        Assert.NotEqual(first.Candidate.RevisionId, next.Candidate!.RevisionId);
        Assert.Equal(first.Candidate.CandidateId, next.Candidate.PreviousCandidateId);
        Assert.Equal(first.Candidate.CandidateId, next.ActiveApproval!.CandidateId);
        Assert.Equal("pending", next.Candidate.Status);
        var firstBytes = await review.MaskBytesAsync(first.Candidate.RevisionId, first.Candidate.CandidateId);
        var nextBytes = await review.MaskBytesAsync(next.Candidate.RevisionId, next.Candidate.CandidateId);
        Assert.False(firstBytes.SequenceEqual(nextBytes));
        Assert.Equal(2, handler.Calls);
        Assert.Equal(409, (await Assert.ThrowsAsync<ReviewHttpException>(() => review.ReviewAsync(first.Candidate.RevisionId, first.Candidate.CandidateId, new(first.SessionId, first.StateVersion, "approve")))).Status);
    }

    [Fact]
    public async Task InFlightGetIsNotBlockedConflictingMutationFailsAndFailureAdvancesVersion()
    {
        var entered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var handler = new MockHandler(async (_, token) => { entered.SetResult(); await release.Task.WaitAsync(token); return Response(FakeKey, HttpStatusCode.Unauthorized); });
        var review = await DevelopmentSurfaceReview.CreateAsync(Repo(), new() { Provider = "roboflow" },
            (_, bytes, masks) => new RoboflowSurfaceSegmentationProvider(new HttpClient(handler), new() { ApiKey = FakeKey }, true, _ => bytes, masks));
        var initial = await review.GetAsync();
        var pending = review.GenerateAsync(AutomaticRequest(initial));
        await entered.Task;
        var during = await review.GetAsync().WaitAsync(TimeSpan.FromSeconds(2));
        Assert.True(during.OperationInProgress);
        Assert.Null(during.Candidate);
        Assert.Equal(409, (await Assert.ThrowsAsync<ReviewHttpException>(() => review.GenerateAsync(AutomaticRequest(during)))).Status);
        release.SetResult();
        var error = await Assert.ThrowsAsync<ReviewHttpException>(() => pending);
        Assert.DoesNotContain(FakeKey, error.ToString());
        var after = await review.GetAsync();
        Assert.Null(after.Candidate);
        Assert.False(after.OperationInProgress);
        Assert.True(after.StateVersion > during.StateVersion);
        Assert.Equal(1, after.RevisionCount);
        Assert.Equal("provider_authentication_failed", after.LastError);
    }

    [Fact]
    public async Task SocketlessHandlerCannotSendEvenWithFakeEnabledCredential()
    {
        using var client = new HttpClient(new OutboundDisabledHandler());
        var provider = new RoboflowSurfaceSegmentationProvider(client, new() { ApiKey = FakeKey }, true, _ => SourceBytes, new());
        var error = await Assert.ThrowsAsync<SegmentationProviderException>(() => provider.GenerateAutomaticAsync(new(Source, Intent), default));
        Assert.Equal("external_inference_unavailable", error.Message);
    }

    [Fact]
    public async Task ReviewCancellationAlwaysClearsInFlightAndCannotPublishCandidate()
    {
        var entered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var handler = new MockHandler(async (_, token) => { entered.SetResult(); await Task.Delay(Timeout.Infinite, token); return Response("{}"); });
        var review = await DevelopmentSurfaceReview.CreateAsync(Repo(), new() { Provider = "roboflow" },
            (_, bytes, masks) => new RoboflowSurfaceSegmentationProvider(new HttpClient(handler), new() { ApiKey = FakeKey }, true, _ => bytes, masks));
        var initial = await review.GetAsync();
        using var cancellation = new CancellationTokenSource();
        var task = review.GenerateAsync(AutomaticRequest(initial), cancellation.Token);
        await entered.Task;
        cancellation.Cancel();
        Assert.Equal(408, (await Assert.ThrowsAsync<ReviewHttpException>(() => task)).Status);
        var after = await review.GetAsync();
        Assert.False(after.OperationInProgress);
        Assert.Null(after.Candidate);
        Assert.Equal("provider_cancelled", after.LastError);
        Assert.True(after.StateVersion > initial.StateVersion);
    }

    [Fact]
    public async Task SourceChangedDuringHttpCannotCommitCandidate()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "xinobi-step4-source-" + Guid.NewGuid());
        var relative = "apps/web/public/assets/products/tea-maker-101-blue.webp";
        var target = Path.Combine(tempRoot, relative);
        var original = File.ReadAllBytes(Path.Combine(Repo(), relative));
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.WriteAllBytes(target, original);
            var entered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
            var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
            var handler = new MockHandler(async (_, token) =>
            {
                entered.SetResult(); await release.Task.WaitAsync(token);
                return Response(Automatic(Prediction(new[] { 1000, 100000, 1604600 }, 1600, 1066)));
            });
            var review = await DevelopmentSurfaceReview.CreateAsync(tempRoot, new() { Provider = "roboflow" },
                (_, bytes, masks) => new RoboflowSurfaceSegmentationProvider(new HttpClient(handler), new() { ApiKey = FakeKey }, true, _ => bytes, masks));
            var initial = await review.GetAsync();
            var task = review.GenerateAsync(AutomaticRequest(initial));
            await entered.Task;
            File.WriteAllBytes(target, Png(4, 3));
            release.SetResult();
            Assert.Equal(409, (await Assert.ThrowsAsync<ReviewHttpException>(() => task)).Status);
            File.WriteAllBytes(target, original);
            var after = await review.GetAsync();
            Assert.Null(after.Candidate);
            Assert.False(after.OperationInProgress);
            Assert.Equal("source_changed", after.LastError);
        }
        finally
        {
            // Only this unique fixture beneath the verified temporary directory.
            if (Path.GetFullPath(tempRoot).StartsWith(Path.GetFullPath(Path.GetTempPath()), StringComparison.OrdinalIgnoreCase)) Directory.Delete(tempRoot, true);
        }
    }

    [Fact]
    public async Task CatalogMultiplePromptsRetainSeparateMasksAndEvidenceWithoutApproval()
    {
        var masks=new DevelopmentMaskBuffer();
        var handler=new MockHandler(async(request,token)=>{
            using var body=JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
            Assert.Equal(new[]{"upper teapot body","lower kettle body"},body.RootElement.GetProperty("prompts").EnumerateArray().Select(p=>p.GetProperty("text").GetString()).ToArray());
            Assert.Equal(Convert.ToBase64String(SourceBytes),body.RootElement.GetProperty("image").GetProperty("value").GetString());
            return Response("{\"prompt_results\":[{\"prompt_index\":1,\"predictions\":["+Prediction(new[]{2,4,6},score:.9)+"]},{\"prompt_index\":0,\"predictions\":["+Prediction(new[]{1,2,9},score:.6)+"]}]}");
        });
        var provider=new RoboflowSurfaceSegmentationProvider(new HttpClient(handler),new(){ApiKey=FakeKey},true,_=>SourceBytes,masks,true,["upper teapot body","lower kettle body"]);
        var analysis=new SurfaceAnalysis(Source,Intent);
        var revision=await new SurfaceSegmentationService(provider).GenerateAutomaticAsync(analysis,Source);
        Assert.Equal(2,revision.Candidates.Count);Assert.Null(analysis.ActiveApproval);Assert.All(revision.Candidates,c=>Assert.Equal(CandidateReviewStatus.Pending,c.ReviewStatus));
        Assert.Equal(new[]{0,1},revision.Candidates.Select(c=>masks.Evidence(c.Mask.AssetReference)!.PromptIndex));Assert.Equal(1,handler.Calls);
    }
    [Fact]
    public async Task MissingOneConceptRemainsMissingAndDoesNotInventMask()
    {
        var handler=new MockHandler((_,_)=>Task.FromResult(Response("{\"prompt_results\":[{\"prompt_index\":0,\"predictions\":[]},{\"prompt_index\":1,\"predictions\":["+Prediction(new[]{2,4,6})+"]}]}")));
        var masks=new DevelopmentMaskBuffer();var provider=new RoboflowSurfaceSegmentationProvider(new HttpClient(handler),new(){ApiKey=FakeKey},true,_=>SourceBytes,masks,true,["upper teapot body","lower kettle body"]);
        var result=await provider.GenerateAutomaticAsync(new(Source,Intent),default);var single=Assert.Single(result.Candidates);Assert.Equal(1,masks.Evidence(single.Mask.AssetReference)!.PromptIndex);Assert.Equal(1,handler.Calls);
    }
    [Fact]
    public async Task MultipleCatalogResponseOverEightOrMalformedIsRejected()
    {
        foreach(var item in new[]{(Body:Automatic(Enumerable.Repeat(Prediction(new[]{1,2,9}),9).ToArray()),Code:"provider_invalid_response"),(Body:Automatic(Prediction(new[]{1,2,9}),Prediction(new[]{99})),Code:"provider_invalid_mask")}){
            var handler=new MockHandler((_,_)=>Task.FromResult(Response(item.Body)));var provider=new RoboflowSurfaceSegmentationProvider(new HttpClient(handler),new(){ApiKey=FakeKey},true,_=>SourceBytes,new(),true);
            Assert.Equal(item.Code,(await Assert.ThrowsAsync<SegmentationProviderException>(()=>provider.GenerateAutomaticAsync(new(Source,Intent),default))).Message);Assert.Equal(1,handler.Calls);
        }
    }
}
