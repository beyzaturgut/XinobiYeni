using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Features.ProductSurfaces.Development;

namespace Xinobi.Architecture.Tests;

public sealed class ProductSurfaceReviewApiTests
{
    private const string Root = DevelopmentSurfaceReview.Route;
    private static string Repo()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "XinobiYeni.slnx"))) dir = dir.Parent;
        return dir!.FullName;
    }
    private static WebApplicationFactory<Program> Factory(bool enabled = true, string environment = "Development", string? root = null, string provider = "reference", bool external = false) =>
        new IsolatedApiFactory().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment(environment);
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ProductSurfaces:DevelopmentReview:Enabled"] = enabled.ToString(),
                ["ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled"] = "false",
                ["ProductSurfaces:DevelopmentReview:RepositoryRoot"] = root ?? Repo(),
                ["ProductSurfaces:Segmentation:Provider"] = provider,
                ["ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled"] = "false",
                ["ProductSurfaces:Segmentation:SingleInteractiveSmokeEnabled"] = "false",
                ["ProductSurfaces:Segmentation:ExternalInferenceEnabled"] = external.ToString()
            }));
        });
    private static HttpClient Client(WebApplicationFactory<Program> factory)
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        client.DefaultRequestHeaders.Add("Origin", "http://localhost:5173");
        client.DefaultRequestHeaders.Add("X-Request-Id", "surface-contract-test");
        return client;
    }
    private static async Task<ReviewSnapshot> Get(HttpClient client) => (await client.GetFromJsonAsync<ReviewSnapshot>(Root + "/review"))!;
    private static RevisionRequest Interactive(ReviewSnapshot state, params ReviewPoint[] points) =>
        new(state.SessionId, state.StateVersion, "interactive", state.Candidate!.RevisionId, state.Candidate!.CandidateId, points);
    private static string DecisionUrl(ReviewSnapshot state) => Root + $"/revisions/{state.Candidate!.RevisionId}/candidates/{state.Candidate!.CandidateId}/review";
    private static Task<HttpResponseMessage> Decide(HttpClient client, ReviewSnapshot state, string outcome) =>
        client.PostAsJsonAsync(DecisionUrl(state), new DecisionRequest(state.SessionId, state.StateVersion, outcome));
    private static async Task Problem(HttpResponseMessage response, HttpStatusCode status)
    {
        Assert.Equal(status, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var text = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(text);
        Assert.Equal("surface-contract-test", json.RootElement.GetProperty("requestId").GetString());
        Assert.True(json.RootElement.TryGetProperty("timestampUtc", out _));
        Assert.DoesNotContain("Source\\Repos", text);
        Assert.DoesNotContain("stackTrace", text, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(false)] [InlineData(true)]
    public async Task RoboflowModeIsSourceOnlyAndCannotReachNetworkEvenWhenEnabled(bool external)
    {
        using var factory = Factory(provider: "roboflow", external: external); using var client = Client(factory);
        var state = await Get(client);
        Assert.Null(state.Candidate);
        Assert.Equal(0, state.RevisionCount);
        Assert.Equal("roboflow", state.Provider);
        Assert.Contains("kapalı", state.ProviderLabel);
        Assert.Equal(state, await Get(client));
        Assert.NotEmpty(await client.GetByteArrayAsync(state.SourceUrl));
        var response = await client.PostAsJsonAsync(Root + "/revisions", new RevisionRequest(state.SessionId, state.StateVersion, "automatic", null, null, null));
        await Problem(response, HttpStatusCode.ServiceUnavailable);
        var text = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("Authorization", text);
        Assert.DoesNotContain("ApiKey", text);
        Assert.DoesNotContain("base64", text);
        var after = await Get(client);
        Assert.Null(after.Candidate);
        Assert.Equal(1, after.RevisionCount);
        Assert.True(after.StateVersion > state.StateVersion);
        Assert.False(after.OperationInProgress);
        Assert.Equal("external_inference_disabled", after.LastError);
    }

    [Fact]
    public async Task InitialGetIsStableAndMediaBytesAreExact()
    {
        using var factory = Factory(); using var client = Client(factory);
        var first = await Get(client); var second = await Get(client);
        Assert.Equal(first.SessionId, second.SessionId);
        Assert.Equal(first.Candidate!.CandidateId, second.Candidate!.CandidateId);
        Assert.Equal(1, first.RevisionCount);
        Assert.Equal("automatic", first.Candidate!.Mode);
        Assert.Equal("pending", first.Candidate!.Status);
        Assert.Null(first.ActiveApproval);
        var bytes = await client.GetByteArrayAsync(first.SourceUrl);
        Assert.Equal(first.Source.Sha256, Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant());
        var mask = await client.GetByteArrayAsync(first.Candidate!.MaskUrl);
        Assert.Equal(File.ReadAllBytes(Path.Combine(Repo(), "apps/web/public/assets/personalization/tea-maker-101-blue-designable.png")), mask);
    }

    [Fact]
    public async Task InteractiveCreatesNewPendingCandidateAndPreservesApprovalLineageAndMask()
    {
        using var factory = Factory(); using var client = Client(factory);
        var first = await Get(client);
        var approvalResponse = await Decide(client, first, "approve"); approvalResponse.EnsureSuccessStatusCode();
        var approved = (await approvalResponse.Content.ReadFromJsonAsync<ReviewSnapshot>())!;
        Assert.Equal(DevelopmentSurfaceReview.Reviewer, approved.ActiveApproval!.Reviewer);
        var response = await client.PostAsJsonAsync(Root + "/revisions", Interactive(approved, new ReviewPoint(420, 920, "keep"), new ReviewPoint(245, 730, "exclude")));
        response.EnsureSuccessStatusCode(); var next = (await response.Content.ReadFromJsonAsync<ReviewSnapshot>())!;
        Assert.NotEqual(first.Candidate!.RevisionId, next.Candidate!.RevisionId);
        Assert.NotEqual(first.Candidate!.CandidateId, next.Candidate!.CandidateId);
        Assert.Equal("pending", next.Candidate!.Status);
        Assert.Equal(first.Candidate!.CandidateId, next.Candidate!.PreviousCandidateId);
        Assert.Equal(2, next.Candidate!.Points.Count);
        Assert.Equal(420, next.Candidate!.Points[0].X);
        Assert.Equal("exclude", next.Candidate!.Points[1].Intent);
        Assert.Equal(first.Candidate!.CandidateId, next.ActiveApproval!.CandidateId);
        Assert.Equal(await client.GetByteArrayAsync(first.Candidate!.MaskUrl), await client.GetByteArrayAsync(next.Candidate!.MaskUrl));
    }

    [Theory]
    [InlineData(-1, 920)] [InlineData(1066, 920)] [InlineData(420, 1600)] [InlineData(420, -1)]
    public async Task InvalidPointsReturn422WithoutNewRevision(double x, double y)
    {
        using var factory = Factory(); using var client = Client(factory); var state = await Get(client);
        await Problem(await client.PostAsJsonAsync(Root + "/revisions", Interactive(state, new ReviewPoint(x, y, "keep"))), HttpStatusCode.UnprocessableEntity);
        Assert.Equal(1, (await Get(client)).RevisionCount);
    }

    [Fact]
    public async Task EmptyInvalidIntentAndNonFinitePointsAreRejected()
    {
        using var factory = Factory(); using var client = Client(factory); var state = await Get(client);
        await Problem(await client.PostAsJsonAsync(Root + "/revisions", Interactive(state)), HttpStatusCode.UnprocessableEntity);
        await Problem(await client.PostAsJsonAsync(Root + "/revisions", Interactive(state, new ReviewPoint(420, 920, "bogus"))), HttpStatusCode.UnprocessableEntity);
        var request = JsonSerializer.Serialize(Interactive(state, new ReviewPoint(420, 920, "keep")), new JsonSerializerOptions(JsonSerializerDefaults.Web));
        foreach (var invalid in new[] { "NaN", "Infinity", "1e999" })
            await Problem(await client.PostAsync(Root + "/revisions", new StringContent(request.Replace("\"x\":420", $"\"x\":{invalid}"), Encoding.UTF8, "application/json")), invalid == "1e999" ? HttpStatusCode.UnprocessableEntity : HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData("approve", "approved")] [InlineData("reject", "rejected")]
    public async Task ExplicitDecisionsAreTerminal(string outcome, string status)
    {
        using var factory = Factory(); using var client = Client(factory); var state = await Get(client);
        (await Decide(client, state, outcome)).EnsureSuccessStatusCode(); var current = await Get(client);
        Assert.Equal(status, current.Candidate!.Status);
        if (outcome == "reject") Assert.Null(current.ActiveApproval);
        await Problem(await Decide(client, current, outcome), HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task StaleAndConcurrentMutationsCannotOverwriteNewerState()
    {
        using var factory = Factory(); using var client = Client(factory); var state = await Get(client);
        var request = new RevisionRequest(state.SessionId, state.StateVersion, "automatic", null, null, null);
        var responses = await Task.WhenAll(client.PostAsJsonAsync(Root + "/revisions", request), client.PostAsJsonAsync(Root + "/revisions", request));
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Conflict);
        await Problem(await Decide(client, state, "approve"), HttpStatusCode.Conflict);
        var current = await Get(client);
        await Problem(await client.PostAsJsonAsync(DecisionUrl(state), new DecisionRequest(current.SessionId, current.StateVersion, "approve")), HttpStatusCode.Conflict);
        Assert.Equal(2, current.RevisionCount);
    }

    [Fact]
    public async Task UnknownIdentityAndClientAuthoritativeFieldsAreRejected()
    {
        using var factory = Factory(); using var client = Client(factory); var state = await Get(client);
        var wrong = Root + $"/revisions/{Guid.NewGuid()}/candidates/{state.Candidate!.CandidateId}/review";
        await Problem(await client.PostAsJsonAsync(wrong, new DecisionRequest(state.SessionId, state.StateVersion, "approve")), HttpStatusCode.NotFound);
        await Problem(await client.GetAsync(Root + $"/revisions/{state.Candidate!.RevisionId}/candidates/{Guid.NewGuid()}/mask"), HttpStatusCode.NotFound);
        foreach (var field in new[] { "reviewer", "checksum", "sourceDimensions", "maskUrl", "variant", "product" })
        {
            var body = $"{{\"sessionId\":\"{state.SessionId}\",\"expectedStateVersion\":{state.StateVersion},\"outcome\":\"approve\",\"{field}\":\"untrusted\"}}";
            await Problem(await client.PostAsync(DecisionUrl(state), new StringContent(body, Encoding.UTF8, "application/json")), HttpStatusCode.BadRequest);
        }
        await Problem(await client.GetAsync(Root.Replace("tea-maker-101-blue", "tea-maker-101-gray") + "/review"), HttpStatusCode.NotFound);
        await Problem(await client.GetAsync(Root.Replace("tea-maker-101-blue", "other-product") + "/review"), HttpStatusCode.NotFound);
        await Problem(await client.PostAsJsonAsync(DecisionUrl(state), new DecisionRequest(Guid.NewGuid(), state.StateVersion, "approve")), HttpStatusCode.Conflict);
    }

    [Theory]
    [InlineData(false, "Development")] [InlineData(true, "Production")]
    public async Task GateMustBeExplicitDevelopment(bool enabled, string environment)
    {
        using var factory = Factory(enabled, environment); using var client = Client(factory);
        await Problem(await client.GetAsync(Root + "/review"), HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task MutationRequiresLocalOrigin()
    {
        using var factory = Factory(); using var client = Client(factory); var state = await Get(client);
        client.DefaultRequestHeaders.Remove("Origin");
        await Problem(await Decide(client, state, "approve"), HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task SourceChangedOnDiskCannotBeReviewed()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "xinobi-surface-test-" + Guid.NewGuid());
        var relativeSource = "apps/web/public/assets/products/tea-maker-101-blue.webp";
        var relativeMask = "apps/web/public/assets/personalization/tea-maker-101-blue-designable.png";
        try
        {
            foreach (var relative in new[] { relativeSource, relativeMask })
            {
                Directory.CreateDirectory(Path.GetDirectoryName(Path.Combine(tempRoot, relative))!);
                File.Copy(Path.Combine(Repo(), relative), Path.Combine(tempRoot, relative));
            }
            using var factory = Factory(root: tempRoot); using var client = Client(factory); var state = await Get(client);
            File.Copy(Path.Combine(tempRoot, relativeMask), Path.Combine(tempRoot, relativeSource), true);
            await Problem(await Decide(client, state, "approve"), HttpStatusCode.Conflict);
            await Problem(await client.GetAsync(state.SourceUrl), HttpStatusCode.Conflict);
        }
        finally { if (Path.GetFullPath(tempRoot).StartsWith(Path.GetFullPath(Path.GetTempPath()), StringComparison.OrdinalIgnoreCase)) Directory.Delete(tempRoot, true); } // Only this uniquely-created test fixture directory.
    }
}
