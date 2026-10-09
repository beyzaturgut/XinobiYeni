using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Features.ProductSurfaces.Development;

namespace Xinobi.Architecture.Tests;

public sealed class ProductSurfaceCorrectionApiTests
{
    private const string Root = DevelopmentSurfaceReview.Route;
    private static WebApplicationFactory<Program> Factory() => new IsolatedApiFactory().WithWebHostBuilder(b =>
    {
        b.UseEnvironment("Development"); b.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ProductSurfaces:DevelopmentReview:Enabled"] = "true",
            ["ProductSurfaces:DevelopmentReview:RepositoryRoot"] = DesignableMaskRefinerTests.Repo(),
            ["ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled"] = "true",
            ["ProductSurfaces:Segmentation:Provider"] = "reference",
            ["ProductSurfaces:Segmentation:ExternalInferenceEnabled"] = "false",
            ["ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled"] = "false",
            ["ProductSurfaces:Segmentation:SingleInteractiveSmokeEnabled"] = "false"
        }));
    });
    private static HttpClient Client(WebApplicationFactory<Program> f) { var c = f.CreateClient(); c.DefaultRequestHeaders.Add("Origin", "http://localhost:5173"); return c; }
    private static string Path(ReviewSnapshot s) => Root + $"/revisions/{s.Candidate!.RevisionId}/candidates/{s.Candidate.CandidateId}";
    private static Task<ReviewSnapshot?> Get(HttpClient c) => c.GetFromJsonAsync<ReviewSnapshot>(Root + "/review");
    private static CorrectionRequest Request(ReviewSnapshot s) => new(s.SessionId, s.StateVersion,
        [new("add", 4, [new(435, 1230), new(470, 1230)])]);
    private static async Task<ReviewSnapshot> Refined(HttpClient c)
    {
        var raw = (await Get(c))!;
        return (await (await c.PostAsJsonAsync(Path(raw) + "/refine", new RefinementRequest(raw.SessionId, raw.StateVersion))).Content.ReadFromJsonAsync<ReviewSnapshot>())!;
    }
    [Fact]
    public async Task NewPendingCorrectionPreservesRawAndRefinedAndRecordsExactProvenance()
    {
        using var f = Factory(); using var c = Client(f); var parent = await Refined(c);
        var before = await c.GetByteArrayAsync(parent.Candidate!.MaskUrl); var raw = await c.GetByteArrayAsync(parent.RawCandidate!.MaskUrl);
        var response = await c.PostAsJsonAsync(Path(parent) + "/correct", Request(parent)); Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var corrected = (await response.Content.ReadFromJsonAsync<ReviewSnapshot>())!;
        Assert.Equal("manualcorrection", corrected.Candidate!.Mode); Assert.Equal("pending", corrected.Candidate.Status);
        Assert.NotEqual(parent.Candidate.CandidateId, corrected.Candidate.CandidateId); Assert.Equal(parent.Candidate.CandidateId, corrected.Candidate.PreviousCandidateId);
        Assert.Null(corrected.ActiveApproval); Assert.Equal(3, corrected.RevisionCount);
        var proof = corrected.Correction!;
        Assert.Equal(parent.Source, proof.Source); Assert.Equal(parent.Candidate.RevisionId, proof.ParentRevisionId); Assert.Equal(parent.Candidate.CandidateId, proof.ParentCandidateId);
        Assert.Equal("4f3fffe81e442b66808e219514d50bd2e37b7db348ef512ebcb6f649dd8deb43", proof.ParentMaskSha256);
        Assert.Equal("source-pixel-capsule-strokes", proof.Algorithm); Assert.Equal("1", proof.AlgorithmVersion);
        Assert.Equal(DevelopmentSurfaceReview.Reviewer, proof.Reviewer); Assert.Single(proof.Operations); Assert.Equal(2, proof.Operations[0].Points.Count);
        var after = await c.GetByteArrayAsync(corrected.Candidate.MaskUrl);
        Assert.NotEqual(before, after); Assert.Equal(before, await c.GetByteArrayAsync(parent.Candidate.MaskUrl)); Assert.Equal(raw, await c.GetByteArrayAsync(parent.RawCandidate.MaskUrl));
        Assert.Equal(proof.OutputMaskSha256, Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(after)).ToLowerInvariant());
        Assert.Equal(corrected.Candidate.CandidateId, proof.DerivedCandidateId); Assert.Equal(corrected.Candidate.RevisionId, proof.DerivedRevisionId);
        Assert.Equal(HttpStatusCode.Conflict, (await c.PostAsJsonAsync(Path(parent) + "/review", new DecisionRequest(corrected.SessionId, corrected.StateVersion, "approve"))).StatusCode);
        // Synthetic test session only; the actual QA candidate is never approved.
        Assert.Equal(HttpStatusCode.OK, (await c.PostAsJsonAsync(Path(corrected) + "/review", new DecisionRequest(corrected.SessionId, corrected.StateVersion, "approve"))).StatusCode);
        Assert.Equal(corrected.Candidate.CandidateId, (await Get(c))!.ActiveApproval!.CandidateId);
    }
    [Fact]
    public async Task ExistingApprovalUnchangedAndConcurrentOrStaleCorrectionsCannotBothCommit()
    {
        using var f = Factory(); using var c = Client(f); var parent = await Refined(c);
        await c.PostAsJsonAsync(Path(parent) + "/review", new DecisionRequest(parent.SessionId, parent.StateVersion, "approve")); parent = (await Get(c))!;
        var results = await Task.WhenAll(c.PostAsJsonAsync(Path(parent) + "/correct", Request(parent)), c.PostAsJsonAsync(Path(parent) + "/correct", Request(parent)));
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.OK); Assert.Single(results, r => r.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(parent.ActiveApproval, (await Get(c))!.ActiveApproval); Assert.Equal("pending", (await Get(c))!.Candidate!.Status);
    }
    [Fact]
    public async Task InvalidOperationsUnknownParentAndClientIdentityRejectedWithoutNewCandidate()
    {
        using var f = Factory(); using var c = Client(f); var s = await Refined(c);
        foreach (var operations in new CorrectionStroke[][] { [], [new("add", 4, [new(-1, 10)])], [new("remove", 33, [new(5, 5)])], [new("add", 4, [new(1066, 10)])] })
            Assert.Equal(HttpStatusCode.UnprocessableEntity, (await c.PostAsJsonAsync(Path(s) + "/correct", new CorrectionRequest(s.SessionId, s.StateVersion, operations))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.PostAsJsonAsync(Root + $"/revisions/{Guid.NewGuid()}/candidates/{Guid.NewGuid()}/correct", Request(s))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await c.PostAsJsonAsync(Path(s) + "/correct", Request(s) with { SessionId = Guid.NewGuid() })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Path(s) + "/correct", new { s.SessionId, ExpectedStateVersion = s.StateVersion, operations = Request(s).Operations, reviewer = "client" })).StatusCode);
        Assert.Equal(s.RevisionCount, (await Get(c))!.RevisionCount);
    }
}
