using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Xinobi.Api.EmailVerification;

public sealed class SmtpVerificationEmailSender(IConfiguration configuration) : IVerificationEmailSender
{
    public bool IsConfigured => !string.IsNullOrWhiteSpace(configuration["Email:Smtp:Host"])
        && !string.IsNullOrWhiteSpace(configuration["Email:Smtp:Username"])
        && !string.IsNullOrWhiteSpace(configuration["Email:Smtp:Password"])
        && MailboxAddress.TryParse(configuration["Email:From"], out _);

    public async Task Send(string email, string code, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new EmailVerificationException("E-posta gönderimi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.", 503);
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(configuration["Email:From"]!));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = "Xinobi e-posta doğrulama kodun";
        message.Body = new TextPart("plain") { Text = $"E-posta doğrulama kodun: {code}\nKod 10 dakika geçerlidir. Bu işlemi sen başlatmadıysan bu e-postayı dikkate alma." };
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(20));
        try
        {
            using var client = new SmtpClient
            {
                Timeout = 20000,
                // Keep certificate/hostname validation. Local environments without working
                // revocation lookups can opt out of that lookup alone.
                CheckCertificateRevocation = configuration.GetValue("Email:Smtp:CheckCertificateRevocation", true)
            };
            var port = configuration.GetValue("Email:Smtp:Port", 587);
            // Require encryption; do not allow opportunistic or plaintext authentication.
            await client.ConnectAsync(configuration["Email:Smtp:Host"]!, port,
                port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls, timeout.Token);
            await client.AuthenticateAsync(configuration["Email:Smtp:Username"]!, configuration["Email:Smtp:Password"]!, timeout.Token);
            await client.SendAsync(message, timeout.Token);
            // Sending has succeeded; a QUIT failure must not invalidate the delivered code.
            try { await client.DisconnectAsync(true, timeout.Token); }
            catch (Exception error) when (error is IOException or OperationCanceledException or MailKit.ProtocolException) { }
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new EmailVerificationException("E-posta servisi zaman aşımına uğradı. Lütfen daha sonra tekrar dene.", 503); }
        catch (Exception error) when (error is MailKit.Security.SslHandshakeException or System.Security.Authentication.AuthenticationException or MailKit.Security.AuthenticationException or MailKit.CommandException
            or MailKit.ProtocolException or IOException or System.Net.Sockets.SocketException)
        { throw new EmailVerificationException("Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar dene.", 503); }
    }
}
