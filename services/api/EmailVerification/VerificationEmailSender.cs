using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Xinobi.Api.EmailVerification;

public enum VerificationPurpose { Email, PasswordReset }

public interface IVerificationEmailSender
{
    bool IsConfigured { get; }
    bool IsPreview => false;
    Task Send(string email, string code, CancellationToken cancellationToken);
    /// <summary>Same code delivery with wording for <paramref name="purpose"/>; senders without their own wording send the default.</summary>
    Task Send(string email, string code, VerificationPurpose purpose, CancellationToken cancellationToken) => Send(email, code, cancellationToken);
}

public static class VerificationEmailText
{
    public static (string Subject, string Body) For(VerificationPurpose purpose, string code) => purpose == VerificationPurpose.PasswordReset
        ? ("Xinobi parola sıfırlama kodun",
            $"Parola sıfırlama kodun: {code}\nKod 10 dakika geçerlidir. Parolanı sıfırladığında tüm cihazlardaki oturumların kapanır. Bu işlemi sen başlatmadıysan bu e-postayı dikkate alma; parolan değişmez.")
        : ("Xinobi e-posta doğrulama kodun",
            $"E-posta doğrulama kodun: {code}\nKod 10 dakika geçerlidir. Bu işlemi sen başlatmadıysan bu e-postayı dikkate alma.");
}

// Registered only in Development when preview delivery is explicitly selected.
public sealed class PreviewVerificationEmailSender : IVerificationEmailSender
{
    public bool IsConfigured => true;
    public bool IsPreview => true;
    public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class EmailVerificationException(string message, int status = 400) : Exception(message)
{
    public int Status { get; } = status;
}

public sealed class ResendVerificationEmailSender(HttpClient client, IConfiguration configuration) : IVerificationEmailSender
{
    public bool IsConfigured => !string.IsNullOrWhiteSpace(configuration["Email:ResendApiKey"])
        && !string.IsNullOrWhiteSpace(configuration["Email:From"]);

    public Task Send(string email, string code, CancellationToken cancellationToken) => Send(email, code, VerificationPurpose.Email, cancellationToken);

    public async Task Send(string email, string code, VerificationPurpose purpose, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("E-posta gönderimi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.", 503);
        var (subject, text) = VerificationEmailText.For(purpose, code);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration["Email:ResendApiKey"]);
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(new
        {
            from = configuration["Email:From"],
            to = new[] { email },
            subject,
            text
        });
        try
        {
            using var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
                throw new EmailVerificationException("Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar dene.", 503);
        }
        catch (HttpRequestException) { throw new EmailVerificationException("E-posta servisine ulaşılamadı. Lütfen daha sonra tekrar dene.", 503); }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new EmailVerificationException("E-posta servisi zaman aşımına uğradı. Lütfen daha sonra tekrar dene.", 503); }
    }
}
