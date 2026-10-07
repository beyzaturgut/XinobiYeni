using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Xinobi.Api.EmailVerification;

public interface IVerificationEmailSender
{
    bool IsConfigured { get; }
    Task Send(string email, string code, CancellationToken cancellationToken);
}

public sealed class EmailVerificationException(string message, int status = 400) : Exception(message)
{
    public int Status { get; } = status;
}

public sealed class ResendVerificationEmailSender(HttpClient client, IConfiguration configuration) : IVerificationEmailSender
{
    public bool IsConfigured => !string.IsNullOrWhiteSpace(configuration["Email:ResendApiKey"])
        && !string.IsNullOrWhiteSpace(configuration["Email:From"]);

    public async Task Send(string email, string code, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("E-posta gönderimi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.", 503);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration["Email:ResendApiKey"]);
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(new
        {
            from = configuration["Email:From"],
            to = new[] { email },
            subject = "Xinobi e-posta doğrulama kodun",
            text = $"E-posta doğrulama kodun: {code}\nKod 10 dakika geçerlidir. Bu işlemi sen başlatmadıysan bu e-postayı dikkate alma."
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
