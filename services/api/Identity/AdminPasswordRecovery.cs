using Xinobi.Api.EmailVerification;

namespace Xinobi.Api.Identity;

public record StartAdminPasswordReset(string Email);
public record CompleteAdminPasswordReset(string Token, string NewPassword);
public record AdminPasswordResetStarted(string Message, string? PreviewUrl = null);

/// <summary>Local Preview links: SQL for SQL accounts, isolated memory for file fixtures. Recovery never issues a session.</summary>
public sealed class AdminPasswordRecovery(IAccountStore accounts, TimeProvider clock, IWebHostEnvironment environment, IVerificationEmailSender sender, IServiceScopeFactory? scopes = null)
{
    private readonly SqlAdminPasswordRecovery? sql=accounts is SqlAccountStore&&scopes is not null?new(scopes,clock):null;
    private sealed record Link(string Email, string Role, string Stamp, DateTimeOffset ExpiresAt);
    private readonly Dictionary<string, Link> links = [];
    private readonly SemaphoreSlim gate = new(1);
    private readonly Dictionary<string, DateTimeOffset> sent = [];
    public async Task<AdminPasswordResetStarted> Start(string email)
    {
        if (!environment.IsDevelopment() || !sender.IsPreview) throw new AccountException("recovery_unavailable", "Kurtarma yalnız lokal Preview modunda etkin.", 503);
        email = AccountRules.NormalizeEmail(email);
        if(sql is not null)
        {
            var account=await accounts.FindStaffByEmail(email);
            if(account is null)return new("Uygun hesap varsa sıfırlama bağlantısı hazırlanmıştır.");
            var token=AccountRules.NewToken();var url="http://127.0.0.1:5173/#password-reset="+Uri.EscapeDataString(token);
            var created=await sql.Start(account,token,()=>sender.Send(email,url,CancellationToken.None));
            return new("Uygun hesap varsa sıfırlama bağlantısı hazırlanmıştır.",created?url:null);
        }
        await gate.WaitAsync();
        try
        {
            var now = clock.GetUtcNow();
            foreach (var key in links.Where(x => x.Value.ExpiresAt <= now).Select(x => x.Key).ToArray()) links.Remove(key);
            foreach (var key in sent.Where(x => x.Value <= now.AddMinutes(-1)).Select(x => x.Key).ToArray()) sent.Remove(key);
            var emailHash = AccountRules.Hash(email);
            if (sent.ContainsKey(emailHash)) return new("Uygun hesap varsa sıfırlama bağlantısı hazırlanmıştır.");
            sent[emailHash] = now;
            var account = await accounts.FindStaffByEmail(email);
            // Preview response intentionally exposes a local-only delivery artifact; never allowed in production.
            if (account is null || links.Count >= 1000) return new("Uygun hesap varsa sıfırlama bağlantısı hazırlanmıştır.");
            foreach (var key in links.Where(x => x.Value.Email == email).Select(x => x.Key).ToArray()) links.Remove(key);
            var token = AccountRules.NewToken();
            var url = "http://127.0.0.1:5173/#password-reset=" + Uri.EscapeDataString(token);
            await sender.Send(email, url, CancellationToken.None);
            links[AccountRules.Hash(token)] = new(email, account.RoleCodes.Contains(Roles.SuperAdmin) ? Roles.SuperAdmin : Roles.Admin,
                AccountRules.Hash(account.PasswordHash), now.AddMinutes(10));
            return new("Uygun hesap varsa sıfırlama bağlantısı hazırlanmıştır.", url);
        }
        finally { gate.Release(); }
    }
    public async Task Complete(string token, string password)
    {
        AccountRules.ValidatePassword(password);
        if(sql is not null)
        {
            if(token is null||token.Length>256||!await ((SqlAccountStore)accounts).CompleteAdminPasswordReset(token,password))
                throw new AccountException("invalid_reset","Bağlantı geçersiz, kullanılmış veya süresi dolmuş.");
            return;
        }
        await gate.WaitAsync();
        try
        {
            if (token is null || token.Length > 256 || !links.Remove(AccountRules.Hash(token), out var link) || link.ExpiresAt <= clock.GetUtcNow())
                throw new AccountException("invalid_reset", "Bağlantı geçersiz, kullanılmış veya süresi dolmuş.");
            if (!await accounts.ResetPasswordForRole(link.Email, link.Role, password, link.Stamp))
                throw new AccountException("invalid_reset", "Bağlantı geçersiz, kullanılmış veya süresi dolmuş.");
        }
        finally { gate.Release(); }
    }
}
