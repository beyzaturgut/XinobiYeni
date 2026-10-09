using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Assistant;

namespace Xinobi.Architecture.Tests;

/// <summary>Nobi: catalogue-grounded answers, rules fallback, limits, ownership, leads and the panel's policy and knowledge. No real model is called.</summary>
public sealed class AssistantTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-assistant-test-" + Guid.NewGuid());
    private readonly FakeModel model = new();
    private static readonly string Client = Guid.NewGuid().ToString();

    private WebApplicationFactory<Program> Factory() => new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Notifications:WorkerEnabled", "false");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }));
        builder.ConfigureServices(services => { services.RemoveAll<ITextModelProvider>(); services.AddSingleton<ITextModelProvider>(model); });
    });

    private sealed class FakeModel : ITextModelProvider
    {
        public bool Configured;
        public string Answer = "Size Çay Makinesi 101 [P:DEMO-P101] uygun olur, bir de [P:UYDURMA] var.";
        public List<IReadOnlyList<ChatTurn>> Calls = [];
        public bool IsConfigured => Configured;
        public Task<ModelAnswer> CompleteAsync(string model, IReadOnlyList<ChatTurn> messages, double temperature, CancellationToken cancellationToken)
        {
            Calls.Add(messages);
            return Task.FromResult(new ModelAnswer(Answer, model, 120, 40));
        }
    }

    private static async Task<T> Read<T>(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    private static Task<HttpResponseMessage> Ask(HttpClient client, string message, string? conversation = null, string? clientId = null) =>
        client.PostAsJsonAsync("/api/v1/assistant/messages", new AssistantMessageRequest(conversation, clientId ?? Client, message, "web"));

    [Fact]
    public void IntentsBudgetsAndMaskingAreDetected()
    {
        Assert.Contains(AssistantEngine.Intent.Compare, AssistantEngine.Intents("Bu ikisini KARŞILAŞTIR"));
        Assert.Contains(AssistantEngine.Intent.Quote, AssistantEngine.Intents("Şirketimiz için 50 adet lazım"));
        Assert.Contains(AssistantEngine.Intent.XinobiU, AssistantEngine.Intents("logolu kişiselleştirme"));
        Assert.Contains(AssistantEngine.Intent.Handoff, AssistantEngine.Intents("bir temsilciyle görüşmek istiyorum"));
        Assert.Equal(300_000, AssistantEngine.Budget("3.000 TL altında çay makinesi"));
        Assert.Equal(250_000, AssistantEngine.Budget("bütçem 2500"));
        Assert.Null(AssistantEngine.Budget("çay makinesi"));
        Assert.Equal("cay makinesi", AssistantEngine.Fold("Çay Makinesi"));
        Assert.Equal("Kartım •••••••••••••••• ve •••@•••", AssistantStore.Mask("Kartım 4111111111111111 ve ayse@example.com"));
    }

    [Fact]
    public async Task WithoutAModelNobiAnswersFromTheCatalogue()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var config = await Read<AssistantConfig>(await client.GetAsync("/api/v1/assistant/config"));
        Assert.False(config.AiAnswers);
        Assert.False(config.WhatsAppAvailable);

        var reply = await Read<AssistantReply>(await Ask(client, "Kahve ve çay makinesi önerir misin?"));
        Assert.Equal("rules", reply.Reply.Source);
        Assert.Contains(reply.Reply.Products, product => product.Id == "DEMO-P101");
        Assert.Contains(reply.Reply.Products, product => product.Id == "DEMO-P102");
        Assert.Equal(240_000, reply.Reply.Products.Single(product => product.Id == "DEMO-P101").PriceFrom!.AmountMinor);
        Assert.Contains(reply.Reply.Actions, action => action.Kind == "compare");
        Assert.DoesNotContain(reply.Reply.Products, product => product.Id == "DEMO-P103"); // inactive

        var budget = await Read<AssistantReply>(await Ask(client, "2500 TL altında çay makinesi", reply.ConversationId));
        Assert.Equal(["DEMO-P101"], budget.Reply.Products.Select(product => product.Id));

        // Only the device that started the conversation can read or continue it.
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/assistant/conversations/{reply.ConversationId}?clientId={Guid.NewGuid()}")).StatusCode);
        Assert.Equal("conversation_not_found", await Code(await Ask(client, "merhaba", reply.ConversationId, Guid.NewGuid().ToString())));
        var history = await Read<AssistantConversationView>(await client.GetAsync($"/api/v1/assistant/conversations/{reply.ConversationId}?clientId={Client}"));
        Assert.Equal(4, history.Messages.Length);

        var handoff = await Read<AssistantReply>(await Ask(client, "Bir temsilciyle görüşmek istiyorum", reply.ConversationId));
        Assert.Contains(handoff.Reply.Actions, action => action.Kind == "lead");
        var lead = await client.PostAsJsonAsync($"/api/v1/assistant/conversations/{reply.ConversationId}/lead", new AssistantLeadRequest(Client, "Ayşe", "ayse@example.com", null, "Toplu alım", false));
        Assert.Equal("consent_required", await Code(lead));
        await Read<AssistantLead>(await client.PostAsJsonAsync($"/api/v1/assistant/conversations/{reply.ConversationId}/lead", new AssistantLeadRequest(Client, "Ayşe", "ayse@example.com", null, "Toplu alım", true)));
        Assert.Single(await Read<AssistantLead[]>(await client.GetAsync("/api/v1/local-commerce/assistant/leads")));
        var route = await Read<AssistantHandoff>(await client.PostAsJsonAsync($"/api/v1/assistant/conversations/{reply.ConversationId}/handoff", new AssistantHandoffRequest(Client)));
        Assert.Equal("lead", route.Channel);
    }

    [Fact]
    public async Task TheModelPhrasesTheAnswerFromCheckedFactsOnly()
    {
        model.Configured = true;
        using var factory = Factory();
        using var client = factory.CreateClient();
        var reply = await Read<AssistantReply>(await Ask(client, "çay makinesi arıyorum"));
        Assert.Equal("ai", reply.Reply.Source);
        Assert.Equal(["DEMO-P101"], reply.Reply.Products.Select(product => product.Id));
        Assert.DoesNotContain("[P:", reply.Reply.Text);
        var system = model.Calls.Single()[0].Content;
        Assert.Contains("[P:DEMO-P101] Çay Makinesi 101", system);
        Assert.Contains("2.400,00 TL", system);
        Assert.DoesNotContain("Hava Temizleme 101", system);

        // The customer's message is stored masked; the model saw it as written.
        await Read<AssistantReply>(await Ask(client, "Kartım 4111 1111 1111 1111, çay makinesi", reply.ConversationId));
        var conversation = (await Read<AssistantConversation[]>(await client.GetAsync("/api/v1/local-commerce/assistant/conversations"))).Single();
        Assert.DoesNotContain("4111", string.Join(' ', conversation.Messages.Select(message => message.Text)));

        var usage = await Read<AiUsageReport>(await client.GetAsync("/api/v1/local-commerce/assistant/usage"));
        Assert.Equal(2, usage.AiCallsToday);
        Assert.Equal((240, 80), (usage.Days.Single().InputTokens, usage.Days.Single().OutputTokens));
        Assert.False(usage.CostRatesSet);

        // A limit of zero turns the model off; Nobi keeps answering from the catalogue.
        var current = (await Read<JsonElement>(await client.GetAsync("/api/v1/local-commerce/assistant/policies"))).GetProperty("items").EnumerateArray().Last();
        var stale = await client.PostAsJsonAsync("/api/v1/local-commerce/assistant/policies", Policy(99, 0));
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        await Read<AssistantPolicy>(await client.PostAsJsonAsync("/api/v1/local-commerce/assistant/policies", Policy(current.GetProperty("revision").GetInt32(), 0)));
        var rules = await Read<AssistantReply>(await Ask(client, "kahve makinesi"));
        Assert.Equal("rules", rules.Reply.Source);
        Assert.Equal(2, model.Calls.Count);
    }

    private static SaveAssistantPolicy Policy(int revision, int limit) => new(revision, AssistantStore.DefaultPolicy.SystemPrompt, "Merhaba, ben Nobi.", ["Çay makinesi öner"], limit, 30,
        "@cf/meta/llama-3.1-8b-instruct", 0.2, "0532 123 45 67", 1m, 2m, "Test");

    [Fact]
    public async Task OnlyApprovedKnowledgeIsUsed()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        var source = await Read<KnowledgeSource>(await client.PostAsJsonAsync("/api/v1/local-commerce/assistant/knowledge",
            new SaveKnowledgeSource("Garanti koşulları", "Tüm Xinobi ürünleri iki yıl üretici garantisi altındadır; fatura ile servise başvurulur.", ["garanti", "servis"], null)));
        Assert.DoesNotContain("iki yıl", (await Read<AssistantReply>(await Ask(client, "garanti süresi nedir?"))).Reply.Text);
        await Read<KnowledgeSource>(await client.PostAsJsonAsync($"/api/v1/local-commerce/assistant/knowledge/{source.Id}/status", new SetKnowledgeStatus(KnowledgeStatuses.Approved)));
        Assert.Contains("iki yıl", (await Read<AssistantReply>(await Ask(client, "garanti süresi nedir?"))).Reply.Text);
        // Editing sends it back to draft.
        await Read<KnowledgeSource>(await client.PutAsJsonAsync($"/api/v1/local-commerce/assistant/knowledge/{source.Id}",
            new SaveKnowledgeSource("Garanti koşulları", "Tüm Xinobi ürünleri üç yıl garanti altındadır; fatura ile servise başvurulur.", ["garanti"], null)));
        Assert.DoesNotContain("üç yıl", (await Read<AssistantReply>(await Ask(client, "garanti süresi nedir?"))).Reply.Text);
    }

    [Fact]
    public async Task MessagesAreValidated()
    {
        using var factory = Factory();
        using var client = factory.CreateClient();
        Assert.Equal("invalid_client", await Code(await Ask(client, "merhaba", clientId: "yok")));
        Assert.Equal("invalid_message", await Code(await Ask(client, new string('a', 501))));
        Assert.Equal("conversation_not_found", await Code(await Ask(client, "merhaba", "missing")));
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
