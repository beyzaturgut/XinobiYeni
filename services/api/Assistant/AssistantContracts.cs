using Xinobi.Api.Catalog;

namespace Xinobi.Api.Assistant;

// Public contract of Nobi, the sales assistant (K-08/K-09, Faz10), shared by web and mobile.

public record AssistantConfig(bool Enabled, bool AiAnswers, string Greeting, string[] QuickReplies, bool WhatsAppAvailable, string Disclaimer);
/// <summary><paramref name="ClientId"/> is a random id the browser or app keeps; it ties an anonymous conversation to its device.</summary>
public record AssistantMessageRequest(string? ConversationId, string ClientId, string Message, string? Channel);
public record AssistantProduct(string Id, string Name, string Category, string? ImageUrl, Money? PriceFrom, bool InStock, bool Personalizable);
/// <summary><paramref name="Kind"/>: <c>compare</c> (ProductIds), <c>quote</c>, <c>xinobi_u</c>, <c>handoff</c>, <c>lead</c>, <c>orders</c> or <c>link</c> (Url).</summary>
public record AssistantAction(string Kind, string Label, string[]? ProductIds = null, string? Url = null);
/// <summary><paramref name="Source"/> is <c>ai</c> (language model over checked data) or <c>rules</c> (catalogue search without a model).</summary>
public record AssistantMessage(string Id, string Role, string Text, AssistantProduct[] Products, AssistantAction[] Actions, DateTimeOffset At, string? Source = null);
public record AssistantReply(string ConversationId, AssistantMessage Reply, int Remaining);
public record AssistantConversationView(string Id, AssistantMessage[] Messages, bool LeadSent, bool HandedOff);
public record AssistantLeadRequest(string ClientId, string Name, string Email, string? Phone, string Topic, bool Consent);
public record AssistantHandoffRequest(string ClientId);
public record AssistantHandoff(string Channel, string? Url, string Message);

// Panel (AI yönetimi).

public record AssistantPolicy(int Revision, string SystemPrompt, string Greeting, string[] QuickReplies, int DailyAiLimit, int MaxMessagesPerConversation,
    string Model, double Temperature, string? WhatsAppNumber, decimal? InputCostPerMillionTokens, decimal? OutputCostPerMillionTokens, string Reason, DateTimeOffset CreatedAt);
public record SaveAssistantPolicy(int BaseRevision, string SystemPrompt, string Greeting, string[] QuickReplies, int DailyAiLimit, int MaxMessagesPerConversation,
    string Model, double Temperature, string? WhatsAppNumber, decimal? InputCostPerMillionTokens, decimal? OutputCostPerMillionTokens, string Reason);

public static class KnowledgeStatuses
{
    public const string Draft = "draft";
    public const string Approved = "approved";
    public const string Archived = "archived";
}

/// <summary>An approved text Nobi may quote (delivery, returns, warranty, care…). Drafts, archived and expired sources are never used.</summary>
public record KnowledgeSource(string Id, string Title, string Body, string[] Keywords, string Status, DateOnly? ValidUntil, int Version, DateTimeOffset UpdatedAt);
public record SaveKnowledgeSource(string Title, string Body, string[] Keywords, DateOnly? ValidUntil);
public record SetKnowledgeStatus(string Status);

public record StoredAssistantMessage(string Id, string Role, string Text, string[] ProductIds, AssistantAction[] Actions, DateTimeOffset At, string? Source);
public record AssistantConversation(string Id, string ClientHash, string? AccountId, string Channel, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt,
    List<StoredAssistantMessage> Messages, bool LeadSent = false, bool HandedOff = false);

public static class LeadStatuses
{
    public const string New = "new";
    public const string Contacted = "contacted";
    public const string Closed = "closed";
}

public record AssistantLead(string Id, string ConversationId, string Name, string Email, string? Phone, string Topic, DateTimeOffset CreatedAt, string Status, string? Note = null);
public record SetLeadStatus(string Status, string? Note);

/// <summary>One model call (or rules answer); costs are estimates from the policy's per-million-token rates, never invoices.</summary>
public record AiUsageEntry(DateTimeOffset At, string Feature, string Model, int InputTokens, int OutputTokens, bool Success, string? Error, string? ConversationId);
public record AiUsageDay(DateOnly Day, string Feature, int Calls, int Failures, int InputTokens, int OutputTokens, decimal? EstimatedCost);
public record AiUsageReport(AiUsageDay[] Days, int AiCallsToday, int DailyAiLimit, bool CostRatesSet, string Note);
