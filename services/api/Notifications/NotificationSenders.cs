using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Xinobi.Api.Notifications;

public record NotificationResult(string Status, string? Error = null, string[]? InvalidTokens = null)
{
    public static NotificationResult Sent() => new(NotificationStatuses.Sent);
    public static NotificationResult Preview() => new(NotificationStatuses.Previewed, "Önizleme: gönderilmedi.");
    public static NotificationResult Skip(string reason) => new(NotificationStatuses.Skipped, reason);
    public static NotificationResult Fail(string reason) => new(NotificationStatuses.Failed, reason);
}

public interface INotificationChannelSender
{
    string Channel { get; }
    bool IsConfigured { get; }
    Task<NotificationResult> Send(NotificationItem item, string[] deviceTokens, CancellationToken cancellationToken);
}

/// <summary>E-mail through the SMTP account of Email:Smtp:* when Email:DeliveryMode is Smtp; Preview records without sending.</summary>
public sealed class EmailNotificationSender(IConfiguration configuration, NotificationTexts texts) : INotificationChannelSender
{
    public string Channel => NotificationChannels.Email;
    private string Mode => configuration["Email:DeliveryMode"] ?? "";
    public bool IsConfigured => Mode == "Preview" || Mode == "Smtp" && SmtpMailer.IsConfigured(configuration);

    public async Task<NotificationResult> Send(NotificationItem item, string[] deviceTokens, CancellationToken cancellationToken)
    {
        if (Mode == "Preview") return NotificationResult.Preview();
        try
        {
            await SmtpMailer.Send(configuration, item.Recipient, "Xinobi · " + item.Title, texts.Email(item), cancellationToken);
            return NotificationResult.Sent();
        }
        catch (Exception error) when (SmtpMailer.IsDeliveryFailure(error)) { return NotificationResult.Fail("SMTP: " + error.GetType().Name); }
    }
}

/// <summary>
/// SMS through Netgsm's REST API (Sms:Provider=Netgsm with Sms:Netgsm:Username/Password/Header) or Preview.
/// The Netgsm request shape follows its public v2 documentation and has not been tried against a real account yet.
/// </summary>
public sealed class SmsNotificationSender(IConfiguration configuration, HttpClient client) : INotificationChannelSender
{
    public string Channel => NotificationChannels.Sms;
    private string Provider => configuration["Sms:Provider"] ?? "";
    public bool IsConfigured => Provider == "Preview" || Provider == "Netgsm"
        && !string.IsNullOrWhiteSpace(configuration["Sms:Netgsm:Username"]) && !string.IsNullOrWhiteSpace(configuration["Sms:Netgsm:Password"]) && !string.IsNullOrWhiteSpace(configuration["Sms:Netgsm:Header"]);

    public async Task<NotificationResult> Send(NotificationItem item, string[] deviceTokens, CancellationToken cancellationToken)
    {
        if (Provider == "Preview") return NotificationResult.Preview();
        // +90XXXXXXXXXX → XXXXXXXXXX, the national form Netgsm expects.
        var number = item.Recipient.StartsWith("+90", StringComparison.Ordinal) ? item.Recipient[3..] : item.Recipient;
        using var request = new HttpRequestMessage(HttpMethod.Post, configuration["Sms:Netgsm:Url"] ?? "https://api.netgsm.com.tr/sms/rest/v2/send");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{configuration["Sms:Netgsm:Username"]}:{configuration["Sms:Netgsm:Password"]}")));
        request.Content = JsonContent.Create(new { msgheader = configuration["Sms:Netgsm:Header"], encoding = "TR", messages = new[] { new { msg = NotificationTexts.Sms(item), no = number } } });
        try
        {
            using var response = await client.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            // Netgsm answers {"code":"00",...} on success; anything else is a failure worth retrying.
            return response.IsSuccessStatusCode && body.Contains("\"00\"", StringComparison.Ordinal) ? NotificationResult.Sent() : NotificationResult.Fail($"Netgsm {(int)response.StatusCode}");
        }
        catch (HttpRequestException error) { return NotificationResult.Fail("Netgsm: " + error.GetType().Name); }
    }
}

/// <summary>
/// Push through Firebase Cloud Messaging HTTP v1 with a service account (Push:Provider=Fcm, Push:Fcm:ServiceAccountPath), or Preview.
/// The mobile app registers its token at /api/v1/me/devices once the Firebase project files are added to it.
/// </summary>
public sealed class PushNotificationSender(IConfiguration configuration, HttpClient client, TimeProvider clock) : INotificationChannelSender
{
    private sealed record ServiceAccount([property: JsonPropertyName("project_id")] string ProjectId, [property: JsonPropertyName("client_email")] string ClientEmail, [property: JsonPropertyName("private_key")] string PrivateKey);
    private (string Token, DateTimeOffset ExpiresAt)? access;
    public string Channel => NotificationChannels.Push;
    private string Provider => configuration["Push:Provider"] ?? "";
    public bool IsConfigured => Provider == "Preview" || Provider == "Fcm" && File.Exists(configuration["Push:Fcm:ServiceAccountPath"] ?? "");

    public async Task<NotificationResult> Send(NotificationItem item, string[] deviceTokens, CancellationToken cancellationToken)
    {
        if (Provider == "Preview") return NotificationResult.Preview();
        if (deviceTokens.Length == 0) return NotificationResult.Skip("Kayıtlı cihaz yok.");
        var account = JsonSerializer.Deserialize<ServiceAccount>(await File.ReadAllTextAsync(configuration["Push:Fcm:ServiceAccountPath"]!, cancellationToken))!;
        var token = await AccessToken(account, cancellationToken);
        var invalid = new List<string>();
        var delivered = 0;
        foreach (var device in deviceTokens)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"https://fcm.googleapis.com/v1/projects/{account.ProjectId}/messages:send");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new { message = new { token = device, notification = new { title = item.Title, body = item.Body }, data = new Dictionary<string, string> { ["kind"] = item.Kind, ["link"] = item.Link ?? "" } } });
            using var response = await client.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode) delivered++;
            else if ((int)response.StatusCode is 404 or 400) invalid.Add(device);
        }
        return delivered > 0 ? NotificationResult.Sent() with { InvalidTokens = [.. invalid] } : NotificationResult.Fail("FCM: hiçbir cihaza ulaşılamadı.") with { InvalidTokens = [.. invalid] };
    }

    /// <summary>OAuth2 JWT-bearer grant signed with the service account key; the token is reused until shortly before it expires.</summary>
    private async Task<string> AccessToken(ServiceAccount account, CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        if (access is { } cached && cached.ExpiresAt > now.AddMinutes(5)) return cached.Token;
        static string Base64Url(byte[] bytes) => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        var header = Base64Url(JsonSerializer.SerializeToUtf8Bytes(new { alg = "RS256", typ = "JWT" }));
        var claims = Base64Url(JsonSerializer.SerializeToUtf8Bytes(new { iss = account.ClientEmail, scope = "https://www.googleapis.com/auth/firebase.messaging", aud = "https://oauth2.googleapis.com/token", iat = now.ToUnixTimeSeconds(), exp = now.AddHours(1).ToUnixTimeSeconds() }));
        using var rsa = RSA.Create();
        rsa.ImportFromPem(account.PrivateKey);
        var signature = Base64Url(rsa.SignData(Encoding.ASCII.GetBytes($"{header}.{claims}"), HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1));
        using var response = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "urn:ietf:params:oauth:grant-type:jwt-bearer",
            ["assertion"] = $"{header}.{claims}.{signature}",
        }), cancellationToken);
        response.EnsureSuccessStatusCode();
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var value = body.RootElement.GetProperty("access_token").GetString()!;
        access = (value, now.AddSeconds(body.RootElement.GetProperty("expires_in").GetInt32()));
        return value;
    }
}

/// <summary>Message bodies per channel; the in-app text is the notification itself.</summary>
public sealed class NotificationTexts(IConfiguration configuration)
{
    private string WebBaseUrl => (configuration["Web:BaseUrl"] ?? "http://localhost:3000").TrimEnd('/');

    public string Email(NotificationItem item) =>
        $"{item.Title}\n\n{item.Body}\n\n" + (item.Link is null ? "" : $"Ayrıntılar: {WebBaseUrl}{item.Link}\n\n") +
        "Bu e-posta Xinobi hesabındaki bir işlem nedeniyle gönderildi.";

    public static string Sms(NotificationItem item)
    {
        var text = $"Xinobi: {item.Title}. {item.Body}";
        return text.Length <= 300 ? text : text[..297] + "...";
    }
}
