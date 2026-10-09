using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class CustomerCommerceModelTests
{
    private static XinobiDbContext Context() => new(new DbContextOptionsBuilder<XinobiDbContext>()
        .UseSqlServer("Server=unused;Database=unused").Options);

    [Theory]
    [InlineData(typeof(AccessSession))]
    [InlineData(typeof(RefreshSession))]
    public void SessionsStoreHashAndBelongToExactlyOneUser(Type type)
    {
        using var db = Context();
        var session = db.Model.FindEntityType(type)!;
        Assert.Equal("char(64)", session.FindProperty("TokenHash")!.GetColumnType());
        Assert.Null(session.FindProperty("Token"));
        Assert.Single(session.GetForeignKeys(), fk => fk.PrincipalEntityType.ClrType == typeof(User));
        Assert.Contains(session.GetIndexes(), index => index.Properties.Select(p => p.Name).SequenceEqual(["UserId", "ExpiresAt"]));
    }

    [Fact]
    public void OnlyOneDefaultAddressPerUserIsAllowed()
    {
        using var db = Context();
        var type = db.Model.FindEntityType(typeof(CustomerDeliveryAddress))!;
        var index = Assert.Single(type.GetIndexes(), i => i.IsUnique && i.Properties.Select(p => p.Name).SequenceEqual(["UserId"]));
        Assert.Equal("[IsDefault] = 1", index.GetFilter());
        Assert.Contains(type.GetForeignKeys(), fk => fk.PrincipalEntityType.ClrType == typeof(User));
    }

    [Fact]
    public void DeletingCatalogOrAddressCannotDeleteHistoricalOrders()
    {
        using var db = Context();
        var order = db.Model.FindEntityType(typeof(SalesOrder))!;
        var customer = Assert.Single(order.GetForeignKeys());
        Assert.Equal(typeof(User), customer.PrincipalEntityType.ClrType);
        Assert.Equal(DeleteBehavior.Restrict, customer.DeleteBehavior);
        Assert.NotNull(order.FindProperty(nameof(SalesOrder.AddressSnapshotJson)));
        var line = db.Model.FindEntityType(typeof(SalesOrderLine))!;
        Assert.All(line.GetForeignKeys(), fk => Assert.Equal(typeof(SalesOrder), fk.PrincipalEntityType.ClrType));
        Assert.Equal(["OrderId", "Position"], line.FindPrimaryKey()!.Properties.Select(p => p.Name));
    }

    [Fact]
    public void RetryKeysAreScopedToCustomerAndOrderChangesHaveConcurrencyToken()
    {
        using var db = Context();
        var order = db.Model.FindEntityType(typeof(SalesOrder))!;
        Assert.Contains(order.GetIndexes(), i => i.IsUnique && i.Properties.Select(p => p.Name).SequenceEqual(["UserId", "ClientRequestId"]));
        Assert.True(order.FindProperty(nameof(SalesOrder.RowVersion))!.IsConcurrencyToken);
        // Existing random demo order numbers are preserved; no global uniqueness assumption is introduced.
        Assert.DoesNotContain(order.GetIndexes(), i => i.IsUnique && i.Properties.Select(p => p.Name).SequenceEqual(["Number"]));
    }
}
