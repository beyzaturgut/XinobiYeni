using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Xinobi.Api.Catalog;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;
using StoredRefreshSession = Xinobi.Persistence.Entities.RefreshSession;

namespace Xinobi.Api.Identity;

/// <summary>
/// Accounts, token sessions, addresses and demo orders in SQL Server (0003 schema), with the same contract and rules as
/// <see cref="DevFileAccountStore"/>. Writes for one account run in a transaction under an application lock on that account,
/// so concurrent requests across API processes cannot interleave. SQL errors surface as 503, never as a file fallback.
/// </summary>
public sealed class SqlAccountStore(IServiceScopeFactory scopes, TimeProvider clock) : IAccountStore
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private readonly PasswordHasher<AccountRecord> hasher = new();
    // Equalises timing for unknown e-mail addresses so login does not reveal which accounts exist.
    private readonly string dummyHash = new PasswordHasher<AccountRecord>().HashPassword(null!, "xinobi-timing-equaliser");

    private async Task<T> Run<T>(string? lockResource, Func<XinobiDbContext, Task<T>> action)
    {
        try
        {
            await using var scope = scopes.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
            await using var transaction = await db.Database.BeginTransactionAsync();
            if (lockResource is not null)
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    DECLARE @result int;
                    EXEC @result = sys.sp_getapplock @Resource={lockResource}, @LockMode=N'Exclusive', @LockOwner=N'Transaction', @LockTimeout=10000;
                    IF @result < 0 THROW 51000, 'Account lock unavailable', 1;
                    """);
            var result = await action(db);
            await transaction.CommitAsync();
            return result;
        }
        catch (Exception error) when (error is SqlException or DbUpdateException or InvalidOperationException { InnerException: SqlException })
        {
            throw new AccountUnavailableException();
        }
    }

    private static string Lock(string accountId) => "Xinobi.Account." + accountId;
    private const string RegistryLock = "Xinobi.Account.Registry";

    private static Guid Key(string id) => Guid.TryParse(id, out var value) ? value : Guid.Empty;
    private static string Id(Guid id) => id.ToString("N");

    private static async Task<AccountRecord?> Account(XinobiDbContext db, Guid id)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return user is null ? null : await Record(db, user);
    }

    private static async Task<AccountRecord> Record(XinobiDbContext db, User user)
    {
        var roles = await db.UserRoles.AsNoTracking().Where(x => x.UserId == user.Id).Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Code).OrderBy(x => x).ToArrayAsync();
        return new AccountRecord(Id(user.Id), user.DisplayName ?? "", user.Email, user.PasswordHash ?? "", user.CreatedAt, roles.Length == 0 ? null : roles, user.Phone);
    }

    public Task<AccountRecord> Register(string name, string email, string password) => Run(RegistryLock, async db =>
    {
        if (await db.Users.AnyAsync(x => x.NormalizedEmail == email))
            throw new AccountException("email_taken", "Bu e-posta ile hesap zaten var. Giriş yap.", StatusCodes.Status409Conflict);
        var now = clock.GetUtcNow();
        var draft = new AccountRecord(Id(Guid.NewGuid()), name, email, "", now);
        var account = draft with { PasswordHash = hasher.HashPassword(draft, password) };
        db.Users.Add(new User
        {
            Id = Key(account.Id), Email = email, NormalizedEmail = email, DisplayName = name, PasswordHash = account.PasswordHash,
            Kind = UserKinds.Customer, Status = UserStatuses.Active, CreatedAt = now, UpdatedAt = now,
        });
        await db.SaveChangesAsync();
        return account;
    });

    public Task<AccountRecord?> Login(string email, string password) => Run(null, async db =>
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.NormalizedEmail == email && x.Status == UserStatuses.Active);
        if (user is null)
        {
            hasher.VerifyHashedPassword(null!, dummyHash, password);
            return null;
        }
        var account = await Record(db, user);
        return hasher.VerifyHashedPassword(account, account.PasswordHash, password) == PasswordVerificationResult.Failed ? null : account;
    });

    public Task<IssuedTokens> IssueTokens(string accountId) => Run(Lock(accountId), async db =>
    {
        var tokens = Issue(db, Key(accountId), Guid.NewGuid());
        await Prune(db, Key(accountId));
        await db.SaveChangesAsync();
        return tokens;
    });

    private IssuedTokens Issue(XinobiDbContext db, Guid userId, Guid familyId)
    {
        var now = clock.GetUtcNow();
        var access = AccountRules.NewToken();
        var refresh = AccountRules.NewToken();
        db.AccessSessions.Add(new AccessSession { TokenHash = AccountRules.Hash(access), UserId = userId, ExpiresAt = now + AccountRules.AccessTokenLifetime });
        db.RefreshSessions.Add(new StoredRefreshSession { TokenHash = AccountRules.Hash(refresh), FamilyId = familyId, UserId = userId, ExpiresAt = now + AccountRules.RefreshTokenLifetime });
        return new(access, now + AccountRules.AccessTokenLifetime, refresh, now + AccountRules.RefreshTokenLifetime);
    }

    /// <summary>Expired sessions of the account are removed as it issues new ones (the file store prunes on every write).</summary>
    private async Task Prune(XinobiDbContext db, Guid userId)
    {
        var now = clock.GetUtcNow();
        await db.AccessSessions.Where(x => x.UserId == userId && x.ExpiresAt <= now).ExecuteDeleteAsync();
        await db.RefreshSessions.Where(x => x.UserId == userId && x.ExpiresAt <= now).ExecuteDeleteAsync();
    }

    public async Task<(AccountRecord Account, IssuedTokens Tokens)> Refresh(string refreshToken)
    {
        var hash = AccountRules.Hash(refreshToken ?? "");
        // The session's account is read first so the write lock covers exactly that account.
        var owner = await Run(null, db => db.RefreshSessions.AsNoTracking().Where(x => x.TokenHash == hash).Select(x => (Guid?)x.UserId).FirstOrDefaultAsync());
        if (owner is null) throw Invalid();
        var outcome = await Run(Lock(Id(owner.Value)), async db =>
        {
            var now = clock.GetUtcNow();
            var entry = await db.RefreshSessions.FirstOrDefaultAsync(x => x.TokenHash == hash);
            if (entry is null || entry.RevokedAt is not null || entry.ExpiresAt <= now) return ((AccountRecord?)null, (IssuedTokens?)null);
            if (entry.UsedAt is not null)
            {
                // A rotated token came back: assume theft and end every session in the family.
                await RevokeFamily(db, entry.FamilyId, now);
                return (null, null);
            }
            var account = await Account(db, entry.UserId);
            if (account is null) return (null, null);
            entry.UsedAt = now;
            var tokens = Issue(db, entry.UserId, entry.FamilyId);
            await db.SaveChangesAsync();
            return ((AccountRecord?)account, (IssuedTokens?)tokens);
        });
        return outcome is ({ } found, { } issued) ? (found, issued) : throw Invalid();
    }

    public Task Revoke(string refreshToken) => Run(null, async db =>
    {
        var entry = await db.RefreshSessions.AsNoTracking().FirstOrDefaultAsync(x => x.TokenHash == AccountRules.Hash(refreshToken ?? ""));
        if (entry is not null) await RevokeFamily(db, entry.FamilyId, clock.GetUtcNow());
        return true;
    });

    private static async Task RevokeFamily(XinobiDbContext db, Guid familyId, DateTimeOffset now)
    {
        var users = await db.RefreshSessions.Where(x => x.FamilyId == familyId).Select(x => x.UserId).Distinct().ToArrayAsync();
        await db.RefreshSessions.Where(x => x.FamilyId == familyId).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, now));
        // Access tokens are not linked to a family; dropping the account's tokens is the conservative choice (same as the file store).
        await db.AccessSessions.Where(x => users.Contains(x.UserId)).ExecuteDeleteAsync();
    }

    public Task<AccountRecord?> FindByAccessToken(string accessToken) => Run(null, async db =>
    {
        var hash = AccountRules.Hash(accessToken);
        var now = clock.GetUtcNow();
        var userId = await db.AccessSessions.AsNoTracking().Where(x => x.TokenHash == hash && x.ExpiresAt > now).Select(x => (Guid?)x.UserId).FirstOrDefaultAsync();
        return userId is null ? null : await Account(db, userId.Value);
    });

    public Task<AccountRecord?> FindById(string accountId) => Run(null, db => Account(db, Key(accountId)));

    public Task<AccountRecord?> AssignRole(string email, string role) => Run(RegistryLock, async db =>
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == email);
        if (user is null) return null;
        var entity = await db.Roles.FirstOrDefaultAsync(x => x.Code == role);
        if (entity is null)
        {
            entity = new Role { Id = Guid.NewGuid(), Code = role, Name = role };
            db.Roles.Add(entity);
        }
        if (!await db.UserRoles.AnyAsync(x => x.UserId == user.Id && x.RoleId == entity.Id))
            db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = entity.Id, AssignedAt = clock.GetUtcNow() });
        user.Kind = UserKinds.Staff;
        user.UpdatedAt = clock.GetUtcNow();
        await db.SaveChangesAsync();
        return await Record(db, user);
    });

    public Task<bool> AnyWithRole(string role) => Run(null, db => db.UserRoles.Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Code).AnyAsync(code => code == role));

    public Task<AccountRecord?> UpdateProfile(string accountId, string name, string? phone) => Run(Lock(accountId), async db =>
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == Key(accountId));
        if (user is null) return null;
        user.DisplayName = name;
        if (phone is not null) user.Phone = phone.Length == 0 ? null : phone;
        user.UpdatedAt = clock.GetUtcNow();
        await db.SaveChangesAsync();
        return await Record(db, user);
    });

    public Task<bool> EmailInUse(string email) => Run(null, db => db.Users.AnyAsync(x => x.NormalizedEmail == email));

    public Task<bool> CheckPassword(string accountId, string password) => Run(null, async db =>
    {
        var account = await Account(db, Key(accountId));
        return account is not null && hasher.VerifyHashedPassword(account, account.PasswordHash, password) != PasswordVerificationResult.Failed;
    });

    public Task<AccountRecord> ChangeEmail(string accountId, string currentPassword, string newEmail) => Run(RegistryLock, async db =>
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == Key(accountId));
        var account = user is null ? null : await Record(db, user);
        if (account is null || hasher.VerifyHashedPassword(account, account.PasswordHash, currentPassword) == PasswordVerificationResult.Failed)
            throw new AccountException("wrong_password", "Mevcut parolan hatalı.");
        if (await db.Users.AnyAsync(x => x.Id != user!.Id && x.NormalizedEmail == newEmail))
            throw new AccountException("email_taken", "Bu e-posta başka bir hesapta kullanılıyor.", StatusCodes.Status409Conflict);
        user!.Email = newEmail;
        user.NormalizedEmail = newEmail;
        user.UpdatedAt = clock.GetUtcNow();
        await db.SaveChangesAsync();
        return account with { Email = newEmail };
    });

    /// <summary>
    /// Same contract as the file store: the account goes with its sessions, addresses and demo orders. The orders FK restricts
    /// deletes, so orders are removed explicitly here; whether real orders must be kept (tax law, D10) is an open decision.
    /// </summary>
    public Task<bool> Delete(string accountId, string currentPassword) => Run(Lock(accountId), async db =>
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == Key(accountId));
        var account = user is null ? null : await Record(db, user);
        if (account is null || hasher.VerifyHashedPassword(account, account.PasswordHash, currentPassword) == PasswordVerificationResult.Failed) return false;
        var orders = db.SalesOrders.Where(x => x.UserId == user!.Id).Select(x => x.Id);
        await db.SalesOrderLines.Where(x => orders.Contains(x.OrderId)).ExecuteDeleteAsync();
        await db.SalesOrders.Where(x => x.UserId == user!.Id).ExecuteDeleteAsync();
        db.Users.Remove(user!);
        await db.SaveChangesAsync();
        return true;
    });

    private static CustomerAddress Address(CustomerDeliveryAddress x) => new(Id(x.Id), x.Title, x.FullName, x.Phone, x.City, x.District, x.Line, x.PostalCode, x.IsDefault);

    public Task<CustomerAddress[]> Addresses(string accountId) => Run(null, async db =>
        (await db.CustomerAddresses.AsNoTracking().Where(x => x.UserId == Key(accountId)).OrderByDescending(x => x.IsDefault).ThenBy(x => x.Position).ToArrayAsync()).Select(Address).ToArray());

    public Task<CustomerAddress> SaveAddress(string accountId, string? addressId, SaveCustomerAddress address) => Run(Lock(accountId), async db =>
    {
        var userId = Key(accountId);
        var mine = await db.CustomerAddresses.Where(x => x.UserId == userId).OrderBy(x => x.Position).ToListAsync();
        var existing = addressId is null ? null : mine.FirstOrDefault(x => x.Id == Key(addressId))
            ?? throw new AccountException("address_not_found", "Adres bulunamadı.", StatusCodes.Status404NotFound);
        if (existing is null && mine.Count >= CustomerRules.MaxAddresses)
            throw new AccountException("address_limit", $"En fazla {CustomerRules.MaxAddresses} adres kaydedebilirsin.", StatusCodes.Status409Conflict);
        // The first address is always the default; the default cannot be switched off without choosing another.
        var isDefault = address.IsDefault || mine.Count == 0 || existing is { IsDefault: true };
        if (isDefault)
        {
            foreach (var other in mine.Where(x => x.IsDefault && x != existing)) other.IsDefault = false;
            // The filtered unique index allows one default per account at any moment, so the old one is cleared first.
            await db.SaveChangesAsync();
        }
        var row = existing ?? new CustomerDeliveryAddress
        {
            Id = Guid.NewGuid(), UserId = userId, Position = mine.Count == 0 ? 0 : mine.Max(x => x.Position) + 1,
            Title = "", FullName = "", Phone = "", City = "", District = "", Line = "",
        };
        (row.Title, row.FullName, row.Phone, row.City, row.District, row.Line, row.PostalCode, row.IsDefault) =
            (address.Title, address.FullName, address.Phone, address.City, address.District, address.Line, address.PostalCode, isDefault);
        if (existing is null) db.CustomerAddresses.Add(row);
        await db.SaveChangesAsync();
        return Address(row);
    });

    public Task<bool> DeleteAddress(string accountId, string addressId) => Run(Lock(accountId), async db =>
    {
        var userId = Key(accountId);
        var entry = await db.CustomerAddresses.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == Key(addressId));
        if (entry is null) return false;
        db.CustomerAddresses.Remove(entry);
        await db.SaveChangesAsync();
        // Removing the default promotes the next address so one is always preselected at checkout.
        if (entry.IsDefault && await db.CustomerAddresses.Where(x => x.UserId == userId).OrderBy(x => x.Position).FirstOrDefaultAsync() is { } next)
        {
            next.IsDefault = true;
            await db.SaveChangesAsync();
        }
        return true;
    });

    private static CustomerOrder Order(SalesOrder x, IEnumerable<SalesOrderLine> lines) => new(
        Id(x.Id), x.Number, x.CreatedAt, x.Status, JsonSerializer.Deserialize<CustomerAddress>(x.AddressSnapshotJson, Json)!,
        [.. lines.OrderBy(line => line.Position).Select(line => new CustomerOrderLine(line.ProductReference, line.VariantReference, line.Name, line.Color, line.ImageUrl,
            new Money(line.UnitPriceCents, line.Currency), line.Quantity, new Money(line.LineTotalCents, line.Currency)))],
        new Money(x.TotalCents, x.Currency),
        x.ShipmentJson is null ? null : JsonSerializer.Deserialize<OrderShipment>(x.ShipmentJson, Json),
        x.HistoryJson is null ? null : JsonSerializer.Deserialize<OrderEvent[]>(x.HistoryJson, Json),
        x.RequestsJson is null ? null : JsonSerializer.Deserialize<OrderRequest[]>(x.RequestsJson, Json));

    private static async Task<CustomerOrder[]> Orders(XinobiDbContext db, IQueryable<SalesOrder> query)
    {
        var orders = await query.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToArrayAsync();
        var ids = orders.Select(x => x.Id).ToArray();
        var lines = (await db.SalesOrderLines.AsNoTracking().Where(x => ids.Contains(x.OrderId)).ToArrayAsync()).ToLookup(x => x.OrderId);
        return [.. orders.Select(order => Order(order, lines[order.Id]))];
    }

    private static void Write(SalesOrder row, CustomerOrder order)
    {
        row.Status = order.Status;
        row.ShipmentJson = order.Shipment is null ? null : JsonSerializer.Serialize(order.Shipment, Json);
        row.HistoryJson = order.History is null ? null : JsonSerializer.Serialize(order.History, Json);
        row.RequestsJson = order.Requests is null ? null : JsonSerializer.Serialize(order.Requests, Json);
    }

    private static (SalesOrder Order, SalesOrderLine[] Lines) Rows(Guid userId, string requestId, CustomerOrder order)
    {
        var row = new SalesOrder
        {
            Id = Key(order.Id), UserId = userId, ClientRequestId = requestId, Number = order.Number, CreatedAt = order.CreatedAt, Status = order.Status,
            AddressSnapshotJson = JsonSerializer.Serialize(order.Address, Json), TotalCents = order.Total.AmountMinor, Currency = order.Total.Currency,
        };
        Write(row, order);
        var lines = order.Lines.Select((line, index) => new SalesOrderLine
        {
            OrderId = row.Id, Position = index, ProductReference = line.ProductId, VariantReference = line.VariantId, Name = line.Name, Color = line.Color,
            ImageUrl = line.ImageUrl, UnitPriceCents = line.UnitPrice.AmountMinor, Quantity = line.Quantity, LineTotalCents = line.LineTotal.AmountMinor, Currency = line.UnitPrice.Currency,
        }).ToArray();
        return (row, lines);
    }

    public Task<CustomerOrder[]> Orders(string accountId) => Run(null, db => Orders(db, db.SalesOrders.Where(x => x.UserId == Key(accountId))));

    public Task<CustomerOrder> PlaceOrder(string accountId, string clientRequestId, Func<CustomerOrder> build) => Run(Lock(accountId), async db =>
    {
        var userId = Key(accountId);
        if (await db.SalesOrders.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId && x.ClientRequestId == clientRequestId) is { } existing)
            return (await Orders(db, db.SalesOrders.Where(x => x.Id == existing.Id))).Single();
        if (await db.SalesOrders.CountAsync(x => x.UserId == userId) >= 200)
            throw new AccountException("order_limit", "Demo sipariş sınırına ulaşıldı.", StatusCodes.Status409Conflict);
        var order = build();
        var (row, lines) = Rows(userId, clientRequestId, order);
        db.SalesOrders.Add(row);
        db.SalesOrderLines.AddRange(lines);
        await db.SaveChangesAsync();
        return order;
    });

    public Task<bool> ChangePassword(string accountId, string currentPassword, string newPassword) => Run(Lock(accountId), async db =>
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == Key(accountId));
        var account = user is null ? null : await Record(db, user);
        if (account is null || hasher.VerifyHashedPassword(account, account.PasswordHash, currentPassword) == PasswordVerificationResult.Failed) return false;
        user!.PasswordHash = hasher.HashPassword(account, newPassword);
        user.UpdatedAt = clock.GetUtcNow();
        // A changed password signs out every device; the caller issues a fresh session for the one that made the change.
        var now = clock.GetUtcNow();
        await db.RefreshSessions.Where(x => x.UserId == user.Id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, now));
        await db.AccessSessions.Where(x => x.UserId == user.Id).ExecuteDeleteAsync();
        await db.SaveChangesAsync();
        return true;
    });

    public async Task<(CustomerOrder Order, AccountRecord Account)> ChangeOrder(string? accountId, string orderId, Func<CustomerOrder, CustomerOrder> change)
    {
        var id = Key(orderId);
        // The panel passes no account; the owner is looked up so the lock covers that account's writes.
        var owner = await Run(null, db => db.SalesOrders.AsNoTracking().Where(x => x.Id == id && (accountId == null || x.UserId == Key(accountId))).Select(x => (Guid?)x.UserId).FirstOrDefaultAsync())
            ?? throw new AccountException("order_not_found", "Sipariş bulunamadı.", StatusCodes.Status404NotFound);
        return await Run(Lock(Id(owner)), async db =>
        {
            var row = await db.SalesOrders.FirstAsync(x => x.Id == id);
            var current = (await Orders(db, db.SalesOrders.Where(x => x.Id == id))).Single();
            var next = change(current);
            Write(row, next);
            await db.SaveChangesAsync();
            return (next, (await Account(db, owner))!);
        });
    }

    public Task<StaffOrder[]> AllOrders() => Run(null, async db =>
    {
        var orders = await db.SalesOrders.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(1000).ToArrayAsync();
        var ids = orders.Select(x => x.Id).ToArray();
        var users = orders.Select(x => x.UserId).Distinct().ToArray();
        var lines = (await db.SalesOrderLines.AsNoTracking().Where(x => ids.Contains(x.OrderId)).ToArrayAsync()).ToLookup(x => x.OrderId);
        var accounts = await db.Users.AsNoTracking().Where(x => users.Contains(x.Id)).ToDictionaryAsync(x => x.Id);
        return orders.Where(order => accounts.ContainsKey(order.UserId)).Select(order =>
        {
            var user = accounts[order.UserId];
            return new StaffOrder(Order(order, lines[order.Id]), Id(user.Id), user.DisplayName ?? "", user.Email, user.Phone);
        }).ToArray();
    });

    /// <summary>
    /// One-time import of the Development file store into empty SQL identity/order tables, in one transaction. Rows are read
    /// back and compared; any difference rolls everything back. Existing SQL accounts are never overwritten.
    /// </summary>
    public Task<AccountImportResult> Import(AccountSnapshot snapshot) => Run(RegistryLock, async db =>
    {
        if (await db.Users.AnyAsync() || await db.SalesOrders.AnyAsync() || await db.CustomerAddresses.AnyAsync() || await db.RefreshSessions.AnyAsync())
            throw new InvalidOperationException("SQL account tables are not empty; import refused.");
        var now = clock.GetUtcNow();
        foreach (var account in snapshot.Accounts)
        {
            if (Key(account.Id) == Guid.Empty) throw new InvalidOperationException("Account id is not a GUID; import refused.");
            db.Users.Add(new User
            {
                Id = Key(account.Id), Email = account.Email, NormalizedEmail = account.Email, DisplayName = account.Name, Phone = account.Phone,
                PasswordHash = account.PasswordHash, Kind = account.RoleCodes.Count > 0 ? UserKinds.Staff : UserKinds.Customer, Status = UserStatuses.Active,
                CreatedAt = account.CreatedAt, UpdatedAt = now,
            });
        }
        await db.SaveChangesAsync();
        foreach (var code in snapshot.Accounts.SelectMany(account => account.RoleCodes).Distinct())
        {
            var role = await db.Roles.FirstOrDefaultAsync(x => x.Code == code) ?? db.Roles.Add(new Role { Id = Guid.NewGuid(), Code = code, Name = code }).Entity;
            foreach (var account in snapshot.Accounts.Where(account => account.RoleCodes.Contains(code)))
                db.UserRoles.Add(new UserRole { UserId = Key(account.Id), RoleId = role.Id, AssignedAt = now });
        }
        // Only sessions still valid are carried over; expired ones would be pruned anyway.
        foreach (var session in snapshot.RefreshTokens.Where(x => x.ExpiresAt > now))
            db.RefreshSessions.Add(new StoredRefreshSession { TokenHash = session.Hash, FamilyId = Key(session.FamilyId), UserId = Key(session.AccountId), ExpiresAt = session.ExpiresAt, UsedAt = session.UsedAt, RevokedAt = session.RevokedAt });
        foreach (var session in snapshot.AccessTokens.Where(x => x.ExpiresAt > now))
            db.AccessSessions.Add(new AccessSession { TokenHash = session.Hash, UserId = Key(session.AccountId), ExpiresAt = session.ExpiresAt });
        // Defaults first per account keeps the one-default index satisfied while positions follow the file order.
        foreach (var group in snapshot.Addresses.GroupBy(x => x.AccountId))
            foreach (var (entry, position) in group.Select((entry, index) => (entry, index)))
                db.CustomerAddresses.Add(new CustomerDeliveryAddress
                {
                    Id = Key(entry.Value.Id), UserId = Key(group.Key), Position = position, Title = entry.Value.Title, FullName = entry.Value.FullName,
                    Phone = entry.Value.Phone, City = entry.Value.City, District = entry.Value.District, Line = entry.Value.Line,
                    PostalCode = entry.Value.PostalCode, IsDefault = entry.Value.IsDefault,
                });
        foreach (var entry in snapshot.Orders)
        {
            var (row, lines) = Rows(Key(entry.AccountId), entry.RequestId, entry.Value);
            db.SalesOrders.Add(row);
            db.SalesOrderLines.AddRange(lines);
        }
        await db.SaveChangesAsync();

        // Read back and compare with the source; the transaction rolls back on any difference.
        foreach (var account in snapshot.Accounts)
        {
            var stored = await Account(db, Key(account.Id)) ?? throw new InvalidOperationException("Imported account missing.");
            if (!(stored.Email == account.Email && stored.Name == account.Name && stored.PasswordHash == account.PasswordHash && stored.Phone == account.Phone
                  && stored.CreatedAt == account.CreatedAt && stored.RoleCodes.Order().SequenceEqual(account.RoleCodes.Order())))
                throw new InvalidOperationException("Imported account differs from the source.");
            var orders = await Orders(db, db.SalesOrders.Where(x => x.UserId == Key(account.Id)));
            var expected = snapshot.Orders.Where(x => x.AccountId == account.Id).Select(x => x.Value).OrderByDescending(x => x.CreatedAt).ToArray();
            if (JsonSerializer.Serialize(orders, Json) != JsonSerializer.Serialize(expected, Json)) throw new InvalidOperationException("Imported orders differ from the source.");
            var addresses = (await db.CustomerAddresses.AsNoTracking().Where(x => x.UserId == Key(account.Id)).OrderBy(x => x.Position).ToArrayAsync()).Select(Address);
            if (JsonSerializer.Serialize(addresses, Json) != JsonSerializer.Serialize(snapshot.Addresses.Where(x => x.AccountId == account.Id).Select(x => x.Value), Json))
                throw new InvalidOperationException("Imported addresses differ from the source.");
        }
        return new AccountImportResult(snapshot.Accounts.Length, snapshot.Addresses.Length, snapshot.Orders.Length,
            snapshot.RefreshTokens.Count(x => x.ExpiresAt > now), snapshot.AccessTokens.Count(x => x.ExpiresAt > now));
    });

    /// <summary>Removes every expired session (accounts that never sign in again are never pruned on their own write).</summary>
    public Task<int> PruneExpiredSessions() => Run(null, async db =>
    {
        var now = clock.GetUtcNow();
        return await db.AccessSessions.Where(x => x.ExpiresAt <= now).ExecuteDeleteAsync()
            + await db.RefreshSessions.Where(x => x.ExpiresAt <= now).ExecuteDeleteAsync();
    });

    private static AccountException Invalid() =>
        new("invalid_refresh_token", "Oturumun sona erdi. Tekrar giriş yap.", StatusCodes.Status401Unauthorized);
}

public record AccountImportResult(int Accounts, int Addresses, int Orders, int RefreshSessions, int AccessSessions);
