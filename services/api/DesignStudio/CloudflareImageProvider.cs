using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Xinobi.Api.DesignStudio;

public record GeneratedImage(byte[] Bytes, string Mime, string Model, string? ProviderRequestId);
public interface IImageGenerationProvider
{
    bool IsConfigured { get; }
    Task<GeneratedImage> GenerateAsync(string prompt, CancellationToken cancellationToken);
}
public sealed class DesignProviderException(string code, string message) : Exception(message) { public string Code { get; } = code; }

public sealed class CloudflareImageProvider(HttpClient client, IConfiguration configuration) : IImageGenerationProvider
{
    private string Account => configuration["Cloudflare:AccountId"] ?? configuration["CLOUDFLARE_ACCOUNT_ID"] ?? "";
    private string Token => configuration["Cloudflare:ApiToken"] ?? configuration["CLOUDFLARE_API_TOKEN"] ?? "";
    public bool IsConfigured => Regex.IsMatch(Account, "^[a-fA-F0-9]{32}$") && !string.IsNullOrWhiteSpace(Token);
    public async Task<GeneratedImage> GenerateAsync(string prompt, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new DesignProviderException("provider_not_configured", "Cloudflare bağlantısı henüz yapılandırılmadı.");
        const string model = "@cf/black-forest-labs/flux-1-schnell";
        using var request = new HttpRequestMessage(HttpMethod.Post, $"https://api.cloudflare.com/client/v4/accounts/{Account}/ai/run/{model}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Token);
        request.Content = JsonContent.Create(new { prompt, steps = 4 });
        using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var code = (int)response.StatusCode switch { 401 or 403 => "provider_credentials", 429 => "provider_quota", 400 or 422 => "provider_rejected", _ => "provider_unavailable" };
            throw new DesignProviderException(code, code switch { "provider_credentials" => "Cloudflare erişim bilgileri veya yetkileri doğrulanamadı.", "provider_quota" => "Cloudflare kullanım sınırına ulaşıldı.", "provider_rejected" => "Görsel isteği sağlayıcı tarafından kabul edilmedi.", _ => "Görsel sağlayıcısı şu anda yanıt veremiyor." });
        }
        if (response.Content.Headers.ContentLength > 16 * 1024 * 1024) throw new DesignProviderException("invalid_output", "Görsel çıktısı boyut sınırını aşıyor.");
        await using var input = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var bounded = new MemoryStream();
        var buffer = new byte[8192]; int read;
        while ((read = await input.ReadAsync(buffer, cancellationToken)) > 0)
        {
            if (bounded.Length + read > 16 * 1024 * 1024) throw new DesignProviderException("invalid_output", "Görsel çıktısı boyut sınırını aşıyor.");
            await bounded.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
        }
        using var json = JsonDocument.Parse(bounded.ToArray());
        if (json.RootElement.TryGetProperty("success", out var success) && !success.GetBoolean()) throw new DesignProviderException("provider_rejected", "Görsel üretimi sağlayıcı tarafından tamamlanamadı.");
        var result = json.RootElement.TryGetProperty("result", out var wrapped) ? wrapped : json.RootElement;
        if (!result.TryGetProperty("image", out var encoded) || encoded.ValueKind != JsonValueKind.String) throw new DesignProviderException("invalid_output", "Sağlayıcı geçerli bir görsel döndürmedi.");
        byte[] bytes;
        try { bytes = Convert.FromBase64String(encoded.GetString()!); }
        catch (FormatException) { throw new DesignProviderException("invalid_output", "Görsel çıktısı okunamadı."); }
        var mime = bytes.Length >= 3 && bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255 ? "image/jpeg" :
            bytes.Length >= 8 && bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) ? "image/png" : "";
        if (mime == "" || bytes.Length > 12 * 1024 * 1024) throw new DesignProviderException("invalid_output", "Üretilen görsel biçimi desteklenmiyor.");
        return new GeneratedImage(bytes, mime, model, response.Headers.TryGetValues("cf-ray", out var ids) ? ids.FirstOrDefault() : null);
    }
}
