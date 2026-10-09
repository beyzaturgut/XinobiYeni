using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Xinobi.Api.Catalog;
using Xinobi.Api.DesignStudio;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.Notifications;

namespace Xinobi.Api.Assistant;

public static class AssistantEndpoints
{
    public const string Disclaimer = "Nobi yapay zekâ destekli bir asistandır; yanıtlar hatalı olabilir. Fiyat ve stok sepette doğrulanır. Kişisel, kart veya kimlik bilgisi paylaşma; konuşmalar hizmet kalitesi için 90 gün saklanır.";

    private static async Task<string?> AccountId(HttpContext http)
    {
        var auth = await http.AuthenticateAsync(AccountTokenHandler.SchemeName);
        return auth.Succeeded ? auth.Principal.FindFirstValue(ClaimTypes.NameIdentifier) : null;
    }

    private static string Client(string? clientId) =>
        Guid.TryParse(clientId, out var id) ? id.ToString("D") : throw new ProblemException("invalid_client", "Geçerli bir cihaz kimliği gerekli.");

    public static void MapAssistant(this WebApplication app)
    {
        var assistant = app.MapGroup("/api/v1/assistant").WithTags("Assistant").AllowAnonymous().WithProblems();
        if (app.Environment.IsDevelopment()) assistant.RequireRateLimiting("DesignStudio");

        assistant.MapGet("/config", async (AssistantStore store, ITextModelProvider model) =>
            {
                var policy = await store.Policy();
                return TypedResults.Ok(new AssistantConfig(true, model.IsConfigured && policy.DailyAiLimit > 0, policy.Greeting, policy.QuickReplies, policy.WhatsAppNumber is not null, Disclaimer));
            })
            .WithName("GetAssistantConfig")
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        assistant.MapPost("/messages", async Task<Results<Ok<AssistantReply>, ProblemHttpResult>> (AssistantMessageRequest request, HttpContext http, AssistantStore store, AssistantEngine engine,
                ICatalogSource catalog, IConfiguration configuration, IWebHostEnvironment environment, CancellationToken cancellationToken) =>
            {
                var clientId = Client(request.ClientId);
                var message = request.Message?.Trim() ?? "";
                if (message.Length is < 1 or > AssistantStore.MaxMessageLength) throw new ProblemException("invalid_message", $"Mesajın 1–{AssistantStore.MaxMessageLength} karakter olmalı.");
                var accountId = await AccountId(http);
                var policy = await store.Policy();
                var conversation = request.ConversationId is null ? null : await store.Conversation(request.ConversationId, clientId, accountId)
                    ?? throw ProblemException.NotFound("conversation_not_found", "Konuşma bulunamadı.");
                var asked = conversation?.Messages.Count(item => item.Role == "user") ?? 0;
                if (asked >= policy.MaxMessagesPerConversation) throw new ProblemException("conversation_limit", "Bu konuşmada mesaj sınırına ulaştın. Yeni bir konuşma başlatabilir ya da ekibimize bağlanabilirsin.", StatusCodes.Status429TooManyRequests);
                if (await store.ClientMessagesToday(clientId) >= AssistantEngine.ClientDailyLimit) throw new ProblemException("daily_limit", "Bugün için mesaj sınırına ulaştın. Yarın tekrar yazabilirsin.", StatusCodes.Status429TooManyRequests);
                CommerceState state;
                try { state = await catalog.ReadAsync(); }
                catch (CatalogUnavailableException) { throw ProblemException.Unavailable("Katalog"); }
                var (reply, usage) = await engine.Answer(state, message, conversation?.Messages ?? [], policy, cancellationToken);
                var user = new StoredAssistantMessage(Guid.NewGuid().ToString("N"), "user", message, [], [], DateTimeOffset.UtcNow, null);
                var saved = await store.Record(conversation?.Id, clientId, accountId, request.Channel ?? "web", user, reply, usage);
                var projection = await CatalogEndpoints.Project(http, catalog, configuration, environment);
                return TypedResults.Ok(new AssistantReply(saved.Id, View(reply, state, projection), policy.MaxMessagesPerConversation - asked - 1));
            })
            .WithName("SendAssistantMessage")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        assistant.MapGet("/conversations/{id}", async Task<Results<Ok<AssistantConversationView>, ProblemHttpResult>> (string id, string clientId, HttpContext http, AssistantStore store,
                ICatalogSource catalog, IConfiguration configuration, IWebHostEnvironment environment) =>
            {
                var conversation = await store.Conversation(id, Client(clientId), await AccountId(http)) ?? throw ProblemException.NotFound("conversation_not_found", "Konuşma bulunamadı.");
                var state = await catalog.ReadAsync();
                var projection = await CatalogEndpoints.Project(http, catalog, configuration, environment);
                return TypedResults.Ok(new AssistantConversationView(conversation.Id, [.. conversation.Messages.Select(message => View(message, state, projection))], conversation.LeadSent, conversation.HandedOff));
            })
            .WithName("GetAssistantConversation")
            .ProducesProblem(StatusCodes.Status404NotFound);

        assistant.MapPost("/conversations/{id}/lead", async Task<Results<Ok<AssistantLead>, ProblemHttpResult>> (string id, AssistantLeadRequest request, HttpContext http, AssistantStore store, NotificationCenter notifications) =>
            {
                var lead = await store.AddLead(id, Client(request.ClientId), await AccountId(http), request);
                await notifications.NotifyGuest(lead.Email, "assistant_lead", "Talebini aldık", "Nobi üzerinden bıraktığın talebi aldık; ekibimiz en kısa sürede seninle iletişime geçecek.", null);
                return TypedResults.Ok(lead);
            })
            .WithName("SendAssistantLead")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        assistant.MapPost("/conversations/{id}/handoff", async Task<Results<Ok<AssistantHandoff>, ProblemHttpResult>> (string id, AssistantHandoffRequest request, HttpContext http, AssistantStore store) =>
            {
                await store.MarkHandoff(id, Client(request.ClientId), await AccountId(http));
                var policy = await store.Policy();
                var text = Uri.EscapeDataString($"Merhaba, Xinobi Nobi asistanından geliyorum. Konuşma kodum: {id[..8].ToUpperInvariant()}");
                return TypedResults.Ok(policy.WhatsAppNumber is { } number
                    ? new AssistantHandoff("whatsapp", $"https://wa.me/{number}?text={text}", "WhatsApp'ta ekibimize bağlanabilirsin. Konuşma kodun mesaja eklendi.")
                    : new AssistantHandoff("lead", null, "Canlı destek hattı henüz tanımlanmadı. İletişim bilgilerini bırakırsan ekibimiz sana dönecek."));
            })
            .WithName("RequestAssistantHandoff")
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static AssistantMessage View(StoredAssistantMessage message, CommerceState state, CatalogProjection projection) => new(
        message.Id, message.Role, message.Text,
        [.. message.ProductIds.Select(id => state.Products.FirstOrDefault(product => product.Id == id && product.Active)).OfType<CommerceProduct>()
            .Select(projection.Summary).Select(summary => new AssistantProduct(summary.Id, summary.Name, summary.Category, summary.ImageUrl, summary.PriceFrom, summary.InStock, summary.Personalizable))],
        message.Actions, message.At, message.Source);

    public static void MapPanelAssistant(RouteGroupBuilder panel)
    {
        panel.MapGet("/assistant/policies", async (AssistantStore store, ITextModelProvider model) => TypedResults.Ok(new { modelConfigured = model.IsConfigured, items = await store.Policies() }));
        panel.MapPost("/assistant/policies", async (SaveAssistantPolicy request, AssistantStore store) => TypedResults.Ok(await store.SavePolicy(request)));
        panel.MapGet("/assistant/knowledge", async (AssistantStore store) => TypedResults.Ok(await store.Knowledge()));
        panel.MapPost("/assistant/knowledge", async (SaveKnowledgeSource request, AssistantStore store) => TypedResults.Ok(await store.SaveKnowledge(null, request)));
        panel.MapPut("/assistant/knowledge/{id}", async (string id, SaveKnowledgeSource request, AssistantStore store) => TypedResults.Ok(await store.SaveKnowledge(id, request)));
        panel.MapPost("/assistant/knowledge/{id}/status", async (string id, SetKnowledgeStatus request, AssistantStore store) => TypedResults.Ok(await store.SetKnowledgeStatus(id, request.Status)));
        panel.MapGet("/assistant/conversations", async (AssistantStore store) => TypedResults.Ok(await store.Conversations()));
        panel.MapGet("/assistant/leads", async (AssistantStore store) => TypedResults.Ok(await store.Leads()));
        panel.MapPost("/assistant/leads/{id}/status", async (string id, SetLeadStatus request, AssistantStore store) => TypedResults.Ok(await store.SetLeadStatus(id, request)));
        // XINOBI U image generations count as AI usage too (one call each, no tokens).
        panel.MapGet("/assistant/usage", async (HttpContext http, AssistantStore store) =>
        {
            var sessions = http.RequestServices.GetService<DesignSessionStore>();
            var images = sessions is null ? [] : (await sessions.Generations()).Select(item => new AiUsageEntry(item.At, "xinobi_u", item.Model, 0, 0, item.Success, item.Error, null));
            return TypedResults.Ok(await store.Usage(images));
        });
    }
}
