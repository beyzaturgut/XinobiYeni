using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Xinobi.Api.Notifications;

/// <summary>Plain-text mail over SMTP with mandatory TLS (Email:Smtp:*), shared by verification codes and order notifications.</summary>
public static class SmtpMailer
{
    public static bool IsConfigured(IConfiguration configuration) =>
        !string.IsNullOrWhiteSpace(configuration["Email:Smtp:Host"])
        && !string.IsNullOrWhiteSpace(configuration["Email:Smtp:Username"])
        && !string.IsNullOrWhiteSpace(configuration["Email:Smtp:Password"])
        && MailboxAddress.TryParse(configuration["Email:From"], out _);

    /// <summary>Throws <see cref="IOException"/> (or a MailKit/socket error) on failure, <see cref="OperationCanceledException"/> after 20 s.</summary>
    public static async Task Send(IConfiguration configuration, string to, string subject, string body, CancellationToken cancellationToken)
    {
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(configuration["Email:From"]!));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(20));
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
        // Sending has succeeded; a QUIT failure must not turn a delivered message into a failure.
        try { await client.DisconnectAsync(true, timeout.Token); }
        catch (Exception error) when (error is IOException or OperationCanceledException or MailKit.ProtocolException) { }
    }

    public static bool IsDeliveryFailure(Exception error) => error is MailKit.Security.SslHandshakeException or System.Security.Authentication.AuthenticationException
        or MailKit.Security.AuthenticationException or MailKit.CommandException or MailKit.ProtocolException or IOException or System.Net.Sockets.SocketException;
}
