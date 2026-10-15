using System.Net.Http.Headers;
using System.Net.Http.Json;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Notifications;

namespace Xinobi.Api.Identity;

public interface IAdminInvitationEmailSender
{
    bool IsConfigured { get; }
    bool IsPreview => false;
    Task Send(string email, string acceptanceUrl, CancellationToken cancellationToken);
}

public sealed class UnavailableAdminInvitationEmailSender : IAdminInvitationEmailSender
{
    public bool IsConfigured => false;
    public Task Send(string email, string acceptanceUrl, CancellationToken cancellationToken) =>
        throw new EmailVerificationException("Davet e-postası gönderimi yapılandırılmadı.", 503);
}

public sealed class PreviewAdminInvitationEmailSender : IAdminInvitationEmailSender
{
    public bool IsConfigured => true;
    public bool IsPreview => true;
    public Task Send(string email, string acceptanceUrl, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class SmtpAdminInvitationEmailSender(IConfiguration configuration) : IAdminInvitationEmailSender
{
    public bool IsConfigured => SmtpMailer.IsConfigured(configuration);

    public async Task Send(string email, string acceptanceUrl, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("Davet e-postası gönderimi yapılandırılmadı.", 503);
        try
        {
            await SmtpMailer.Send(configuration, email, "Xinobi yönetim paneli davetin",
                $"Xinobi yönetim hesabını oluşturmak için bu tek kullanımlık bağlantıyı aç:\n{acceptanceUrl}\nBağlantı 24 saat geçerlidir.", cancellationToken);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new EmailVerificationException("Davet e-postası gönderimi zaman aşımına uğradı.", 503); }
        catch (Exception error) when (SmtpMailer.IsDeliveryFailure(error))
        { throw new EmailVerificationException("Davet e-postası gönderilemedi.", 503); }
    }
}

public sealed class ResendAdminInvitationEmailSender(HttpClient client, IConfiguration configuration) : IAdminInvitationEmailSender
{
    public bool IsConfigured => !string.IsNullOrWhiteSpace(configuration["Email:ResendApiKey"])
        && !string.IsNullOrWhiteSpace(configuration["Email:From"]);

    public async Task Send(string email, string acceptanceUrl, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("Davet e-postası gönderimi yapılandırılmadı.", 503);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration["Email:ResendApiKey"]);
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(new
        {
            from = configuration["Email:From"],
            to = new[] { email },
            subject = "Xinobi yönetim paneli davetin",
            text = $"Xinobi yönetim hesabını oluşturmak için bu tek kullanımlık bağlantıyı aç:\n{acceptanceUrl}\nBağlantı 24 saat geçerlidir."
        });
        try
        {
            using var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) throw new EmailVerificationException("Davet e-postası gönderilemedi.", 503);
        }
        catch (HttpRequestException) { throw new EmailVerificationException("E-posta servisine ulaşılamadı.", 503); }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new EmailVerificationException("E-posta servisi zaman aşımına uğradı.", 503); }
    }
}
