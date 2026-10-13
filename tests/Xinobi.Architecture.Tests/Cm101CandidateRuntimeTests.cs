using System.Net;
using System.Text;
using System.Text.Json;
using SkiaSharp;
using Xinobi.Api.Catalog;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class Cm101CandidateRuntimeTests
{
    private sealed class Catalog : ICatalogSource
    {
        public CommerceState State = new([new(Cm101CatalogSourceResolver.ProductId, "CM", "tea", true, "", "",
            [new(Cm101CatalogSourceResolver.VariantId,"101","navy",1,Cm101CatalogSourceResolver.ImagePath)],true)],[],new([],"",""));
        public Task<CommerceState> ReadAsync() => Task.FromResult(State);
    }
    private sealed class Fixture(bool copySource = false) : IDisposable
    {
        public string Root { get; } = Create(copySource);
        public string Media => Path.Combine(Root,"media");
        public string Review => Path.Combine(Root,"isolated-review");
        private static string Create(bool copySource)
        {
            var root = Path.Combine(Path.GetTempPath(),"cm101-runtime-mock-"+Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(Path.Combine(root,"media"));
            if(copySource) File.Copy(Environment.GetEnvironmentVariable("XINOBI_CM101_TEST_SOURCE")!,Path.Combine(root,"media",Cm101CatalogSourceResolver.FileName));
            return root;
        }
        public void Dispose()
        {
            var resolved=Path.GetFullPath(Root);
            var parent=Path.GetFullPath(Path.GetTempPath()).TrimEnd(Path.DirectorySeparatorChar);
            if (!string.Equals(Path.GetDirectoryName(resolved),parent,StringComparison.OrdinalIgnoreCase) ||
                !Path.GetFileName(resolved).StartsWith("cm101-runtime-mock-",StringComparison.Ordinal))
                throw new InvalidOperationException("Refusing cleanup outside this owned test directory.");
            Directory.Delete(resolved,true);
        }
    }
    private sealed class MockHttp(Func<HttpRequestMessage,Task<HttpResponseMessage>> respond) : HttpMessageHandler
    {
        public int Calls;
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken token)
        { Interlocked.Increment(ref Calls); return respond(request); }
    }
    private static readonly Cm101CandidateGates Enabled = new(true,true,true,true,"roboflow");
    private static string Rle(int height=5315) => JsonSerializer.Serialize(new { prompt_results = new[] { new {
        prompt_index=0, predictions = new[] { new { format="rle",masks=new { size=new[] {height,3543},counts=new[] {5315*800,5315*600,5315*(3543-1400)} },confidence=.8 } }
    } } });
    private static HttpResponseMessage Ok(string body) => new(HttpStatusCode.OK) { Content=new StringContent(body,Encoding.UTF8,"application/json") };

    [Fact]
    public async Task DefaultDisabledNeverReadsCredentialCreatesLedgerOrHttp()
    {
        using var fixture = new Fixture(); var calls=0;
        var runner = new Cm101PendingCandidateRunner(new(new Catalog(),fixture.Media),fixture.Review);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => runner.ExecuteAsync(Guid.NewGuid(),new(),() => { calls++; return "fake"; },() => throw new Exception(),true));
        Assert.False(Directory.Exists(fixture.Review)); Assert.Equal(0,calls);
        Assert.Equal(2,await Cm101CandidateCommand.RunAsync([]));
    }
    [Fact]
    public async Task MissingOrWrongSourceNeverClaimsOrLoadsCredentials()
    {
        using var fixture = new Fixture();var calls=0;
        var runner = new Cm101PendingCandidateRunner(new(new Catalog(),fixture.Media),fixture.Review);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => runner.ExecuteAsync(Guid.NewGuid(),Enabled,() => { calls++;return "fake"; },() => throw new Exception(),true));
        File.WriteAllBytes(Path.Combine(fixture.Media,Cm101CatalogSourceResolver.FileName),[1,2,3]);
        await Assert.ThrowsAsync<SegmentationProviderException>(() => runner.ExecuteAsync(Guid.NewGuid(),Enabled,() => { calls++;return "fake"; },() => throw new Exception(),true));
        Assert.False(Directory.Exists(fixture.Review));Assert.Equal(0,calls);
    }
    [Fact]
    public async Task AtomicLedgerAllowsOneAcrossInstancesAndRestart()
    {
        using var fixture = new Fixture();var attemptId=Guid.NewGuid();
        var outcomes = await Task.WhenAll(Enumerable.Range(0,12).Select(_ => Task.Run(() => {
            try { new Cm101AttemptLedger(fixture.Review).Claim(attemptId,true);return true; }
            catch(SegmentationProviderException) {return false;}
        })));
        Assert.Single(outcomes,x=>x);
        Assert.Throws<SegmentationProviderException>(() => new Cm101AttemptLedger(fixture.Review).Claim(attemptId,true));
        var record=JsonSerializer.Deserialize<Cm101AttemptRecord>(File.ReadAllText(Path.Combine(fixture.Review,"attempts",attemptId+".json")),new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
        Assert.Equal("claimed-no-refund",record.State);Assert.Equal(Cm101CatalogSourceResolver.Source,record.Source);
        Assert.Equal(Cm101CatalogSourceResolver.ProductId,record.ProductId);Assert.True(record.MockTest);
    }
    [Fact]
    public void CorruptOrUnknownExistingLedgerFailsClosedAndIsNotRewritten()
    {
        using var fixture = new Fixture();var id=Guid.NewGuid();
        Directory.CreateDirectory(Path.Combine(fixture.Review,"attempts"));
        var path=Path.Combine(fixture.Review,"attempts",id+".json");File.WriteAllText(path,"corrupt");
        Assert.Throws<SegmentationProviderException>(() => new Cm101AttemptLedger(fixture.Review).Claim(id,true));
        Assert.Equal("corrupt",File.ReadAllText(path));
    }
    [Fact]
    public async Task RestrictedTransportDisablesAmbientBehaviorAndBlocksOtherEndpoints()
    {
        using var transport=Cm101RestrictedRequestHandler.CreateTransport();
        Assert.False(transport.AllowAutoRedirect);Assert.False(transport.UseCookies);Assert.False(transport.UseProxy);
        Assert.Null(transport.Credentials);Assert.Equal(DecompressionMethods.None,transport.AutomaticDecompression);
        var mock=new MockHttp(_=>Task.FromResult(Ok("{}")));
        using var client=new HttpClient(new Cm101RestrictedRequestHandler(mock));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => client.GetAsync("https://serverless.roboflow.com/sam3/concept_segment"));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => client.PostAsync("https://serverless.roboflow.com/sam3/visual_segment",new StringContent("{}")));
        using var mismatch=new StringContent(JsonSerializer.Serialize(new { image=new {type="base64",value=Convert.ToBase64String([1,2,3])},format="rle",prompts=new[] {new {type="text",text="upper teapot body"}} }));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => client.PostAsync("https://serverless.roboflow.com/sam3/concept_segment",mismatch));
        Assert.Equal(0,mock.Calls);
    }
    [Cm101SourceFact]
    public async Task MockExecutionWritesOnlyImmutablePendingArtifactsAndReviewOverlay()
    {
        using var fixture=new Fixture(true);var catalog=new Catalog();var priorState=catalog.State;var id=Guid.NewGuid();var credentialLoads=0;
        var mock=new MockHttp(async request=> {
            Assert.Equal(HttpVersion.Version11,request.Version);Assert.Equal(HttpVersionPolicy.RequestVersionExact,request.VersionPolicy);Assert.True(request.Headers.ConnectionClose);
            using var payload=JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            Assert.Equal("lower kettle body",payload.RootElement.GetProperty("prompts")[0].GetProperty("text").GetString());
            return Ok(Rle());
        });
        var runner=new Cm101PendingCandidateRunner(new(catalog,fixture.Media),fixture.Review);
        var output=await runner.ExecuteAsync(id,Enabled,()=> {
            credentialLoads++;
            Assert.True(File.Exists(Path.Combine(fixture.Review,"attempts",id+".json")));
            return "FAKE-MOCK-ONLY";
        },()=>mock,true);
        Assert.Equal(1,mock.Calls);Assert.Equal(1,credentialLoads);Assert.Same(priorState,catalog.State);
        Assert.Equal(4,Directory.GetFiles(output).Length);
        Assert.Equal(File.ReadAllBytes(Path.Combine(fixture.Media,Cm101CatalogSourceResolver.FileName)),File.ReadAllBytes(Path.Combine(output,"source.webp")));
        var mask=File.ReadAllBytes(Path.Combine(output,"candidate-mask.png"));
        var validated=new AlignedImageInspector().ValidateMask(mask,"test",Cm101CatalogSourceResolver.Source,Cm101CatalogSourceResolver.Source);
        Assert.Equal(3543,validated.Metadata.Width);Assert.Equal(5315,validated.Metadata.Height);
        using var metadata=JsonDocument.Parse(File.ReadAllText(Path.Combine(output,"candidate.json")));
        Assert.Equal("pending",metadata.RootElement.GetProperty("status").GetString());
        Assert.Equal("MOCK TEST ONLY",metadata.RootElement.GetProperty("executionKind").GetString());
        Assert.False(metadata.RootElement.GetProperty("brandingProtectionValidated").GetBoolean());
        using var overlay=SKBitmap.Decode(Path.Combine(output,"review-overlay.png"));Assert.Equal(1600,overlay.Height);
        using var source=SKBitmap.Decode(File.ReadAllBytes(Path.Combine(output,"source.webp")));
        Assert.Equal(source.GetPixel(0,0),overlay.GetPixel(0,0)); // Outside synthetic stripe is original.
        Assert.NotEqual(source.GetPixel(1000,2500),overlay.GetPixel((int)Math.Round(1000d*overlay.Width/3543),(int)Math.Round(2500d*overlay.Height/5315)));
        await Assert.ThrowsAsync<SegmentationProviderException>(() => runner.ExecuteAsync(id,Enabled,()=> {credentialLoads++;return "fake";},()=>throw new Exception(),true));
        Assert.Equal(1,credentialLoads);Assert.Equal(1,mock.Calls);
        Assert.False(Directory.Exists(Path.Combine(fixture.Root,"approved")));
    }
    [Cm101SourceFact]
    public async Task TimeoutInvalidRleAndHttpErrorStayConsumedWithNoRetryOrCandidate()
    {
        using var fixture=new Fixture(true);
        foreach(var outcome in new[] {"timeout","invalid","error"}) {
            var id=Guid.NewGuid();var mock=new MockHttp(_=>outcome switch {
                "timeout"=>throw new TaskCanceledException(),
                "invalid"=>Task.FromResult(Ok(Rle(1600))),
                _=>Task.FromResult(new HttpResponseMessage(HttpStatusCode.ServiceUnavailable))
            });
            var runner=new Cm101PendingCandidateRunner(new(new Catalog(),fixture.Media),fixture.Review);
            await Assert.ThrowsAsync<SegmentationProviderException>(() => runner.ExecuteAsync(id,Enabled,()=>"FAKE-MOCK-ONLY",()=>mock,true));
            Assert.Equal(1,mock.Calls);Assert.False(Directory.Exists(Path.Combine(fixture.Review,"pending",id.ToString("D"))));
            await Assert.ThrowsAsync<SegmentationProviderException>(() => runner.ExecuteAsync(id,Enabled,()=>throw new Exception(),()=>throw new Exception(),true));
            Assert.Equal(1,mock.Calls);
        }
    }

    [Cm101SourceFact]
    public async Task MissingCredentialConsumesClaimWithoutCreatingTransport()
    {
        using var fixture=new Fixture(true);var id=Guid.NewGuid();var loads=0;var transports=0;
        var runner=new Cm101PendingCandidateRunner(new(new Catalog(),fixture.Media),fixture.Review);
        await Assert.ThrowsAsync<SegmentationProviderException>(()=>runner.ExecuteAsync(id,Enabled,()=>{loads++;return null;},()=>{transports++;throw new Exception();},true));
        Assert.True(File.Exists(Path.Combine(fixture.Review,"attempts",id+".json")));
        await Assert.ThrowsAsync<SegmentationProviderException>(()=>new Cm101PendingCandidateRunner(new(new Catalog(),fixture.Media),fixture.Review)
            .ExecuteAsync(id,Enabled,()=>{loads++;return "fake";},()=>{transports++;throw new Exception();},true));
        Assert.Equal(1,loads);Assert.Equal(0,transports);
    }
}
