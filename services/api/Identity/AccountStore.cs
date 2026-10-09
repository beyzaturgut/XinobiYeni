using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Identity;

/// <summary><paramref name="Roles"/> is empty for customers; staff accounts carry panel roles (Faz03 03.04).</summary>
public record AccountRecord(string Id, string Name, string Email, string PasswordHash, DateTimeOffset CreatedAt, string[]? Roles = null, string? Phone = null)
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
    /// <summary>Updates the name and, when <paramref name="phone"/> is not null, the phone ("" removes it); null when the account no longer exists.</summary>
    Task<AccountRecord?> UpdateProfile(string accountId, string name, string? phone);
    /// <summary>Throws <c>wrong_password</c> or <c>email_taken</c>; the caller has already confirmed the code sent to <paramref name="newEmail"/>.</summary>
    Task<AccountRecord> ChangeEmail(string accountId, string currentPassword, string newEmail);
    /// <summary>Removes the account with its sessions, addresses and orders; false when the password is wrong.</summary>
    Task<bool> Delete(string accountId, string currentPassword);
    Task<bool> EmailInUse(string email);
    Task<bool> CheckPassword(string accountId, string password);
    Task<CustomerAddress[]> Addresses(string accountId);
    /// <summary>Adds (<paramref name="addressId"/> null) or replaces an address; the first one and any marked default become the default.</summary>
    Task<CustomerAddress> SaveAddress(string accountId, string? addressId, SaveCustomerAddress address);
    Task<bool> DeleteAddress(string accountId, string addressId);
    Task<CustomerOrder[]> Orders(string accountId);
    /// <summary>Stores the order built by <paramref name="build"/> unless one with the same request id exists, which is returned instead.</summary>
    Task<CustomerOrder> PlaceOrder(string accountId, string clientRequestId, Func<CustomerOrder> build);
    /// <summary>False when <paramref name="currentPassword"/> is wrong. On success every session of the account is signed out.</summary>
    Task<bool> ChangePassword(string accountId, string currentPassword, string newPassword);
    /// <summary>
    /// Saves <paramref name="change"/>'s result for the order; <paramref name="accountId"/> null lets the panel reach any account's order.
    /// Throws <c>order_not_found</c>; whatever <paramref name="change"/> throws leaves the order untouched.
    /// </summary>
    Task<(CustomerOrder Order, AccountRecord Account)> ChangeOrder(string? accountId, string orderId, Func<CustomerOrder, CustomerOrder> change);
    /// <summary>Every account's orders, newest first, for the panel.</summary>
    Task<StaffOrder[]> AllOrders();
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
    public Task<AccountRecord?> UpdateProfile(string accountId, string name, string? phone) => throw new AccountUnavailableException();
    public Task<AccountRecord> ChangeEmail(string accountId, string currentPassword, string newEmail) => throw new AccountUnavailableException();
    public Task<bool> Delete(string accountId, string currentPassword) => throw new AccountUnavailableException();
    public Task<bool> EmailInUse(string email) => throw new AccountUnavailableException();
    public Task<bool> CheckPassword(string accountId, string password) => throw new AccountUnavailableException();
    public Task<CustomerAddress[]> Addresses(string accountId) => throw new AccountUnavailableException();
    public Task<CustomerAddress> SaveAddress(string accountId, string? addressId, SaveCustomerAddress address) => throw new AccountUnavailableException();
    public Task<bool> DeleteAddress(string accountId, string addressId) => throw new AccountUnavailableException();
    public Task<CustomerOrder[]> Orders(string accountId) => throw new AccountUnavailableException();
    public Task<CustomerOrder> PlaceOrder(string accountId, string clientRequestId, Func<CustomerOrder> build) => throw new AccountUnavailableException();
    public Task<bool> ChangePassword(string accountId, string currentPassword, string newPassword) => throw new AccountUnavailableException();
    public Task<(CustomerOrder Order, AccountRecord Account)> ChangeOrder(string? accountId, string orderId, Func<CustomerOrder, CustomerOrder> change) => throw new AccountUnavailableException();
    public Task<StaffOrder[]> AllOrders() => throw new AccountUnavailableException();
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

/// <summary>Development-only file store beside the local commerce data (ADR-003). Replaced by <see cref="SqlAccountStore"/> after the import.</summary>
public sealed class DevFileAccountStore(LocalCommerceStore commerce, TimeProvider clock) : IAccountStore
{
    private sealed record RefreshEntry(string Hash, string FamilyId, string AccountId, DateTimeOffset ExpiresAt, DateTimeOffset? UsedAt, DateTimeOffset? RevokedAt);
    private sealed record AccessEntry(string Hash, string AccountId, DateTimeOffset ExpiresAt);
    private sealed record StoredAddress(string AccountId, CustomerAddress Address);
    private sealed record StoredOrder(string AccountId, string RequestId, CustomerOrder Order);
    // Addresses and demo orders were added later; files written before have no such lists.
    private sealed record State(List<AccountRecord> Accounts, List<RefreshEntry> RefreshTokens, List<AccessEntry> AccessTokens, List<StoredAddress>? Addresses = null, List<StoredOrder>? Orders = null);

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly PasswordHasher<AccountRecord> hasher = new();
    private readonly SemaphoreSlim gate = new(1, 1);
    // Equalises timing for unknown e-mail addresses so login does not reveal which accounts exist.
    private readonly string dummyHash = new PasswordHasher<AccountRecord>().HashPassword(null!, "xinobi-timing-equaliser");
    private string FilePath => Path.Combine(commerce.DataDirectory, "identity", "accounts.json");

    private async Task<State> Read()
    {
        var state = File.Exists(FilePath) ? JsonSerializer.Deserialize<State>(await File.ReadAllTextAsync(FilePath), JsonOptions)! : new([], [], []);
        return state with { Addresses = state.Addresses ?? [], Orders = state.Orders ?? [] };
    }

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

    public Task<AccountRecord?> UpdateProfile(string accountId, string name, string? phone) => Locked(async state =>
    {
        var index = state.Accounts.FindIndex(account => account.Id == accountId);
        if (index < 0) return null;
        var account = state.Accounts[index] with { Name = name };
        if (phone is not null) account = account with { Phone = phone.Length == 0 ? null : phone };
        state.Accounts[index] = account;
        await Write(state);
        return account;
    });

    public Task<bool> EmailInUse(string email) => Locked(state => Task.FromResult(state.Accounts.Any(account => account.Email == email)));

    public Task<bool> CheckPassword(string accountId, string password) => Locked(state =>
    {
        var account = state.Accounts.FirstOrDefault(item => item.Id == accountId);
        return Task.FromResult(account is not null && hasher.VerifyHashedPassword(account, account.PasswordHash, password) != PasswordVerificationResult.Failed);
    });

    public Task<AccountRecord> ChangeEmail(string accountId, string currentPassword, string newEmail) => Locked(async state =>
    {
        var index = state.Accounts.FindIndex(account => account.Id == accountId);
        var account = index < 0 ? null : state.Accounts[index];
        if (account is null || hasher.VerifyHashedPassword(account, account.PasswordHash, currentPassword) == PasswordVerificationResult.Failed)
            throw new AccountException("wrong_password", "Mevcut parolan hatalı.");
        if (state.Accounts.Any(other => other.Id != accountId && other.Email == newEmail))
            throw new AccountException("email_taken", "Bu e-posta başka bir hesapta kullanılıyor.", StatusCodes.Status409Conflict);
        state.Accounts[index] = account = account with { Email = newEmail };
        await Write(state);
        return account;
    });

    public Task<bool> Delete(string accountId, string currentPassword) => Locked(async state =>
    {
        var account = state.Accounts.FirstOrDefault(item => item.Id == accountId);
        if (account is null || hasher.VerifyHashedPassword(account, account.PasswordHash, currentPassword) == PasswordVerificationResult.Failed) return false;
        state.Accounts.Remove(account);
        state.RefreshTokens.RemoveAll(entry => entry.AccountId == accountId);
        state.AccessTokens.RemoveAll(entry => entry.AccountId == accountId);
        state.Addresses!.RemoveAll(entry => entry.AccountId == accountId);
        state.Orders!.RemoveAll(entry => entry.AccountId == accountId);
        await Write(state);
        return true;
    });

    public Task<CustomerAddress[]> Addresses(string accountId) => Locked(state => Task.FromResult(AddressesOf(state, accountId)));

    private static CustomerAddress[] AddressesOf(State state, string accountId) =>
        state.Addresses!.Where(entry => entry.AccountId == accountId).Select(entry => entry.Address).OrderByDescending(address => address.IsDefault).ToArray();

    public Task<CustomerAddress> SaveAddress(string accountId, string? addressId, SaveCustomerAddress address) => Locked(async state =>
    {
        var mine = state.Addresses!.Where(entry => entry.AccountId == accountId).ToList();
        var existing = addressId is null ? null : mine.FirstOrDefault(entry => entry.Address.Id == addressId)
            ?? throw new AccountException("address_not_found", "Adres bulunamadı.", StatusCodes.Status404NotFound);
        if (existing is null && mine.Count >= CustomerRules.MaxAddresses)
            throw new AccountException("address_limit", $"En fazla {CustomerRules.MaxAddresses} adres kaydedebilirsin.", StatusCodes.Status409Conflict);
        // The first address is always the default; the default cannot be switched off without choosing another.
        var isDefault = address.IsDefault || mine.Count == 0 || existing is { Address.IsDefault: true };
        var saved = new CustomerAddress(existing?.Address.Id ?? Guid.NewGuid().ToString("N"), address.Title, address.FullName, address.Phone,
            address.City, address.District, address.Line, address.PostalCode, isDefault);
        if (isDefault)
            for (var i = 0; i < state.Addresses!.Count; i++)
                if (state.Addresses[i].AccountId == accountId && state.Addresses[i].Address.IsDefault)
                    state.Addresses[i] = state.Addresses[i] with { Address = state.Addresses[i].Address with { IsDefault = false } };
        var index = existing is null ? -1 : state.Addresses!.FindIndex(entry => entry.AccountId == accountId && entry.Address.Id == saved.Id);
        if (index >= 0) state.Addresses![index] = new StoredAddress(accountId, saved);
        else state.Addresses!.Add(new StoredAddress(accountId, saved));
        await Write(state);
        return saved;
    });

    public Task<bool> DeleteAddress(string accountId, string addressId) => Locked(async state =>
    {
        var entry = state.Addresses!.FirstOrDefault(item => item.AccountId == accountId && item.Address.Id == addressId);
        if (entry is null) return false;
        state.Addresses!.Remove(entry);
        // Removing the default promotes the next address so one is always preselected at checkout.
        if (entry.Address.IsDefault && state.Addresses.FindIndex(item => item.AccountId == accountId) is var next and >= 0)
            state.Addresses[next] = state.Addresses[next] with { Address = state.Addresses[next].Address with { IsDefault = true } };
        await Write(state);
        return true;
    });

    public Task<CustomerOrder[]> Orders(string accountId) => Locked(state => Task.FromResult(
        state.Orders!.Where(entry => entry.AccountId == accountId).Select(entry => entry.Order).OrderByDescending(order => order.CreatedAt).ToArray()));

    public Task<CustomerOrder> PlaceOrder(string accountId, string clientRequestId, Func<CustomerOrder> build) => Locked(async state =>
    {
        if (state.Orders!.FirstOrDefault(entry => entry.AccountId == accountId && entry.RequestId == clientRequestId) is { } existing) return existing.Order;
        if (state.Orders!.Count(entry => entry.AccountId == accountId) >= 200)
            throw new AccountException("order_limit", "Demo sipariş sınırına ulaşıldı.", StatusCodes.Status409Conflict);
        var order = build();
        state.Orders!.Add(new StoredOrder(accountId, clientRequestId, order));
        await Write(state);
        return order;
    });

    public Task<bool> ChangePassword(string accountId, string currentPassword, string newPassword) => Locked(async state =>
    {
        var index = state.Accounts.FindIndex(account => account.Id == accountId);
        var account = index < 0 ? null : state.Accounts[index];
        if (account is null || hasher.VerifyHashedPassword(account, account.PasswordHash, currentPassword) == PasswordVerificationResult.Failed) return false;
        state.Accounts[index] = account with { PasswordHash = hasher.HashPassword(account, newPassword) };
        // A changed password signs out every device; the caller issues a fresh session for the one that made the change.
        var now = clock.GetUtcNow();
        for (var i = 0; i < state.RefreshTokens.Count; i++)
            if (state.RefreshTokens[i].AccountId == accountId && state.RefreshTokens[i].RevokedAt is null) state.RefreshTokens[i] = state.RefreshTokens[i] with { RevokedAt = now };
        state.AccessTokens.RemoveAll(entry => entry.AccountId == accountId);
        await Write(state);
        return true;
    });

    public Task<(CustomerOrder Order, AccountRecord Account)> ChangeOrder(string? accountId, string orderId, Func<CustomerOrder, CustomerOrder> change) => Locked(async state =>
    {
        var index = state.Orders!.FindIndex(entry => entry.Order.Id == orderId && (accountId is null || entry.AccountId == accountId));
        var account = index < 0 ? null : state.Accounts.FirstOrDefault(item => item.Id == state.Orders[index].AccountId);
        if (account is null) throw new AccountException("order_not_found", "Sipariş bulunamadı.", StatusCodes.Status404NotFound);
        var order = change(state.Orders[index].Order);
        state.Orders[index] = state.Orders[index] with { Order = order };
        await Write(state);
        return (order, account);
    });

    public Task<StaffOrder[]> AllOrders() => Locked(state => Task.FromResult(state.Orders!
        .Select(entry => (entry, account: state.Accounts.FirstOrDefault(item => item.Id == entry.AccountId)))
        .Where(pair => pair.account is not null)
        .Select(pair => new StaffOrder(pair.entry.Order, pair.account!.Id, pair.account.Name, pair.account.Email, pair.account.Phone))
        .OrderByDescending(item => item.Order.CreatedAt).ToArray()));

    /// <summary>Everything in the file, for the one-time SQL import. Read-only; the file is left untouched.</summary>
    public Task<AccountSnapshot> Export() => Locked(state => Task.FromResult(new AccountSnapshot(
        [.. state.Accounts],
        [.. state.RefreshTokens.Select(x => new AccountSnapshot.Refresh(x.Hash, x.FamilyId, x.AccountId, x.ExpiresAt, x.UsedAt, x.RevokedAt))],
        [.. state.AccessTokens.Select(x => new AccountSnapshot.Access(x.Hash, x.AccountId, x.ExpiresAt))],
        [.. state.Addresses!.Select(x => new AccountSnapshot.Address(x.AccountId, x.Address))],
        [.. state.Orders!.Select(x => new AccountSnapshot.Order(x.AccountId, x.RequestId, x.Order))])));

    private static AccountException Invalid() =>
        new("invalid_refresh_token", "Oturumun sona erdi. Tekrar giriş yap.", StatusCodes.Status401Unauthorized);
}

public sealed record AccountSnapshot(AccountRecord[] Accounts, AccountSnapshot.Refresh[] RefreshTokens, AccountSnapshot.Access[] AccessTokens, AccountSnapshot.Address[] Addresses, AccountSnapshot.Order[] Orders)
{
    public sealed record Refresh(string Hash, string FamilyId, string AccountId, DateTimeOffset ExpiresAt, DateTimeOffset? UsedAt, DateTimeOffset? RevokedAt);
    public sealed record Access(string Hash, string AccountId, DateTimeOffset ExpiresAt);
    public sealed record Address(string AccountId, CustomerAddress Value);
    public sealed record Order(string AccountId, string RequestId, CustomerOrder Value);
}
