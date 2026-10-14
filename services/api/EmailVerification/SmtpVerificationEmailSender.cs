using Xinobi.Api.Notifications;

namespace Xinobi.Api.EmailVerification;

public sealed class SmtpVerificationEmailSender(IConfiguration configuration) : IVerificationEmailSender
{
    public bool IsConfigured => SmtpMailer.IsConfigured(configuration);

    public Task Send(string email, string code, CancellationToken cancellationToken) => Send(email, code, VerificationPurpose.Email, cancellationToken);

    public async Task Send(string email, string code, VerificationPurpose purpose, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("E-posta gönderimi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.", 503);
        try
        {
            var (subject, body) = VerificationEmailText.For(purpose, code);
            await SmtpMailer.Send(configuration, email, subject, body, cancellationToken);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new EmailVerificationException("E-posta servisi zaman aşımına uğradı. Lütfen daha sonra tekrar dene.", 503); }
        catch (Exception error) when (SmtpMailer.IsDeliveryFailure(error))
        { throw new EmailVerificationException("Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar dene.", 503); }
    }
}
