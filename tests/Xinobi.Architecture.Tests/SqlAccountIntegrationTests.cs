using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Catalog;
using Xinobi.Api.Identity;
using Xinobi.Persistence;

namespace Xinobi.Architecture.Tests;

public sealed class EmptySqlAccountsFactAttribute : FactAttribute
{
    public EmptySqlAccountsFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL"))
            || Environment.GetEnvironmentVariable("XINOBI_TEST_EMPTY_ACCOUNTS") != "1")
            Skip = "Explicit SQL connection and confirmed empty account tables required; never reads local real credentials.";
    }
}

public sealed class SqlWritesFactAttribute : FactAttribute
{
    public SqlWritesFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")))
            Skip = "Explicit SQL connection required; never reads local real credentials.";
    }
}

/// <summary>The SQL account store keeps the file store's rules: tokens, rotation, addresses, idempotent orders and the one-time import.</summary>
public sealed class SqlAccountIntegrationTests
{
    [SqlWritesFact]
    public async Task FavoritesPersistPerCustomerAndCascadeOnAccountDeletion()
    {
        var services = new ServiceCollection();
        services.AddXinobiPersistence(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<SqlAccountStore>();
        await using var provider = services.BuildServiceProvider();
        var store = provider.GetRequiredService<SqlAccountStore>();
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        var firstEmail = $"favori-{Guid.NewGuid():N}@xinobi-test.invalid";
        var secondEmail = $"favori-{Guid.NewGuid():N}@xinobi-test.invalid";
        try
        {
            var first = await store.Register("Favori Bir", firstEmail, "guclu-parola-1");
            var second = await store.Register("Favori İki", secondEmail, "guclu-parola-2");
            await store.AddFavorite(first.Id, "DEMO-P101");
            await store.AddFavorite(first.Id, "DEMO-P101");
            Assert.Equal(["DEMO-P101"], await store.Favorites(first.Id));
            var reopened = new SqlAccountStore(provider.GetRequiredService<IServiceScopeFactory>(), TimeProvider.System);
            Assert.Equal(["DEMO-P101"], await reopened.Favorites(first.Id));
            Assert.True(await reopened.DeleteFavorite(first.Id, "DEMO-P101"));
            Assert.Empty(await store.Favorites(first.Id));
            await store.AddFavorite(first.Id, "DEMO-P101");
            Assert.Empty(await store.Favorites(second.Id));
            Assert.False(await store.DeleteFavorite(second.Id, "DEMO-P101"));
            Assert.True(await store.Delete(first.Id, "guclu-parola-1"));
            Assert.False(await db.CustomerFavorites.AnyAsync(row => row.UserId == Guid.Parse(first.Id)));
        }
        finally
        {
            await db.Users.Where(x => x.NormalizedEmail == firstEmail || x.NormalizedEmail == secondEmail).ExecuteDeleteAsync();
        }
    }


    private static readonly SaveCustomerAddress Home = new("Ev", "Ayşe Yılmaz", "+905321234567", "İstanbul", "Kadıköy", "Moda Cad. No: 1", "34710", false);

    private static CustomerOrder NewOrder(CustomerAddress address) => new(Guid.NewGuid().ToString("N"), "XN-261009-1234", DateTimeOffset.UtcNow, "received", address,
        [new CustomerOrderLine("DEMO-P101", "DEMO-V101-B", "Kettle", "Mavi", "/media/a.png", new Money(199_000, "TRY"), 2, new Money(398_000, "TRY"))], new Money(398_000, "TRY"),
        null, [new OrderEvent("received", DateTimeOffset.UtcNow, "customer", null)], null);

    [EmptySqlAccountsFact]
    public async Task AccountsSessionsAddressesOrdersAndImport()
    {
        var services = new ServiceCollection();
        services.AddXinobiPersistence(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<SqlAccountStore>();
        await using var provider = services.BuildServiceProvider();
        var store = provider.GetRequiredService<SqlAccountStore>();
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        // Fail before the cleanup block if anything is already there.
        Assert.False(await db.Users.AnyAsync());
        Assert.False(await db.SalesOrders.AnyAsync());
        try
        {
            var ayse = await store.Register("Ayşe Yılmaz", "ayse@xinobi-test.invalid", "guclu-parola-1");
            Assert.Equal("email_taken", (await Assert.ThrowsAsync<AccountException>(() => store.Register("Başka", "ayse@xinobi-test.invalid", "guclu-parola-2"))).Code);
            Assert.Null(await store.Login("ayse@xinobi-test.invalid", "yanlis-parola"));
            Assert.Null(await store.Login("yok@xinobi-test.invalid", "guclu-parola-1"));
            Assert.Equal(ayse.Id, (await store.Login("ayse@xinobi-test.invalid", "guclu-parola-1"))!.Id);

            // Rotation: the old refresh token returning revokes the whole family.
            var tokens = await store.IssueTokens(ayse.Id);
            Assert.Equal(ayse.Id, (await store.FindByAccessToken(tokens.AccessToken))!.Id);
            var (_, rotated) = await store.Refresh(tokens.RefreshToken);
            await Assert.ThrowsAsync<AccountException>(() => store.Refresh(tokens.RefreshToken));
            await Assert.ThrowsAsync<AccountException>(() => store.Refresh(rotated.RefreshToken));
            Assert.Null(await store.FindByAccessToken(rotated.AccessToken));

            // Addresses: the first is the default; a new default replaces it; deleting the default promotes the next.
            var first = await store.SaveAddress(ayse.Id, null, Home);
            var second = await store.SaveAddress(ayse.Id, null, Home with { Title = "İş", IsDefault = true });
            Assert.Equal([second.Id, first.Id], (await store.Addresses(ayse.Id)).Select(x => x.Id));
            Assert.Equal("address_not_found", (await Assert.ThrowsAsync<AccountException>(() => store.SaveAddress(ayse.Id, Guid.NewGuid().ToString("N"), Home))).Code);
            Assert.True(await store.DeleteAddress(ayse.Id, second.Id));
            Assert.True((await store.Addresses(ayse.Id)).Single().IsDefault);

            // Orders are idempotent per client request id; parallel retries create one order.
            var address = (await store.Addresses(ayse.Id)).Single();
            var placed = await Task.WhenAll(Enumerable.Range(0, 4).Select(_ => store.PlaceOrder(ayse.Id, "request-0001", () => NewOrder(address))));
            Assert.Single(placed.Select(x => x.Id).Distinct());
            Assert.Equal(placed[0], (await store.Orders(ayse.Id)).Single(), new OrderComparer());
            var (shipped, owner) = await store.ChangeOrder(null, placed[0].Id, order => order with { Status = "shipped", Shipment = new OrderShipment("Aras", "AR1", null, DateTimeOffset.UtcNow, null) });
            Assert.Equal((ayse.Id, "shipped", "Aras"), (owner.Id, (await store.Orders(ayse.Id)).Single().Status, (await store.Orders(ayse.Id)).Single().Shipment!.Carrier));
            Assert.Equal(shipped.Id, (await store.AllOrders()).Single().Order.Id);

            // Roles, profile, e-mail and password changes.
            Assert.False(await store.AnyWithRole("super_admin"));
            Assert.Equal(["super_admin"], (await store.AssignRole("ayse@xinobi-test.invalid", "super_admin"))!.RoleCodes);
            Assert.True(await store.AnyWithRole("super_admin"));
            Assert.Equal("+905550000000", (await store.UpdateProfile(ayse.Id, "Ayşe Y.", "+905550000000"))!.Phone);
            var other = await store.Register("Ali", "ali@xinobi-test.invalid", "guclu-parola-3");
            Assert.Equal("email_taken", (await Assert.ThrowsAsync<AccountException>(() => store.ChangeEmail(ayse.Id, "guclu-parola-1", "ali@xinobi-test.invalid"))).Code);
            Assert.Equal("ayse2@xinobi-test.invalid", (await store.ChangeEmail(ayse.Id, "guclu-parola-1", "ayse2@xinobi-test.invalid")).Email);
            var session = await store.IssueTokens(ayse.Id);
            Assert.True(await store.ChangePassword(ayse.Id, "guclu-parola-1", "yeni-parola-12"));
            Assert.Null(await store.FindByAccessToken(session.AccessToken));
            Assert.True(await store.CheckPassword(ayse.Id, "yeni-parola-12"));

            // Import refuses non-empty tables, so a snapshot is built from what is stored and replayed after a cleanup.
            var snapshot = new AccountSnapshot(
                [(await store.FindById(ayse.Id))!, (await store.FindById(other.Id))!], [], [],
                [.. (await store.Addresses(ayse.Id)).Select(x => new AccountSnapshot.Address(ayse.Id, x))],
                [.. (await store.Orders(ayse.Id)).Select(x => new AccountSnapshot.Order(ayse.Id, "request-0001", x))]);
            await Assert.ThrowsAsync<InvalidOperationException>(() => store.Import(snapshot));

            // Deleting an account removes its orders too (current contract; retention is decision D10).
            Assert.False(await store.Delete(ayse.Id, "guclu-parola-1"));
            Assert.True(await store.Delete(ayse.Id, "yeni-parola-12"));
            Assert.True(await store.Delete(other.Id, "guclu-parola-3"));
            Assert.False(await db.SalesOrders.AnyAsync());

            var imported = await store.Import(snapshot);
            Assert.Equal((2, 1, 1), (imported.Accounts, imported.Addresses, imported.Orders));
            Assert.Equal(ayse.Id, (await store.Login("ayse2@xinobi-test.invalid", "yeni-parola-12"))!.Id);
            Assert.Equal(["super_admin"], (await store.FindById(ayse.Id))!.RoleCodes);
            Assert.Equal(placed[0].Id, (await store.Orders(ayse.Id)).Single().Id);
        }
        finally
        {
            // Only this fixture's rows: every test address uses the reserved .invalid domain.
            await using var cleanup = await db.Database.BeginTransactionAsync();
            var users = db.Users.Where(x => x.NormalizedEmail.EndsWith("@xinobi-test.invalid")).Select(x => x.Id);
            await db.SalesOrders.Where(x => users.Contains(x.UserId)).ExecuteDeleteAsync();
            await db.Users.Where(x => x.NormalizedEmail.EndsWith("@xinobi-test.invalid")).ExecuteDeleteAsync();
            await db.Roles.Where(x => x.Code == "super_admin" && !db.UserRoles.Any(r => r.RoleId == x.Id)).ExecuteDeleteAsync();
            await cleanup.CommitAsync();
        }
    }

    /// <summary>Runs beside real data: only rows of the reserved .invalid domain are written and removed.</summary>
    [SqlWritesFact]
    public async Task PersonalisedLinesKeepTheirDesignSnapshot()
    {
        var services = new ServiceCollection();
        services.AddXinobiPersistence(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<SqlAccountStore>();
        await using var provider = services.BuildServiceProvider();
        var store = provider.GetRequiredService<SqlAccountStore>();
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        var email = $"tasarim-{Guid.NewGuid():N}@xinobi-test.invalid";
        try
        {
            var account = await store.Register("Ayşe", email, "guclu-parola-1");
            var address = await store.SaveAddress(account.Id, null, Home);
            var plain = NewOrder(address);
            var design = new OrderPersonalization(Guid.NewGuid().ToString("N"), "ai", "Mavi dalgalar", "image/png", ImageUrl: "/ignored");
            var order = plain with { Lines = [plain.Lines[0], plain.Lines[0] with { Quantity = 1, LineTotal = plain.Lines[0].UnitPrice, Personalization = design }],
                Total = plain.Total with { AmountMinor = plain.Total.AmountMinor + plain.Lines[0].UnitPrice.AmountMinor } };
            await store.PlaceOrder(account.Id, "request-0001", () => order);
            var stored = (await store.Orders(account.Id)).Single();
            Assert.Null(stored.Lines[0].Personalization);
            // The address is built per request, so it is not stored.
            Assert.Equal(design with { ImageUrl = null }, stored.Lines[1].Personalization);
        }
        finally
        {
            var users = db.Users.Where(x => x.NormalizedEmail == email).Select(x => x.Id);
            await db.SalesOrders.Where(x => users.Contains(x.UserId)).ExecuteDeleteAsync();
            await db.Users.Where(x => x.NormalizedEmail == email).ExecuteDeleteAsync();
        }
    }

    private sealed class OrderComparer : IEqualityComparer<CustomerOrder>
    {
        public bool Equals(CustomerOrder? x, CustomerOrder? y) =>
            System.Text.Json.JsonSerializer.Serialize(x) == System.Text.Json.JsonSerializer.Serialize(y);
        public int GetHashCode(CustomerOrder obj) => obj.Id.GetHashCode();
    }
}
