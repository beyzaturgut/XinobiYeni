using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Assistant;

/// <summary>
/// Nobi's data: policy revisions, knowledge sources, conversations (kept <see cref="RetentionDays"/> days, personal numbers masked),
/// leads and model usage. Development file store (ADR-003); 503 elsewhere until SQL Server. Retention and texts await D10.
/// </summary>
public sealed partial class AssistantStore(IWebHostEnvironment environment, IConfiguration configuration, TimeProvider clock)
{
    public const int RetentionDays = 90;
    public const int MaxMessageLength = 500;
    private sealed record State(List<AssistantPolicy> Policies, List<KnowledgeSource> Knowledge, List<AssistantConversation> Conversations, List<AssistantLead> Leads, List<AiUsageEntry> Usage);
    private readonly DevJsonStore<State> store = new(DevJsonStore<State>.DataDirectory(environment, configuration), Path.Combine("assistant", "assistant.json"), () => new([], [], [], [], []), "Nobi");

    public static readonly AssistantPolicy DefaultPolicy = new(1,
        """
        Sen Xinobi'nin satış asistanı Nobi'sin. Xinobi çay makineleri, kahve makineleri, hava temizleyiciler ve pişirme ürünleri satar; XINOBI U ile ürünler kişiye özel tasarlanabilir.
        Kurallar:
        - Yalnız Türkçe, sıcak ve kısa yanıt ver (en fazla 120 kelime).
        - Yalnız sana verilen ÜRÜNLER ve BİLGİ bölümündeki bilgileri kullan. Orada olmayan özellik, fiyat, stok, kampanya veya teslim tarihi uydurma.
        - Fiyat ve stok anlıktır; kesin teslim tarihi veya stok vaadi verme, sepette doğrulanacağını söyle.
        - Bir ürün önerdiğinde adının hemen ardından kimliğini [P:ürün-kimliği] biçiminde yaz.
        - Bilmediğin konuda bunu açıkça söyle ve canlı desteğe veya kurumsal teklif formuna yönlendir.
        - Sipariş, ödeme, iptal veya iade işlemi yapamazsın; müşteriyi Hesabım > Siparişlerim sayfasına yönlendir.
        - Kişisel, finansal veya sağlık bilgisi isteme.
        """,
        "Merhaba, ben Nobi. Size nasıl yardımcı olabilirim?",
        ["Çay makinesi öner", "Ürünleri karşılaştır", "XINOBI U nedir?", "Kurumsal teklif almak istiyorum"],
        200, 30, "@cf/meta/llama-3.1-8b-instruct", 0.3, null, null, null, "İlk sürüm", DateTimeOffset.UnixEpoch);

    public static string HashClient(string clientId) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes("xinobi-nobi:" + clientId)))[..32];

    /// <summary>Masks long digit runs (cards, ID numbers, phones) and e-mail addresses before a message is stored.</summary>
    public static string Mask(string text) => EmailPattern().Replace(DigitsPattern().Replace(text, match => new string('•', match.Length)), "•••@•••");

    public async Task<AssistantPolicy> Policy() => (await store.Read()).Policies.LastOrDefault() ?? DefaultPolicy;
    public async Task<AssistantPolicy[]> Policies() { var list = (await store.Read()).Policies; return list.Count == 0 ? [DefaultPolicy] : [.. list]; }

    public Task<AssistantPolicy> SavePolicy(SaveAssistantPolicy request) => store.Update(state =>
    {
        var current = state.Policies.LastOrDefault() ?? DefaultPolicy;
        if (request.BaseRevision != current.Revision) throw new ProblemException("stale_policy", "Bu arada yeni bir sürüm kaydedildi. Sayfayı yenileyip tekrar dene.", StatusCodes.Status409Conflict);
        string Required(string? value, int min, int max, string message) => value?.Trim() is { } text && text.Length >= min && text.Length <= max ? text : throw new ProblemException("invalid_policy", message);
        var replies = (request.QuickReplies ?? []).Select(item => item?.Trim() ?? "").Where(item => item.Length > 0).ToArray();
        if (replies.Length > 6 || replies.Any(item => item.Length > 60)) throw new ProblemException("invalid_policy", "En fazla 6 hızlı yanıt, her biri en fazla 60 karakter.");
        if (request.DailyAiLimit is < 0 or > 5000) throw new ProblemException("invalid_policy", "Günlük AI yanıt sınırı 0–5000 olmalı (0 yalnız kural tabanlı yanıt).");
        if (request.MaxMessagesPerConversation is < 5 or > 200) throw new ProblemException("invalid_policy", "Konuşma başına mesaj sınırı 5–200 olmalı.");
        if (request.Temperature is < 0 or > 1) throw new ProblemException("invalid_policy", "Sıcaklık 0 ile 1 arasında olmalı.");
        if (!ModelPattern().IsMatch(request.Model ?? "")) throw new ProblemException("invalid_policy", "Model adı @cf/üretici/model biçiminde olmalı.");
        string? whatsapp = null;
        if (!string.IsNullOrWhiteSpace(request.WhatsAppNumber))
        {
            var digits = new string(request.WhatsAppNumber.Where(char.IsDigit).ToArray());
            whatsapp = digits.Length is >= 10 and <= 15 ? digits : throw new ProblemException("invalid_policy", "WhatsApp numarasını ülke koduyla gir (ör. 905321234567).");
        }
        if (request.InputCostPerMillionTokens is < 0 || request.OutputCostPerMillionTokens is < 0) throw new ProblemException("invalid_policy", "Birim maliyet negatif olamaz.");
        var policy = new AssistantPolicy(current.Revision + 1, Required(request.SystemPrompt, 50, 6000, "Yönerge 50–6000 karakter olmalı."), Required(request.Greeting, 5, 200, "Karşılama 5–200 karakter olmalı."),
            replies, request.DailyAiLimit, request.MaxMessagesPerConversation, request.Model!, request.Temperature, whatsapp, request.InputCostPerMillionTokens, request.OutputCostPerMillionTokens,
            Required(request.Reason, 3, 300, "Değişiklik gerekçesi yaz (3–300 karakter)."), clock.GetUtcNow());
        state.Policies.Add(policy);
        return policy;
    });

    public async Task<KnowledgeSource[]> Knowledge() => [.. (await store.Read()).Knowledge.OrderByDescending(item => item.UpdatedAt)];

    /// <summary>Approved sources that are still valid today.</summary>
    public async Task<KnowledgeSource[]> UsableKnowledge()
    {
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        return [.. (await store.Read()).Knowledge.Where(item => item.Status == KnowledgeStatuses.Approved && (item.ValidUntil is null || item.ValidUntil >= today))];
    }

    private static (string Title, string Body, string[] Keywords) ValidKnowledge(SaveKnowledgeSource request)
    {
        var title = request.Title?.Trim() ?? "";
        var body = request.Body?.Trim() ?? "";
        if (title.Length is < 3 or > 120) throw new ProblemException("invalid_source", "Başlık 3–120 karakter olmalı.");
        if (body.Length is < 20 or > 4000) throw new ProblemException("invalid_source", "Metin 20–4000 karakter olmalı.");
        var keywords = (request.Keywords ?? []).Select(item => item?.Trim().ToLowerInvariant() ?? "").Where(item => item.Length > 1).Distinct().Take(20).ToArray();
        return (title, body, keywords);
    }

    public Task<KnowledgeSource> SaveKnowledge(string? id, SaveKnowledgeSource request)
    {
        var (title, body, keywords) = ValidKnowledge(request);
        return store.Update(state =>
        {
            var now = clock.GetUtcNow();
            var index = id is null ? -1 : state.Knowledge.FindIndex(item => item.Id == id);
            if (id is not null && index < 0) throw ProblemException.NotFound("source_not_found", "Kaynak bulunamadı.");
            // Any edit sends the source back to draft; only an approved version is ever used.
            var source = new KnowledgeSource(id ?? Guid.NewGuid().ToString("N"), title, body, keywords, KnowledgeStatuses.Draft, request.ValidUntil, index < 0 ? 1 : state.Knowledge[index].Version + 1, now);
            if (index < 0) state.Knowledge.Add(source); else state.Knowledge[index] = source;
            return source;
        });
    }

    public Task<KnowledgeSource> SetKnowledgeStatus(string id, string status) => store.Update(state =>
    {
        if (status is not (KnowledgeStatuses.Draft or KnowledgeStatuses.Approved or KnowledgeStatuses.Archived)) throw new ProblemException("invalid_status", "Geçersiz durum.");
        var index = state.Knowledge.FindIndex(item => item.Id == id);
        if (index < 0) throw ProblemException.NotFound("source_not_found", "Kaynak bulunamadı.");
        return state.Knowledge[index] = state.Knowledge[index] with { Status = status, UpdatedAt = clock.GetUtcNow() };
    });

    /// <summary>The conversation when <paramref name="clientId"/> (or the signed-in account) owns it; null otherwise.</summary>
    public async Task<AssistantConversation?> Conversation(string id, string clientId, string? accountId) =>
        (await store.Read()).Conversations.FirstOrDefault(item => item.Id == id && (item.ClientHash == HashClient(clientId) || accountId is not null && item.AccountId == accountId));

    public async Task<int> AiCallsToday(string feature)
    {
        var today = clock.GetUtcNow().UtcDateTime.Date;
        return (await store.Read()).Usage.Count(item => item.Feature == feature && item.At.UtcDateTime.Date == today && item.Model != "rules");
    }

    public async Task<int> ClientMessagesToday(string clientId)
    {
        var hash = HashClient(clientId);
        var today = clock.GetUtcNow().UtcDateTime.Date;
        return (await store.Read()).Conversations.Where(item => item.ClientHash == hash).SelectMany(item => item.Messages)
            .Count(message => message.Role == "user" && message.At.UtcDateTime.Date == today);
    }

    /// <summary>Appends the user's message and the reply; creates the conversation when <paramref name="conversationId"/> is null.</summary>
    public Task<AssistantConversation> Record(string? conversationId, string clientId, string? accountId, string channel, StoredAssistantMessage user, StoredAssistantMessage reply, AiUsageEntry usage) => store.Update(state =>
    {
        var now = clock.GetUtcNow();
        state.Conversations.RemoveAll(item => item.UpdatedAt < now.AddDays(-RetentionDays));
        state.Usage.RemoveAll(item => item.At < now.AddDays(-400));
        var hash = HashClient(clientId);
        AssistantConversation? conversation = null;
        if (conversationId is not null)
            conversation = state.Conversations.FirstOrDefault(item => item.Id == conversationId && (item.ClientHash == hash || accountId is not null && item.AccountId == accountId))
                ?? throw ProblemException.NotFound("conversation_not_found", "Konuşma bulunamadı.");
        if (conversation is null)
        {
            conversation = new AssistantConversation(Guid.NewGuid().ToString("N"), hash, accountId, channel is "mobile" ? "mobile" : "web", now, now, []);
            state.Conversations.Add(conversation);
        }
        var index = state.Conversations.IndexOf(conversation);
        conversation.Messages.Add(user with { Text = Mask(user.Text) });
        conversation.Messages.Add(reply);
        state.Conversations[index] = conversation with { UpdatedAt = now, AccountId = conversation.AccountId ?? accountId };
        state.Usage.Add(usage with { ConversationId = conversation.Id });
        return state.Conversations[index];
    });

    public Task<AssistantLead> AddLead(string conversationId, string clientId, string? accountId, AssistantLeadRequest request)
    {
        if (!request.Consent) throw new ProblemException("consent_required", "Seninle iletişime geçebilmemiz için onay vermelisin.");
        var name = request.Name?.Trim() ?? "";
        if (name.Length is < 2 or > 80) throw new ProblemException("invalid_name", "Adını gir.");
        if (!MailAddress.TryCreate(request.Email?.Trim(), out var email)) throw new ProblemException("invalid_email", "Geçerli bir e-posta adresi gir.");
        var topic = request.Topic?.Trim() ?? "";
        if (topic.Length is < 3 or > 500) throw new ProblemException("invalid_topic", "Konuyu kısaca yaz (3–500 karakter).");
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim().Length <= 20 ? request.Phone.Trim() : throw new ProblemException("invalid_phone", "Telefon numarası çok uzun.");
        return store.Update(state =>
        {
            var hash = HashClient(clientId);
            var index = state.Conversations.FindIndex(item => item.Id == conversationId && (item.ClientHash == hash || accountId is not null && item.AccountId == accountId));
            if (index < 0) throw ProblemException.NotFound("conversation_not_found", "Konuşma bulunamadı.");
            if (state.Leads.Count(item => item.ConversationId == conversationId) >= 3) throw new ProblemException("lead_limit", "Bu konuşmadan zaten talep gönderdin.", StatusCodes.Status409Conflict);
            state.Conversations[index] = state.Conversations[index] with { LeadSent = true };
            var lead = new AssistantLead(Guid.NewGuid().ToString("N"), conversationId, name, email.Address.ToLowerInvariant(), phone, topic, clock.GetUtcNow(), LeadStatuses.New);
            state.Leads.Add(lead);
            return lead;
        });
    }

    public Task MarkHandoff(string conversationId, string clientId, string? accountId) => store.Update(state =>
    {
        var hash = HashClient(clientId);
        var index = state.Conversations.FindIndex(item => item.Id == conversationId && (item.ClientHash == hash || accountId is not null && item.AccountId == accountId));
        if (index < 0) throw ProblemException.NotFound("conversation_not_found", "Konuşma bulunamadı.");
        state.Conversations[index] = state.Conversations[index] with { HandedOff = true };
        return true;
    });

    public async Task<AssistantConversation[]> Conversations() => [.. (await store.Read()).Conversations.OrderByDescending(item => item.UpdatedAt).Take(300)];
    public async Task<AssistantLead[]> Leads() => [.. (await store.Read()).Leads.OrderByDescending(item => item.CreatedAt)];

    public Task<AssistantLead> SetLeadStatus(string id, SetLeadStatus request) => store.Update(state =>
    {
        if (request.Status is not (LeadStatuses.New or LeadStatuses.Contacted or LeadStatuses.Closed)) throw new ProblemException("invalid_status", "Geçersiz durum.");
        var index = state.Leads.FindIndex(item => item.Id == id);
        if (index < 0) throw ProblemException.NotFound("lead_not_found", "Talep bulunamadı.");
        var note = string.IsNullOrWhiteSpace(request.Note) ? state.Leads[index].Note : request.Note.Trim().Length <= 500 ? request.Note.Trim() : throw new ProblemException("invalid_note", "Not en fazla 500 karakter olabilir.");
        return state.Leads[index] = state.Leads[index] with { Status = request.Status, Note = note };
    });

    /// <summary>Daily usage per feature with cost estimated from the active policy's rates; <paramref name="extra"/> adds other AI features (XINOBI U images).</summary>
    public async Task<AiUsageReport> Usage(IEnumerable<AiUsageEntry> extra)
    {
        var state = await store.Read();
        var policy = state.Policies.LastOrDefault() ?? DefaultPolicy;
        var rates = policy.InputCostPerMillionTokens is not null || policy.OutputCostPerMillionTokens is not null;
        var days = state.Usage.Concat(extra).Where(item => item.Model != "rules")
            .GroupBy(item => (Day: DateOnly.FromDateTime(item.At.UtcDateTime), item.Feature))
            .Select(group => new AiUsageDay(group.Key.Day, group.Key.Feature, group.Count(), group.Count(item => !item.Success), group.Sum(item => item.InputTokens), group.Sum(item => item.OutputTokens),
                group.Key.Feature == "assistant" && rates
                    ? Math.Round(group.Sum(item => item.InputTokens) / 1_000_000m * (policy.InputCostPerMillionTokens ?? 0) + group.Sum(item => item.OutputTokens) / 1_000_000m * (policy.OutputCostPerMillionTokens ?? 0), 4)
                    : null))
            .OrderByDescending(day => day.Day).ThenBy(day => day.Feature).Take(120).ToArray();
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        return new AiUsageReport(days, days.Where(day => day.Day == today && day.Feature == "assistant").Sum(day => day.Calls), policy.DailyAiLimit, rates,
            "Tahmini maliyet, AI politikasındaki birim fiyatlarla hesaplanır; sağlayıcı faturası değildir. XINOBI U görsel üretimleri adet olarak gösterilir.");
    }

    [GeneratedRegex(@"\d[\d \-]{9,}\d")]
    private static partial Regex DigitsPattern();

    [GeneratedRegex(@"[^\s@]+@[^\s@]+\.[^\s@]+")]
    private static partial Regex EmailPattern();

    [GeneratedRegex("^@cf/[a-z0-9-]+/[a-z0-9.-]+$")]
    private static partial Regex ModelPattern();
}
