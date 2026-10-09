using Xinobi.Api.Notifications;

namespace Xinobi.Api.EmailVerification;

public sealed class SmtpVerificationEmailSender(IConfiguration configuration) : IVerificationEmailSender
{
    public bool IsConfigured => SmtpMailer.IsConfigured(configuration);

    public async Task Send(string email, string code, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("E-posta gönderimi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.", 503);
        try
        {
            await SmtpMailer.Send(configuration, email, "Xinobi e-posta doğrulama kodun",
                $"E-posta doğrulama kodun: {code}\nKod 10 dakika geçerlidir. Bu işlemi sen başlatmadıysan bu e-postayı dikkate alma.", cancellationToken);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new EmailVerificationException("E-posta servisi zaman aşımına uğradı. Lütfen daha sonra tekrar dene.", 503); }
        catch (Exception error) when (SmtpMailer.IsDeliveryFailure(error))
        { throw new EmailVerificationException("Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar dene.", 503); }
    }
}
