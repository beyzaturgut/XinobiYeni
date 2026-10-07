using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Identity;

/// <summary><paramref name="Roles"/> is empty for customers; staff accounts carry panel roles (Faz03 03.04).</summary>
public record AccountRecord(string Id, string Name, string Email, string PasswordHash, DateTimeOffset CreatedAt, string[]? Roles = null)
{
    [System.Text.Json.Serialization.JsonIgnore] public IReadOnlyCollection<string> RoleCodes => Roles ?? [];
}
public record IssuedTokens(string AccessToken, DateTimeOffset AccessTokenExpiresAt, string RefreshToken, DateTimeOffset RefreshTokenExpiresAt);

public sealed class AccountException(string code, string message, int status = StatusCodes.Status400BadRequest) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;
}

/// <summary>Thrown outside Development until the SQL Server identity store exists (Faz03 03.03/03.11).</summary>
public sealed class AccountUnavailableException() : Exception("Account store is not configured for this environment.");

/// <summary>
/// Customer accounts and token sessions (ADR-004): short-lived opaque access tokens and rotating refresh tokens grouped in a family.
/// Only SHA-256 hashes of tokens are stored; reusing a rotated refresh token revokes the whole family.
/// </summary>
public interface IAccountStore
{
    Task<AccountRecord> Register(string name, string email, string password);
    Task<AccountRecord?> Login(string email, string password);
    Task<IssuedTokens> IssueTokens(string accountId);
    Task<(AccountRecord Account, IssuedTokens Tokens)> Refresh(string refreshToken);
    Task Revoke(string refreshToken);
    Task<AccountRecord?> FindByAccessToken(string accessToken);
    Task<AccountRecord?> FindById(string accountId);
    /// <summary>Adds <paramref name="role"/> to the account; null when no account has that e-mail.</summary>
    Task<AccountRecord?> AssignRole(string email, string role);
    Task<bool> AnyWithRole(string role);
}

public sealed class UnavailableAccountStore : IAccountStore
{
    public Task<AccountRecord> Register(string name, string email, string password) => throw new AccountUnavailableException();
    public Task<AccountRecord?> Login(string email, string password) => throw new AccountUnavailableException();
    public Task<IssuedTokens> IssueTokens(string accountId) => throw new AccountUnavailableException();
    public Task<(AccountRecord Account, IssuedTokens Tokens)> Refresh(string refreshToken) => throw new AccountUnavailableException();
    public Task Revoke(string refreshToken) => throw new AccountUnavailableException();
    public Task<AccountRecord?> FindByAccessToken(string accessToken) => Task.FromResult<AccountRecord?>(null);
    public Task<AccountRecord?> FindById(string accountId) => throw new AccountUnavailableException();
    public Task<AccountRecord?> AssignRole(string email, string role) => throw new AccountUnavailableException();
    public Task<bool> AnyWithRole(string role) => throw new AccountUnavailableException();
}

public static class AccountRules
{
    public static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(30);
    public const int MinPasswordLength = 8;
    public const int MaxPasswordLength = 128;

    public static string NormalizeEmail(string? email)
    {
        var value = email?.Trim().ToLowerInvariant() ?? "";
        if (value.Length > 254 || !MailAddress.TryCreate(value, out var parsed) || parsed.Address != value)
            throw new AccountException("invalid_email", "Geçerli bir e-posta adresi gir.");
        return value;
    }

    public static string ValidName(string? name)
    {
        var value = name?.Trim() ?? "";
        if (value.Length is < 1 or > 80 || value.Any(char.IsControl)) throw new AccountException("invalid_name", "1–80 karakterlik ad soyad gir.");
        return value;
    }

    public static void ValidatePassword(string? password)
    {
        if (password is null || password.Length < MinPasswordLength || password.Length > MaxPasswordLength)
            throw new AccountException("weak_password", $"Parola {MinPasswordLength}–{MaxPasswordLength} karakter olmalı.");
    }

    public static string NewToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

/// <summary>Development-only file store beside the local commerce data (ADR-003). Moves to SQL Server with 03.11.</summary>
public sealed class DevFileAccountStore(LocalCommerceStore commerce, TimeProvider clock) : IAccountStore
{
    private sealed record RefreshEntry(string Hash, string FamilyId, string AccountId, DateTimeOffset ExpiresAt, DateTimeOffset? UsedAt, DateTimeOffset? RevokedAt);
    private sealed record AccessEntry(string Hash, string AccountId, DateTimeOffset ExpiresAt);
    private sealed record State(List<AccountRecord> Accounts, List<RefreshEntry> RefreshTokens, List<AccessEntry> AccessTokens);

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly PasswordHasher<AccountRecord> hasher = new();
    private readonly SemaphoreSlim gate = new(1, 1);
    // Equalises timing for unknown e-mail addresses so login does not reveal which accounts exist.
    private readonly string dummyHash = new PasswordHasher<AccountRecord>().HashPassword(null!, "xinobi-timing-equaliser");
    private string FilePath => Path.Combine(commerce.DataDirectory, "identity", "accounts.json");

    private async Task<State> Read() => File.Exists(FilePath)
        ? JsonSerializer.Deserialize<State>(await File.ReadAllTextAsync(FilePath), JsonOptions)!
        : new([], [], []);

    private async Task Write(State state)
    {
        var now = clock.GetUtcNow();
        state.AccessTokens.RemoveAll(entry => entry.ExpiresAt <= now);
        state.RefreshTokens.RemoveAll(entry => entry.ExpiresAt <= now);
        Directory.CreateDirectory(Path.GetDirectoryName(FilePath)!);
        var temporary = FilePath + ".tmp";
        await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(state, JsonOptions));
        File.Move(temporary, FilePath, true);
    }

    private async Task<T> Locked<T>(Func<State, Task<T>> action)
    {
        await gate.WaitAsync();
        try { return await action(await Read()); }
        finally { gate.Release(); }
    }

    public Task<AccountRecord> Register(string name, string email, string password) => Locked(async state =>
    {
        if (state.Accounts.Any(account => account.Email == email))
            throw new AccountException("email_taken", "Bu e-posta ile hesap zaten var. Giriş yap.", StatusCodes.Status409Conflict);
        if (state.Accounts.Count >= 10_000) throw new AccountException("capacity", "Hesap kapasitesine ulaşıldı.", StatusCodes.Status503ServiceUnavailable);
        var draft = new AccountRecord(Guid.NewGuid().ToString("N"), name, email, "", clock.GetUtcNow());
        var account = draft with { PasswordHash = hasher.HashPassword(draft, password) };
        state.Accounts.Add(account);
        await Write(state);
        return account;
    });

    public Task<AccountRecord?> Login(string email, string password) => Locked(state =>
    {
        var account = state.Accounts.FirstOrDefault(item => item.Email == email);
        if (account is null)
        {
            hasher.VerifyHashedPassword(null!, dummyHash, password);
            return Task.FromResult<AccountRecord?>(null);
        }
        return Task.FromResult(hasher.VerifyHashedPassword(account, account.PasswordHash, password) == PasswordVerificationResult.Failed ? null : account);
    });

    public Task<IssuedTokens> IssueTokens(string accountId) => Locked(async state =>
    {
        var tokens = Issue(state, accountId, Guid.NewGuid().ToString("N"));
        await Write(state);
        return tokens;
    });

    private IssuedTokens Issue(State state, string accountId, string familyId)
    {
        var now = clock.GetUtcNow();
        var access = AccountRules.NewToken();
        var refresh = AccountRules.NewToken();
        state.AccessTokens.Add(new(AccountRules.Hash(access), accountId, now + AccountRules.AccessTokenLifetime));
        state.RefreshTokens.Add(new(AccountRules.Hash(refresh), familyId, accountId, now + AccountRules.RefreshTokenLifetime, null, null));
        return new(access, now + AccountRules.AccessTokenLifetime, refresh, now + AccountRules.RefreshTokenLifetime);
    }

    public Task<(AccountRecord Account, IssuedTokens Tokens)> Refresh(string refreshToken) => Locked(async state =>
    {
        var now = clock.GetUtcNow();
        var hash = AccountRules.Hash(refreshToken ?? "");
        var index = state.RefreshTokens.FindIndex(entry => entry.Hash == hash);
        var entry = index < 0 ? null : state.RefreshTokens[index];
        if (entry is null || entry.RevokedAt is not null || entry.ExpiresAt <= now) throw Invalid();
        if (entry.UsedAt is not null)
        {
            // A rotated token came back: assume theft and end every session in the family.
            RevokeFamily(state, entry.FamilyId, now);
            await Write(state);
            throw Invalid();
        }
        var account = state.Accounts.FirstOrDefault(item => item.Id == entry.AccountId) ?? throw Invalid();
        state.RefreshTokens[index] = entry with { UsedAt = now };
        var tokens = Issue(state, account.Id, entry.FamilyId);
        await Write(state);
        return (account, tokens);
    });

    public Task Revoke(string refreshToken) => Locked(async state =>
    {
        var entry = state.RefreshTokens.FirstOrDefault(item => item.Hash == AccountRules.Hash(refreshToken ?? ""));
        if (entry is not null)
        {
            RevokeFamily(state, entry.FamilyId, clock.GetUtcNow());
            await Write(state);
        }
        return true;
    });

    private static void RevokeFamily(State state, string familyId, DateTimeOffset now)
    {
        var accounts = state.RefreshTokens.Where(item => item.FamilyId == familyId).Select(item => item.AccountId).ToHashSet();
        for (var i = 0; i < state.RefreshTokens.Count; i++)
            if (state.RefreshTokens[i].FamilyId == familyId) state.RefreshTokens[i] = state.RefreshTokens[i] with { RevokedAt = now };
        // Access tokens are not linked to a family; dropping the account's tokens is the conservative choice for a dev store.
        state.AccessTokens.RemoveAll(item => accounts.Contains(item.AccountId));
    }

    public Task<AccountRecord?> FindByAccessToken(string accessToken) => Locked(state =>
    {
        var hash = AccountRules.Hash(accessToken);
        var entry = state.AccessTokens.FirstOrDefault(item => item.Hash == hash && item.ExpiresAt > clock.GetUtcNow());
        return Task.FromResult(entry is null ? null : state.Accounts.FirstOrDefault(account => account.Id == entry.AccountId));
    });

    public Task<AccountRecord?> FindById(string accountId) =>
        Locked(state => Task.FromResult(state.Accounts.FirstOrDefault(account => account.Id == accountId)));

    public Task<AccountRecord?> AssignRole(string email, string role) => Locked(async state =>
    {
        var index = state.Accounts.FindIndex(account => account.Email == email);
        if (index < 0) return null;
        var account = state.Accounts[index];
        if (!account.RoleCodes.Contains(role))
        {
            state.Accounts[index] = account = account with { Roles = [.. account.RoleCodes, role] };
            await Write(state);
        }
        return account;
    });

    public Task<bool> AnyWithRole(string role) => Locked(state => Task.FromResult(state.Accounts.Any(account => account.RoleCodes.Contains(role))));

    private static AccountException Invalid() =>
        new("invalid_refresh_token", "Oturumun sona erdi. Tekrar giriş yap.", StatusCodes.Status401Unauthorized);
}
