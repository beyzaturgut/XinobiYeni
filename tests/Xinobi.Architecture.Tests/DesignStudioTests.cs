using System.Net;
using System.Net.Http.Json;
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
    private WebApplicationFactory<Program> Factory(int limit = 30) => new IsolatedApiFactory().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["DesignStudio:WorkerEnabled"] = "true", ["DesignStudio:ExternalInferenceEnabled"] = "false", ["LocalCommerce:DataDirectory"] = directory, ["DesignStudio:DailyGenerationLimit"] = limit.ToString() }));
        builder.ConfigureServices(services => { services.RemoveAll<IImageGenerationProvider>(); services.AddSingleton<IImageGenerationProvider>(provider); services.AddHostedService<DesignGenerationWorker>(); });
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
    private sealed class FakeImageProvider : IImageGenerationProvider
    {
        public static byte[] Png => Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");
        public int Calls; public bool Configured = true; public bool IsConfigured => Configured;
        public async Task<GeneratedImage> GenerateAsync(string prompt, CancellationToken token) { Interlocked.Increment(ref Calls); Assert.Contains("No text", prompt); await Task.Delay(50, token); return new(Png, "image/png", "test-provider", "test-request"); }
    }
}
