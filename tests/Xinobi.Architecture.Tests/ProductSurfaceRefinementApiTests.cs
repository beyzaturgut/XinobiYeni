using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Features.ProductSurfaces.Development;

namespace Xinobi.Architecture.Tests;

public sealed class ProductSurfaceRefinementApiTests
{
    private const string Root = DevelopmentSurfaceReview.Route;
    private static WebApplicationFactory<Program> Factory(bool enabled = true) => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ProductSurfaces:DevelopmentReview:Enabled"] = "true",
            ["ProductSurfaces:DevelopmentReview:RepositoryRoot"] = DesignableMaskRefinerTests.Repo(),
            ["ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled"] = enabled.ToString(),
            ["ProductSurfaces:Segmentation:Provider"] = "reference",
            ["ProductSurfaces:Segmentation:ExternalInferenceEnabled"] = "false",
            ["ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled"] = "false",
            ["ProductSurfaces:Segmentation:SingleInteractiveSmokeEnabled"] = "false"
        }));
    });
    private static HttpClient Client(WebApplicationFactory<Program> factory)
    {
        var client = factory.CreateClient(new() { AllowAutoRedirect = false });
        client.DefaultRequestHeaders.Add("Origin", "http://localhost:5173"); return client;
    }
    private static Task<ReviewSnapshot?> Get(HttpClient c) => c.GetFromJsonAsync<ReviewSnapshot>(Root + "/review");
    private static string CandidateRoute(ReviewSnapshot s) => Root + $"/revisions/{s.Candidate!.RevisionId}/candidates/{s.Candidate.CandidateId}";
    private static Task<HttpResponseMessage> Refine(HttpClient c, ReviewSnapshot s) => c.PostAsJsonAsync(CandidateRoute(s) + "/refine", new RefinementRequest(s.SessionId, s.StateVersion));

    [Fact]
    public async Task ExplicitDerivationPreservesRawAndRecordsActualPendingProvenance()
    {
        using var factory = Factory(); using var c = Client(factory); var raw = (await Get(c))!;
        Assert.Equal(TeaMakerRefinementFixture.RawCandidateId, raw.Candidate!.CandidateId);
        Assert.Equal(TeaMakerRefinementFixture.RawRevisionId, raw.Candidate.RevisionId);
        Assert.True(raw.RefinementAvailable); Assert.Null(raw.Derivation); Assert.Null(raw.ActiveApproval);
        var before = await c.GetByteArrayAsync(raw.Candidate.MaskUrl);
        var response = await Refine(c, raw); Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var derived = (await response.Content.ReadFromJsonAsync<ReviewSnapshot>())!;
        Assert.Equal("refinement", derived.Candidate!.Mode); Assert.Equal("pending", derived.Candidate.Status);
        Assert.NotEqual(raw.Candidate.CandidateId, derived.Candidate.CandidateId);
        Assert.NotEqual(raw.Candidate.RevisionId, derived.Candidate.RevisionId);
        Assert.Null(derived.ActiveApproval); Assert.False(derived.RefinementAvailable);
        var proof = derived.Derivation!;
        Assert.Equal(raw.Source, proof.Source); Assert.Equal(raw.Candidate.RevisionId, proof.RawRevisionId);
        Assert.Equal(raw.Candidate.CandidateId, proof.RawCandidateId); Assert.Equal(TeaMakerRefinementFixture.RawSha256, proof.RawMaskSha256);
        Assert.Equal("enclosed-background-fill", proof.Algorithm); Assert.Equal("1", proof.AlgorithmVersion);
        Assert.Equal(8, proof.Connectivity); Assert.Equal(5718, proof.MaxEnclosedHoleAreaPixels);
        Assert.Equal(1, proof.HolesFound); Assert.Equal(1, proof.HolesFilled); Assert.Equal(5718, proof.PixelsFilled);
        Assert.Equal(derived.Candidate.RevisionId, proof.DerivedRevisionId); Assert.Equal(derived.Candidate.CandidateId, proof.DerivedCandidateId);
        Assert.Equal(before, await c.GetByteArrayAsync(raw.Candidate.MaskUrl));
        Assert.Equal(TeaMakerRefinementFixture.RawSha256, Convert.ToHexString(SHA256.HashData(before)).ToLowerInvariant());
        var after = await c.GetByteArrayAsync(derived.Candidate.MaskUrl);
        Assert.Equal(proof.DerivedMaskSha256, Convert.ToHexString(SHA256.HashData(after)).ToLowerInvariant());
        Assert.Equal(raw.Candidate.CandidateId, derived.RawCandidate!.CandidateId);
        Assert.Equal("pending", derived.RawCandidate.Status);
        Assert.Equal(HttpStatusCode.Conflict, (await Refine(c, derived)).StatusCode);
    }
    [Fact]
    public async Task StaleRawDecisionRejectedAndExplicitDerivedDecisionTargetsExactCandidate()
    {
        using var factory = Factory(); using var c = Client(factory); var raw = (await Get(c))!;
        var derived = (await (await Refine(c, raw)).Content.ReadFromJsonAsync<ReviewSnapshot>())!;
        var stale = await c.PostAsJsonAsync(CandidateRoute(raw) + "/review", new DecisionRequest(raw.SessionId, raw.StateVersion, "approve"));
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        var wrongTarget = await c.PostAsJsonAsync(CandidateRoute(raw) + "/review", new DecisionRequest(derived.SessionId, derived.StateVersion, "approve"));
        Assert.Equal(HttpStatusCode.Conflict, wrongTarget.StatusCode);
        var explicitDecision = await c.PostAsJsonAsync(CandidateRoute(derived) + "/review", new DecisionRequest(derived.SessionId, derived.StateVersion, "approve"));
        Assert.Equal(HttpStatusCode.OK, explicitDecision.StatusCode);
        var approved = (await Get(c))!; Assert.Equal(derived.Candidate!.CandidateId, approved.ActiveApproval!.CandidateId);
        Assert.Equal("pending", approved.RawCandidate!.Status);
    }
    [Fact]
    public async Task DerivationDoesNotReplaceExistingApproval()
    {
        using var factory = Factory(); using var c = Client(factory); var raw = (await Get(c))!;
        await c.PostAsJsonAsync(CandidateRoute(raw) + "/review", new DecisionRequest(raw.SessionId, raw.StateVersion, "approve"));
        raw = (await Get(c))!; var derived = (await (await Refine(c, raw)).Content.ReadFromJsonAsync<ReviewSnapshot>())!;
        Assert.Equal(raw.ActiveApproval, derived.ActiveApproval); Assert.Equal("pending", derived.Candidate!.Status);
    }
    [Fact]
    public async Task TwoConcurrentRefinementsCannotBothCommit()
    {
        using var factory = Factory(); using var c = Client(factory); var raw = (await Get(c))!;
        var responses = await Task.WhenAll(Refine(c, raw), Refine(c, raw));
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(2, (await Get(c))!.RevisionCount);
    }
    [Fact]
    public async Task OptInRequiredAndInferenceDisabledInLocalRefinementSession()
    {
        using var disabled = Factory(false); using var c = Client(disabled); var state = (await Get(c))!;
        Assert.False(state.RefinementAvailable); Assert.Null(state.RawCandidate);
        Assert.Equal(HttpStatusCode.Conflict, (await Refine(c, state)).StatusCode);
        using var enabled = Factory(); using var local = Client(enabled); state = (await Get(local))!;
        var infer = await local.PostAsJsonAsync(Root + "/revisions", new RevisionRequest(state.SessionId, state.StateVersion, "automatic", null, null, null));
        Assert.Equal(HttpStatusCode.Conflict, infer.StatusCode); Assert.Equal(1, (await Get(local))!.RevisionCount);
        Assert.Equal(HttpStatusCode.NotFound, (await local.GetAsync(Root.Replace("tea-maker-101-blue", "tea-maker-101-red") + "/review")).StatusCode);
    }
}
