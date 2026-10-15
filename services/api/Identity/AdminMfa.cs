using System.Security.Cryptography;
using System.Text;
using Xinobi.Api.EmailVerification;

namespace Xinobi.Api.Identity;

public sealed class UnavailableSecurityEmailSender : IVerificationEmailSender
{
    public bool IsConfigured => false;
    public Task Send(string email, string code, CancellationToken cancellationToken) => throw new EmailVerificationException("E-posta yapılandırılmadı.", 503);
}

public record AdminMfaChallenge(string ChallengeId, DateTimeOffset ExpiresAt, string? PreviewCode);
public record VerifyAdminMfa(string ChallengeId, string Code);

/// <summary>SQL-backed email challenges; isolated memory and exposed codes are limited to Development.</summary>
public sealed class AdminMfa(IVerificationEmailSender sender, TimeProvider clock, IWebHostEnvironment environment, IServiceScopeFactory? scopes = null, IAccountStore? accounts = null)
{
    private readonly SqlAdminMfaStore? sql = accounts is SqlAccountStore && scopes is not null ? new(scopes, clock) : null;
    private sealed record Pending(string AccountId, string CredentialStamp, byte[] Hash, DateTimeOffset ExpiresAt) { public int Attempts { get; set; } }
    private readonly SemaphoreSlim gate = new(1);
    private readonly Dictionary<string, Pending> pending = [];
    private readonly Dictionary<string, (string AccountId, DateTimeOffset ExpiresAt, string? Stamp)> grants = [];
    private readonly Dictionary<string, DateTimeOffset> sent = [];
    private static string Hash(string token) => AccountRules.Hash(token);

    public async Task<AdminMfaChallenge> Start(AccountRecord account, CancellationToken cancellationToken)
    {
        var preview = environment.IsDevelopment() && sender.IsPreview;
        if (!sender.IsConfigured || (!environment.IsDevelopment() && (sender.IsPreview || sql is null)))
            throw new AccountException("mfa_unavailable", "MFA için SQL deposu ve gerçek e-posta gönderimi yapılandırılmalı.", 503);
        if (sql is not null)
        {
            var id=AccountRules.NewToken();var code=RandomNumberGenerator.GetInt32(1000000).ToString("D6");
            await sql.Start(account,id,code,()=>sender.Send(account.Email,code,VerificationPurpose.AdminMfa,cancellationToken));
            return new(id,clock.GetUtcNow().AddMinutes(10),preview ? code : null);
        }
        await gate.WaitAsync(cancellationToken);
        try
        {
            var now = clock.GetUtcNow();
            foreach (var key in pending.Where(x => x.Value.ExpiresAt <= now).Select(x => x.Key).ToArray()) pending.Remove(key);
            foreach (var key in sent.Where(x => x.Value <= now.AddMinutes(-1)).Select(x => x.Key).ToArray()) sent.Remove(key);
            if (sent.ContainsKey(account.Id)) throw new AccountException("mfa_rate_limited", "Yeni kod için bir dakika bekle.", 429);
            if (pending.Count >= 1000) throw new AccountException("mfa_rate_limited", "Lütfen daha sonra tekrar dene.", 429);
            var id = AccountRules.NewToken();
            var code = RandomNumberGenerator.GetInt32(1000000).ToString("D6");
            await sender.Send(account.Email, code, VerificationPurpose.AdminMfa, cancellationToken);
            foreach (var key in pending.Where(x => x.Value.AccountId == account.Id).Select(x => x.Key).ToArray()) pending.Remove(key);
            pending[Hash(id)] = new(account.Id, Hash(account.PasswordHash), SHA256.HashData(Encoding.UTF8.GetBytes(id + ":" + code)), now.AddMinutes(10));
            sent[account.Id] = now;
            return new(id, now.AddMinutes(10), preview ? code : null);
        }
        finally { gate.Release(); }
    }

    public async Task<(string AccountId, string CredentialStamp)> Consume(string id, string code)
    {
        if(id is null||id.Length>256)throw new AccountException("invalid_mfa","Kod geçersiz veya süresi dolmuş.",401);
        if(sql is not null)return await sql.Consume(id,code??"");
        await gate.WaitAsync();
        try
        {
            if (id is null || id.Length > 256 || !pending.TryGetValue(Hash(id), out var entry) || entry.ExpiresAt <= clock.GetUtcNow())
                throw new AccountException("invalid_mfa", "Kod geçersiz veya süresi dolmuş.", 401);
            entry.Attempts++;
            if (entry.Attempts > 5) { pending.Remove(Hash(id)); throw new AccountException("invalid_mfa", "Yeni kod iste.", 401); }
            if (code is null || code.Length != 6 || !code.All(char.IsAsciiDigit)
                || !CryptographicOperations.FixedTimeEquals(entry.Hash, SHA256.HashData(Encoding.UTF8.GetBytes(id + ":" + code))))
                throw new AccountException("invalid_mfa", "Kod geçersiz veya süresi dolmuş.", 401);
            pending.Remove(Hash(id));
            return (entry.AccountId, entry.CredentialStamp);
        }
        finally { gate.Release(); }
    }

    public async Task Grant(string accountId, IssuedTokens tokens, string? credentialStamp = null)
    {
        if(sql is not null){await sql.Grant(accountId,tokens,credentialStamp);return;}
        await gate.WaitAsync();
        try
        {
            foreach (var key in grants.Where(x => x.Value.ExpiresAt <= clock.GetUtcNow()).Select(x => x.Key).ToArray()) grants.Remove(key);
            grants[Hash(tokens.AccessToken)] = (accountId, tokens.AccessTokenExpiresAt, credentialStamp);
            grants[Hash(tokens.RefreshToken)] = (accountId, tokens.RefreshTokenExpiresAt, credentialStamp);
        }
        finally { gate.Release(); }
    }

    public async Task<bool> Allowed(string token, string? accountId = null, string? credentialStamp = null)
    {
        if(sql is not null)return await sql.Allowed(token,accountId,credentialStamp);
        await gate.WaitAsync();
        try { return grants.TryGetValue(Hash(token), out var grant) && grant.ExpiresAt > clock.GetUtcNow() && (accountId is null || grant.AccountId == accountId)
            && (grant.Stamp is null || credentialStamp is null || grant.Stamp == credentialStamp); }
        finally { gate.Release(); }
    }
}
