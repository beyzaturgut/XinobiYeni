using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.DesignStudio;
using Xinobi.Api.XinobiU;

namespace Xinobi.Architecture.Tests;

/// <summary>Public XINOBI U contract (/api/v1/xinobi-u) backed by the design session store; the provider is faked, no paid call is made.</summary>
public sealed class XinobiUTests : IDisposable
{
    private const string Root = "/api/v1/xinobi-u";
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-u-test-" + Guid.NewGuid());
    private readonly CountingProvider provider = new();

    private WebApplicationFactory<Program> Factory(string environment = "Development") => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment(environment);
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services => { services.RemoveAll<IImageGenerationProvider>(); services.AddSingleton<IImageGenerationProvider>(provider); });
    });

    private static async Task<XinobiUSession> Create(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(Root + "/sessions", new CreateXinobiUSession("DEMO-P101", "DEMO-V101-B", Guid.NewGuid().ToString()));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<XinobiUSession>())!;
    }

    private static XinobiUGenerationRequest FirstOptions(XinobiUSession session) =>
        new(session.Questions.Select(question => new XinobiUAnswer(question.Id, question.Options[0].Id)).ToArray());

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    [Fact]
    public async Task ProductionAnswersUnavailable()
    {
        using var factory = Factory("Production");
        using var client = factory.CreateClient();
        foreach (var response in new[]
                 {
                     await client.GetAsync(Root + "/status"),
                     await client.PostAsJsonAsync(Root + "/sessions", new CreateXinobiUSession("DEMO-P101", "DEMO-V101-B", Guid.NewGuid().ToString())),
                     await client.GetAsync(Root + "/sessions/abc"),
                 })
        {
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            Assert.Equal("xinobi_u_unavailable", await Code(response));
        }
        Assert.Equal(0, provider.Calls);
    }

    [Fact]
    public async Task TestServerServesXinobiUFromTheSnapshotWhenEnabled()
    {
        Directory.CreateDirectory(directory);
        var snapshot = Path.Combine(directory, "snapshot.json");
        await File.WriteAllTextAsync(snapshot, await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "../../../../../services/api/LocalCommerce/seed.json")));
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Production");
            builder.UseSetting("Catalog:SnapshotPath", snapshot);
            builder.UseSetting("Catalog:AssetBaseUrl", "http://web.test:8014");
            builder.UseSetting("XinobiU:Enabled", "true");
            builder.UseSetting("XinobiU:AllowedOrigins:0", "http://web.test:8014");
            builder.UseSetting("DesignStudio:DataDirectory", Path.Combine(directory, "design"));
            builder.ConfigureServices(services => { services.RemoveAll<IImageGenerationProvider>(); services.AddSingleton<IImageGenerationProvider>(provider); });
        });
        using var client = factory.CreateClient();

        Assert.Equal(500, (await client.GetFromJsonAsync<XinobiUStatus>(Root + "/status"))!.QuestionCount);
        var session = await Create(client);
        Assert.StartsWith("http://web.test:8014/assets/", session.Variant.ImageUrl);
        (await client.PostAsJsonAsync(Root + $"/sessions/{session.Id}/generation", FirstOptions(session))).EnsureSuccessStatusCode();
        XinobiUSession current = session;
        for (var attempt = 0; attempt < 100 && current.Status != XinobiUSessionStatuses.Ready; attempt++)
        {
            await Task.Delay(30);
            current = (await client.GetFromJsonAsync<XinobiUSession>(Root + "/sessions/" + session.Id))!;
        }
        Assert.Equal(XinobiUSessionStatuses.Ready, current.Status);
        Assert.True(File.Exists(Path.Combine(directory, "design", "sessions.json")));

        // The web (design-studio) shares the store; only the configured browser origin passes, with CORS.
        var allowed = new HttpRequestMessage(HttpMethod.Get, "/api/v1/design-studio/status") { Headers = { { "Origin", "http://web.test:8014" } } };
        var allowedResponse = await client.SendAsync(allowed);
        Assert.Equal(HttpStatusCode.OK, allowedResponse.StatusCode);
        Assert.Equal("http://web.test:8014", allowedResponse.Headers.GetValues("Access-Control-Allow-Origin").Single());
        var foreign = new HttpRequestMessage(HttpMethod.Get, Root + "/status") { Headers = { { "Origin", "https://evil.example" } } };
        Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAsync(foreign)).StatusCode);
        // Development-only commerce endpoints stay closed.
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/local-commerce/state")).StatusCode);
        Assert.Equal(1, provider.Calls);
    }

    [Fact]
    public async Task SessionCarriesFiveQuestionsAndAbsoluteVariantImage()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var status = (await client.GetFromJsonAsync<XinobiUStatus>(Root + "/status"))!;
        Assert.True(status.GenerationAvailable);
        Assert.Equal(500, status.QuestionCount);
        var session = await Create(client);
        Assert.Equal(XinobiUSessionStatuses.Questionnaire, session.Status);
        Assert.Equal(5, session.Questions.Length);
        Assert.All(session.Questions, question => Assert.Equal(4, question.Options.Length));
        Assert.Equal("DEMO-V101-B", session.Variant.Id);
        Assert.StartsWith("http://localhost:3000/assets/", session.Variant.ImageUrl);
        Assert.Null(session.ImageUrl);
        Assert.Equal(session.Id, (await client.GetFromJsonAsync<XinobiUSession>(Root + "/sessions/" + session.Id))!.Id);
    }

    [Fact]
    public async Task SessionWithoutColourUsesTheFirstPhotographedVariant()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        foreach (var variant in new string?[] { null, "" })
        {
            var response = await client.PostAsJsonAsync(Root + "/sessions", new CreateXinobiUSession("DEMO-P101", variant, Guid.NewGuid().ToString()));
            response.EnsureSuccessStatusCode();
            var session = (await response.Content.ReadFromJsonAsync<XinobiUSession>())!;
            Assert.Equal("DEMO-V101-B", session.Variant.Id);
            Assert.Equal(5, session.Questions.Length);
        }
        var unknown = await client.PostAsJsonAsync(Root + "/sessions", new CreateXinobiUSession("DEMO-P101", "missing", Guid.NewGuid().ToString()));
        Assert.Equal(HttpStatusCode.BadRequest, unknown.StatusCode);
    }

    [Fact]
    public async Task GenerationIsIdempotentAndServesTheImage()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var session = await Create(client);
        var answers = FirstOptions(session);
        (await client.PostAsJsonAsync(Root + $"/sessions/{session.Id}/generation", answers)).EnsureSuccessStatusCode();
        // A network retry with the same answers returns the same job without a second provider call.
        (await client.PostAsJsonAsync(Root + $"/sessions/{session.Id}/generation", answers)).EnsureSuccessStatusCode();
        XinobiUSession current = session;
        for (var attempt = 0; attempt < 100 && current.Status != XinobiUSessionStatuses.Ready; attempt++)
        {
            await Task.Delay(30);
            current = (await client.GetFromJsonAsync<XinobiUSession>(Root + "/sessions/" + session.Id))!;
            Assert.NotEqual(XinobiUSessionStatuses.Failed, current.Status);
        }
        Assert.Equal(XinobiUSessionStatuses.Ready, current.Status);
        Assert.Equal(1, provider.Calls);
        Assert.Equal($"http://localhost/api/v1/xinobi-u/sessions/{session.Id}/image", current.ImageUrl);
        var image = await client.GetAsync(new Uri(current.ImageUrl!).PathAndQuery);
        Assert.Equal("image/png", image.Content.Headers.ContentType?.MediaType);
        Assert.Equal(CountingProvider.Png, await image.Content.ReadAsByteArrayAsync());

        var changed = new XinobiUGenerationRequest(session.Questions.Select(question => new XinobiUAnswer(question.Id, question.Options[1].Id)).ToArray());
        var locked = await client.PostAsJsonAsync(Root + $"/sessions/{session.Id}/generation", changed);
        Assert.Equal(HttpStatusCode.Conflict, locked.StatusCode);
        Assert.Equal("answers_locked", await Code(locked));
        Assert.Equal(1, provider.Calls);
    }

    [Fact]
    public async Task InvalidRequestsUseProblemCodes()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var session = await Create(client);
        var partial = new XinobiUGenerationRequest(FirstOptions(session).Answers.Take(3).ToArray());
        var incomplete = await client.PostAsJsonAsync(Root + $"/sessions/{session.Id}/generation", partial);
        Assert.Equal(HttpStatusCode.BadRequest, incomplete.StatusCode);
        Assert.Equal("invalid_request", await Code(incomplete));
        var missing = await client.GetAsync(Root + "/sessions/" + new string('0', 64));
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal("session_expired", await Code(missing));
        var ineligible = await client.PostAsJsonAsync(Root + "/sessions", new CreateXinobiUSession("DEMO-P105", "DEMO-V105", Guid.NewGuid().ToString()));
        Assert.Equal(HttpStatusCode.BadRequest, ineligible.StatusCode);
        var badClient = await client.PostAsJsonAsync(Root + "/sessions", new CreateXinobiUSession("DEMO-P101", "DEMO-V101-B", "not-a-uuid"));
        Assert.Equal(HttpStatusCode.BadRequest, badClient.StatusCode);
        Assert.Equal(0, provider.Calls);
    }

    private sealed class CountingProvider : IImageGenerationProvider
    {
        public static byte[] Png => Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");
        public int Calls;
        public bool IsConfigured => true;
        public async Task<GeneratedImage> GenerateAsync(string prompt, CancellationToken token)
        {
            Interlocked.Increment(ref Calls);
            await Task.Delay(20, token);
            return new(Png, "image/png", "test-provider", "test-request");
        }
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, recursive: true);
    }
}
