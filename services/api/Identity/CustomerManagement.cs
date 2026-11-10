using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Api.Identity;

public record ChangeCustomerAccess(string Status, string ExpectedVersion);
public record DeleteManagedCustomer(string ExpectedVersion);
public record CustomerManagementAudit(string ActorId, string CustomerId, string Before, string After, DateTimeOffset OccurredAt, string TraceId);

internal static class CustomerManagementRules
{
    public static void Validate(string current, string desired, string? expected, string version)
    {
        if (string.IsNullOrWhiteSpace(expected) || expected.Length > 256)
            throw new AccountException("customer_version_required", "Güncel müşteri kaydını yeniden açın.", 400);
        if (expected != version) throw new AccountException("customer_changed", "Müşteri kaydı değişti. Güncel kaydı yükleyip tekrar inceleyin.", 409);
        if (current == UserStatuses.Deleted) throw new AccountException("customer_deleted", "Silinmiş hesap yeniden etkinleştirilemez.", 409);
        if (desired is not (UserStatuses.Active or UserStatuses.Disabled or UserStatuses.Deleted)
            || desired == UserStatuses.Disabled && current != UserStatuses.Active
            || desired == UserStatuses.Active && current != UserStatuses.Disabled)
            throw new AccountException("invalid_customer_status", "Bu müşteri durumu için işlem uygun değil.", 409);
    }
}

public sealed partial class DevFileAccountStore
{
    static string CustomerVersion(AccountRecord account) => account.ManagementVersion ?? account.Id + ":" + account.CreatedAt.UtcTicks;
    static bool IsCustomer(AccountRecord account) => account.Kind == AccountKinds.Customer && account.RoleCodes.Count == 0;
    static AdminCustomerRow CustomerRow(State state, AccountRecord account)
    {
        var orders = state.Orders!.Where(x => x.AccountId == account.Id).Select(x => x.Order).ToArray();
        return AdminCustomerEndpoints.Mask(new(Guid.Parse(account.Id), account.Name, account.Email, account.Phone, account.Status, account.CreatedAt,
            orders.Length, orders.Length == 0 ? null : orders.Max(x => x.CreatedAt), CustomerVersion(account)));
    }
    static AdminCustomerDetails CustomerDetails(State state, AccountRecord account) => new(CustomerRow(state, account),
        state.Addresses!.Count(x => x.AccountId == account.Id), state.Favorites!.Count(x => x.AccountId == account.Id));
    public Task<AdminCustomerPage> ListCustomers(int page, int size, string? query) => Locked(state =>
    {
        AdminCustomerEndpoints.Validate(page, size, query); var search = query?.Trim() ?? "";
        var all = state.Accounts.Where(IsCustomer).Where(x => search.Length == 0 || x.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
            || x.Email.Contains(search, StringComparison.OrdinalIgnoreCase) || (x.Phone?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false))
            .OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id).ToArray();
        return Task.FromResult(new AdminCustomerPage(all.Skip((page - 1) * size).Take(size).Select(x => CustomerRow(state, x)).ToArray(),page,size,all.Length,(int)Math.Ceiling((double)all.Length/size)));
    });
    public Task<AdminCustomerDetails> CustomerDetails(Guid id) => Locked(state => Task.FromResult(CustomerDetails(state,
        state.Accounts.FirstOrDefault(x => x.Id == id.ToString("N") && IsCustomer(x)) ?? throw new AccountException("customer_not_found", "Müşteri bulunamadı.", 404))));
    public Task<AdminCustomerDetails> ManageCustomer(Guid id, string status, string expected, string actor, string trace) => Locked(async state =>
    {
        var index = state.Accounts.FindIndex(x => x.Id == id.ToString("N") && IsCustomer(x));
        if (index < 0) throw new AccountException("customer_not_found", "Müşteri bulunamadı.", 404);
        var account = state.Accounts[index]; CustomerManagementRules.Validate(account.Status,status,expected,CustomerVersion(account));
        state.Accounts[index] = account with { Status = status, ManagementVersion = Guid.NewGuid().ToString("N") };
        state.AccessTokens.RemoveAll(x => x.AccountId == account.Id); state.RefreshTokens.RemoveAll(x => x.AccountId == account.Id);
        // Status, session invalidation and safe audit persist in the same atomic file replacement.
        state.CustomerManagementAudits!.Add(new(actor,account.Id,account.Status,status,clock.GetUtcNow(),trace));
        try { await Write(state); }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException) { throw new AccountUnavailableException(); }
        return CustomerDetails(state,state.Accounts[index]);
    });
}

public sealed partial class SqlAccountStore
{
    public Task<AdminCustomerDetails> ManageCustomer(Guid id, string status, string expected, string actor, string trace) => Run(RegistryLock, async db =>
    {
        // Serialises against role assignment AND refresh/issue across all API processes.
        var resource = Lock(Id(id));
        await db.Database.ExecuteSqlInterpolatedAsync($"DECLARE @r int; EXEC @r=sys.sp_getapplock @Resource={resource}, @LockMode=N'Exclusive', @LockOwner=N'Transaction', @LockTimeout=10000; IF @r<0 THROW 51000, 'Account lock unavailable', 1;");
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id && x.Kind == UserKinds.Customer && !db.UserRoles.Any(r => r.UserId == x.Id))
            ?? throw new AccountException("customer_not_found", "Müşteri bulunamadı.", 404);
        CustomerManagementRules.Validate(user.Status,status,expected,Convert.ToBase64String(user.RowVersion));
        var before = user.Status; user.Status = status; user.UpdatedAt = clock.GetUtcNow();
        await db.AccessSessions.Where(x => x.UserId == id).ExecuteDeleteAsync();
        await db.RefreshSessions.Where(x => x.UserId == id).ExecuteDeleteAsync();
        db.AuditLogs.Add(new() { ActorUserId = Guid.TryParse(actor,out var actorId) ? actorId : null,Action = "customer." + (status == UserStatuses.Deleted ? "delete" : status == UserStatuses.Disabled ? "suspend" : "activate"),
            EntityType = "User",EntityId = Id(id),OccurredAt = clock.GetUtcNow(),TraceId = trace,
            SafeDiff = System.Text.Json.JsonSerializer.Serialize(new { beforeStatus = before,afterStatus = status,sessionsRevoked = true,ordersPreserved = true }) });
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { throw new AccountException("customer_changed", "Müşteri kaydı değişti. Güncel kaydı yükleyin.", 409); }
        return await AdminCustomerEndpoints.Details(db,id);
    });
}
