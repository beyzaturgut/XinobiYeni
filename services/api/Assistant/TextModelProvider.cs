using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Xinobi.Api.Assistant;

public record ChatTurn(string Role, string Content);
public record ModelAnswer(string Text, string Model, int InputTokens, int OutputTokens);
public sealed class TextModelException(string code) : Exception(code) { public string Code { get; } = code; }

public interface ITextModelProvider
{
    bool IsConfigured { get; }
    Task<ModelAnswer> CompleteAsync(string model, IReadOnlyList<ChatTurn> messages, double temperature, CancellationToken cancellationToken);
}

/// <summary>
/// Cloudflare Workers AI text generation (ADR-002, same account as XINOBI U). Only server-built prompts are sent: the customer's
/// message, the policy and catalogue facts. Assistant:ExternalInferenceEnabled=false turns it off.
/// </summary>
public sealed partial class CloudflareTextModelProvider(HttpClient client, IConfiguration configuration) : ITextModelProvider
{
    private string Account => configuration["Cloudflare:AccountId"] ?? configuration["CLOUDFLARE_ACCOUNT_ID"] ?? "";
    private string Token => configuration["Cloudflare:ApiToken"] ?? configuration["CLOUDFLARE_API_TOKEN"] ?? "";
    public bool IsConfigured => configuration.GetValue("Assistant:ExternalInferenceEnabled", true) && AccountPattern().IsMatch(Account) && !string.IsNullOrWhiteSpace(Token);

    public async Task<ModelAnswer> CompleteAsync(string model, IReadOnlyList<ChatTurn> messages, double temperature, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new TextModelException("not_configured");
        if (!ModelPattern().IsMatch(model)) throw new TextModelException("invalid_model");
        using var request = new HttpRequestMessage(HttpMethod.Post, $"https://api.cloudflare.com/client/v4/accounts/{Account}/ai/run/{model}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Token);
        request.Content = JsonContent.Create(new { messages = messages.Select(turn => new { role = turn.Role, content = turn.Content }), max_tokens = 450, temperature });
        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new TextModelException((int)response.StatusCode switch { 401 or 403 => "credentials", 429 => "quota", 400 or 422 => "rejected", _ => "unavailable" });
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var result = json.RootElement.TryGetProperty("result", out var wrapped) ? wrapped : json.RootElement;
        if (!result.TryGetProperty("response", out var text) || text.ValueKind != JsonValueKind.String) throw new TextModelException("invalid_output");
        int Tokens(string name) => result.TryGetProperty("usage", out var usage) && usage.TryGetProperty(name, out var value) && value.TryGetInt32(out var count) ? count : 0;
        return new ModelAnswer(text.GetString()!, model, Tokens("prompt_tokens"), Tokens("completion_tokens"));
    }

    [GeneratedRegex("^[a-fA-F0-9]{32}$")]
    private static partial Regex AccountPattern();

    // Workers AI model names such as @cf/meta/llama-3.1-8b-instruct; nothing else reaches the URL.
    [GeneratedRegex("^@cf/[a-z0-9-]+/[a-z0-9.-]+$")]
    private static partial Regex ModelPattern();
}
