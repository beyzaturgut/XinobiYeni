using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.DesignStudio;

namespace Xinobi.Architecture.Tests;
public sealed class DesignStudioTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-design-test-" + Guid.NewGuid());
    private readonly FakeImageProvider provider = new();
    private WebApplicationFactory<Program> Factory(int limit = 30, bool disableLimit = false, IArtworkInspector? inspector = null) => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["DesignStudio:WorkerEnabled"] = "true", ["DesignStudio:ExternalInferenceEnabled"] = "false", ["LocalCommerce:DataDirectory"] = directory, ["DesignStudio:DailyGenerationLimit"] = limit.ToString(), ["DesignStudio:DisableGenerationLimit"] = disableLimit.ToString() }));
        builder.ConfigureServices((context, services) => { context.Configuration["DesignStudio:DataDirectory"] = Path.Combine(directory, "design-studio"); services.RemoveAll<IImageGenerationProvider>(); services.AddSingleton<IImageGenerationProvider>(provider); if (inspector is not null) { services.RemoveAll<IArtworkInspector>(); services.AddSingleton<IArtworkInspector>(inspector); } services.AddHostedService<DesignGenerationWorker>(); });
    });
    private const string Root = "/api/v1/design-studio";
    private async Task<SessionView> Create(HttpClient client, string? browser = null)
    {
        var response = await client.PostAsJsonAsync(Root + "/sessions", new CreateDesignSession("DEMO-P101", "DEMO-V101-B", browser ?? Guid.NewGuid().ToString()));
        response.EnsureSuccessStatusCode(); return (await response.Content.ReadFromJsonAsync<SessionView>())!;
    }
    private static GenerateDesignRequest Answers(SessionView session) => new(session.Questions.Select(q => new DesignAnswer(q.Id, q.Options[0].Id)).ToArray());
    private static async Task<SessionView> WaitReady(HttpClient client, SessionView session)
    {
        for (var attempt = 0; attempt < 100; attempt++)
        {
            var current = (await client.GetFromJsonAsync<SessionView>(Root + "/sessions/" + session.Id))!;
            if (current.Status == "ready") return current;
            Assert.NotEqual("failed", current.Status);
            await Task.Delay(30);
        }
        throw new TimeoutException("Test image job did not complete.");
    }
    [Fact]
    public async Task DevelopmentCanDisableDailyCapWithoutRemovingUsageOrIdempotency()
    {
        using var factory = Factory(1, true); using var client = factory.CreateClient();
        var first = await Create(client);
        (await client.PostAsJsonAsync(Root + "/sessions/" + first.Id + "/generation", Answers(first))).EnsureSuccessStatusCode();
        await WaitReady(client, first);
        var second = await Create(client);
        (await client.PostAsJsonAsync(Root + "/sessions/" + second.Id + "/generation", Answers(second))).EnsureSuccessStatusCode();
        await WaitReady(client, second);
        (await client.PostAsJsonAsync(Root + "/sessions/" + second.Id + "/generation", Answers(second))).EnsureSuccessStatusCode();
        Assert.Equal(2, provider.Calls);
        Assert.NotNull(await client.GetFromJsonAsync<SessionView>(Root + "/sessions/" + first.Id));
    }
    [Fact]
    public async Task BankHas500QuestionsAndSessionsCoverEveryAxisWithFourChoices()
    {
        using var factory = Factory(); using var client = factory.CreateClient();
        var bank = factory.Services.GetRequiredService<QuestionBank>();
        Assert.Equal(500, bank.Data.Questions.Length);
        var browser = Guid.NewGuid().ToString();
        var first = await Create(client, browser); var second = await Create(client, browser);
        Assert.Equal(5, first.Questions.Length);
        Assert.Equal(5, first.Questions.Select(q => q.Axis).Distinct().Count());
        Assert.All(first.Questions, q => { Assert.Equal(4, q.Options.Length); Assert.Equal(4, q.Options.Select(o => o.Label).Distinct().Count()); });
        Assert.Empty(first.Questions.Select(q => q.Id).Intersect(second.Questions.Select(q => q.Id)));
        var labels = new Dictionary<string, string>();
        var initial = bank.Draw([], labels);
        var original = new Dictionary<string, string>(labels);
        // Force the same question per axis; wording changes for any repeated semantic choice.
        var exclude = bank.Data.Questions.Where(q => !initial.Any(selected => selected.Id == q.Id)).Select(q => q.Id).ToArray();
        var repeated = bank.Draw(exclude, labels);
        Assert.All(repeated.SelectMany(q => q.Options.Select(o => new { Key = q.Id + ":" + o.Id, o.Label })), option => { if (original.TryGetValue(option.Key, out var prior)) Assert.NotEqual(prior, option.Label); });
        Assert.Equal(0, provider.Calls);
    }
    [Fact]
    public async Task InvalidAnswersCannotGenerateAndRepeatedRequestsAreIdempotent()
    {
        using var factory = Factory(); using var client = factory.CreateClient();
        var session = await Create(client);
        var invalid = Answers(session).Answers.ToArray(); invalid[0] = invalid[0] with { OptionId = "ignore-rules" };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", new GenerateDesignRequest(invalid))).StatusCode);
        Assert.Equal(0, provider.Calls);
        var requests = Enumerable.Range(0, 5).Select(_ => client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", Answers(session)));
        foreach (var result in await Task.WhenAll(requests)) result.EnsureSuccessStatusCode();
        var ready = await WaitReady(client, session);
        Assert.Equal(1, provider.Calls);
        Assert.Equal(session.Variant.Id, ready.Variant.Id);
        var bank = factory.Services.GetRequiredService<QuestionBank>();
        Assert.Equal(bank.BuildPrompt(session.Questions, Answers(session).Answers), provider.LastPrompt);
        Assert.Contains("Art direction:", provider.LastPrompt!);
        Assert.DoesNotContain("Xinobi", provider.LastPrompt!);
        Assert.Contains("composed exclusively of the selected nature motifs", provider.LastPrompt!);
        Assert.Contains("Composition:", provider.LastPrompt!);
        using var stored = JsonDocument.Parse(await File.ReadAllTextAsync(Path.Combine(directory, "design-studio", "sessions.json")));
        var savedSession = stored.RootElement.GetProperty("sessions").GetProperty(session.Id);
        Assert.Equal(DesignArtDirection.Version, savedSession.GetProperty("generationPromptVersion").GetString());
        Assert.Equal(provider.LastPrompt, savedSession.GetProperty("generationPrompt").GetString());
        Assert.NotNull(ready.ImageUrl);
        Assert.Equal(FakeImageProvider.Png, await client.GetByteArrayAsync(ready.ImageUrl));
        var changed = Answers(session).Answers.ToArray(); changed[0] = changed[0] with { OptionId = session.Questions[0].Options[1].Id };
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", new GenerateDesignRequest(changed))).StatusCode);
        Assert.Equal(1, provider.Calls);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Root + "/sessions/" + new string('a', 64) + "/image")).StatusCode);
    }
    [Fact]
    public async Task MissingProviderAndDailyQuotaFailWithoutExtraCalls()
    {
        using var factory = Factory(1); using var client = factory.CreateClient();
        var first = await Create(client); provider.Configured = false;
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.PostAsJsonAsync(Root + "/sessions/" + first.Id + "/generation", Answers(first))).StatusCode);
        Assert.Equal(0, provider.Calls); provider.Configured = true;
        (await client.PostAsJsonAsync(Root + "/sessions/" + first.Id + "/generation", Answers(first))).EnsureSuccessStatusCode();
        await WaitReady(client, first);
        var second = await Create(client);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync(Root + "/sessions/" + second.Id + "/generation", Answers(second))).StatusCode);
        Assert.Equal(1, provider.Calls);
    }
    [Fact]
    public async Task CompletedResultSurvivesServerRestartWithoutNewProviderCall()
    {
        SessionView ready;
        using (var factory = Factory())
        using (var client = factory.CreateClient())
        {
            var session = await Create(client);
            (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", Answers(session))).EnsureSuccessStatusCode();
            ready = await WaitReady(client, session);
        }
        using var restarted = Factory(); using var second = restarted.CreateClient();
        var restored = (await second.GetFromJsonAsync<SessionView>(Root + "/sessions/" + ready.Id))!;
        Assert.Equal("ready", restored.Status);
        Assert.Equal(FakeImageProvider.Png, await second.GetByteArrayAsync(restored.ImageUrl));
        (await second.PostAsJsonAsync(Root + "/sessions/" + ready.Id + "/generation", Answers(ready))).EnsureSuccessStatusCode();
        Assert.Equal(1, provider.Calls);
    }

    [Fact]
    public async Task IneligibleProductAndWrongVariantAreRejected()
    {
        using var factory = Factory(); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(Root + "/sessions", new CreateDesignSession("DEMO-P103", "DEMO-V103-W", Guid.NewGuid().ToString()))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(Root + "/sessions", new CreateDesignSession("DEMO-P101", "DEMO-V102-R", Guid.NewGuid().ToString()))).StatusCode);
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
    [Theory]
    [InlineData(false, false, 1, "ready")]
    [InlineData(true, false, 2, "ready")]
    [InlineData(true, true, 2, "failed")]
    public async Task OnlyInspectedCleanOutputCanBePublishedAndRetryIsBounded(bool first, bool second, int expectedCalls, string expectedStatus)
    {
        var inspector = new SequenceInspector(first, second);
        using var factory = Factory(inspector: inspector); using var client = factory.CreateClient();
        var session = await Create(client);
        (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", Answers(session))).EnsureSuccessStatusCode();
        SessionView current = session;
        for (var attempt = 0; attempt < 100; attempt++)
        {
            current = (await client.GetFromJsonAsync<SessionView>(Root + "/sessions/" + session.Id))!;
            if (current.Status is "ready" or "failed") break;
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Root + "/sessions/" + session.Id + "/image")).StatusCode);
            await Task.Delay(30);
        }
        Assert.Equal(expectedStatus, current.Status); Assert.Equal(expectedCalls, provider.Calls);
        Assert.Equal(expectedCalls, inspector.Calls);
        if (expectedStatus == "failed")
        {
            Assert.Equal("artwork_rejected", current.ErrorCode); Assert.Null(current.ImageUrl);
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Root + "/sessions/" + session.Id + "/image")).StatusCode);
            Assert.False(Directory.Exists(Path.Combine(directory, "design-studio", "assets")));
        }
        (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", Answers(session))).EnsureSuccessStatusCode();
        Assert.Equal(expectedCalls, provider.Calls);
    }
    [Fact]
    public async Task UnavailableOcrBlocksGenerationBeforeSpendingAProviderCall()
    {
        using var factory = Factory(inspector: new MissingInspector()); using var client = factory.CreateClient();
        var session = await Create(client);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", Answers(session))).StatusCode);
        Assert.Equal(0, provider.Calls);
    }
    [Fact]
    public async Task RuntimeOcrFailurePublishesNothingAndDoesNotRegenerate()
    {
        using var factory = Factory(inspector: new FailingInspector()); using var client = factory.CreateClient();
        var session = await Create(client);
        (await client.PostAsJsonAsync(Root + "/sessions/" + session.Id + "/generation", Answers(session))).EnsureSuccessStatusCode();
        SessionView current = session;
        for (var attempt = 0; attempt < 100; attempt++)
        {
            current = (await client.GetFromJsonAsync<SessionView>(Root + "/sessions/" + session.Id))!;
            if (current.Status == "failed") break;
            await Task.Delay(30);
        }
        Assert.Equal("failed", current.Status); Assert.Equal("artwork_review_unavailable", current.ErrorCode);
        Assert.Equal(1, provider.Calls); Assert.Null(current.ImageUrl);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Root + "/sessions/" + session.Id + "/image")).StatusCode);
        Assert.False(Directory.Exists(Path.Combine(directory, "design-studio", "assets")));
    }
    private sealed class FailingInspector : IArtworkInspector
    {
        public bool IsConfigured => true;
        public Task<ArtworkInspection> InspectAsync(GeneratedImage image, CancellationToken token) => throw new DesignProviderException("artwork_review_unavailable", "Yerel OCR kullanılamıyor.");
    }
    private sealed class MissingInspector : IArtworkInspector
    {
        public bool IsConfigured => false;
        public Task<ArtworkInspection> InspectAsync(GeneratedImage image, CancellationToken token) => throw new InvalidOperationException();
    }
    private sealed class SequenceInspector(bool first, bool second) : IArtworkInspector
    {
        public int Calls;
        public bool IsConfigured => true;
        public Task<ArtworkInspection> InspectAsync(GeneratedImage image, CancellationToken token)
        {
            var rejected = ++Calls == 1 ? first : second;
            return Task.FromResult(new ArtworkInspection(rejected, rejected ? 1 : 0));
        }
    }
    private sealed class FakeImageProvider : IImageGenerationProvider
    {
        public static byte[] Png => Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");
        public string? LastPrompt; public int Calls; public bool Configured = true; public bool IsConfigured => Configured;
        public async Task<GeneratedImage> GenerateAsync(string prompt, CancellationToken token) { LastPrompt = prompt; Interlocked.Increment(ref Calls); Assert.Contains("Text-free, unlettered, unbranded", prompt); await Task.Delay(50, token); return new(Png, "image/png", "test-provider", "test-request"); }
    }
}
