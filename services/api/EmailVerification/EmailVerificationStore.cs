using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace Xinobi.Api.EmailVerification;

public record VerificationChallenge(string Id, string Email, DateTimeOffset ExpiresAt,
    [property: System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)] string? PreviewCode = null);
public record StartEmailVerification(string Email);
public record ConfirmEmailVerification(string Id, string Email, string Code);

// This store gates the local demo registration flow, not production identity/authentication.
// Restarting the API invalidates pending codes; no code or address is logged or persisted.
public sealed class EmailVerificationStore(IVerificationEmailSender sender, TimeProvider clock)
{
    private sealed record Entry(string Email, byte[] Hash, DateTimeOffset ExpiresAt, DateTimeOffset SentAt)
    {
        public int Attempts { get; set; }
    }
    private readonly Dictionary<string, Entry> entries = new();
    private readonly SemaphoreSlim gate = new(1);
    private static string Normalize(string? email)
    {
        var value = email?.Trim().ToLowerInvariant() ?? "";
        if (value.Length > 254 || !MailAddress.TryCreate(value, out var parsed) || parsed.Address != value)
            throw new EmailVerificationException("Geçerli bir e-posta adresi gir.");
        return value;
    }
    private static byte[] Hash(string id, string code) => SHA256.HashData(Encoding.UTF8.GetBytes(id + ":" + code));

    /// <summary>
    /// Sends a code to <paramref name="email"/>. With <paramref name="deliver"/> false nothing is sent but the challenge, cooldown
    /// and answer look the same, so a password reset for an unknown address cannot be told apart from a real one.
    /// </summary>
    public async Task<VerificationChallenge> Start(string email, CancellationToken cancellationToken = default, VerificationPurpose purpose = VerificationPurpose.Email, bool deliver = true)
    {
        email = Normalize(email);
        if (!sender.IsConfigured) throw new EmailVerificationException("E-posta gönderimi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.", 503);
        await gate.WaitAsync(cancellationToken);
        try
        {
            var now = clock.GetUtcNow();
            foreach (var key in entries.Where(pair => pair.Value.ExpiresAt <= now).Select(pair => pair.Key).ToArray()) entries.Remove(key);
            if (entries.Values.Any(entry => entry.Email == email && now - entry.SentAt < TimeSpan.FromMinutes(1)))
                throw new EmailVerificationException("Yeni kod istemek için bir dakika bekle.", 429);
            if (entries.Count >= 1000) throw new EmailVerificationException("Çok fazla istek var. Lütfen daha sonra tekrar dene.", 429);
            var id = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
            var code = RandomNumberGenerator.GetInt32(1000000).ToString("D6");
            if (deliver) await sender.Send(email, code, purpose, cancellationToken);
            foreach (var key in entries.Where(pair => pair.Value.Email == email).Select(pair => pair.Key).ToArray()) entries.Remove(key);
            entries[id] = new(email, Hash(id, code), now.AddMinutes(10), now);
            return new(id, email, now.AddMinutes(10), sender.IsPreview && deliver ? code : null);
        }
        finally { gate.Release(); }
    }

    public async Task Confirm(ConfirmEmailVerification request)
    {
        var email = Normalize(request.Email);
        await gate.WaitAsync();
        try
        {
            if (request.Id is null || !entries.TryGetValue(request.Id, out var entry) || entry.Email != email)
                throw new EmailVerificationException("Doğrulama isteği bulunamadı. Yeni kod iste.");
            if (entry.ExpiresAt <= clock.GetUtcNow())
            {
                entries.Remove(request.Id);
                throw new EmailVerificationException("Kodun süresi doldu. Yeni kod iste.");
            }
            if (entry.Attempts >= 5) throw new EmailVerificationException("Deneme sınırına ulaştın. Yeni kod iste.", 429);
            entry.Attempts++;
            if (request.Code is null || request.Code.Length != 6 || !request.Code.All(char.IsAsciiDigit)
                || !CryptographicOperations.FixedTimeEquals(entry.Hash, Hash(request.Id, request.Code)))
                throw new EmailVerificationException("Doğrulama kodu hatalı.");
            // Retain the cooldown without permitting reuse of a successful challenge.
            entry.Attempts = 5;
        }
        finally { gate.Release(); }
    }
}
