using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Xinobi.Api.Catalog;
using Xinobi.Api.LocalCommerce;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class SqlCatalogValidationTests
{
    private static CommerceState Fixture() => new(
        [new CommerceProduct("p", "Ürün", "Kahve", true, "", "", [new CommerceVariant("v", "sku", "Siyah", 1, "/assets/image.png")])],
        new() { ["v"] = 10000 }, new([], "", "#000000"), ["Kahve"], []);

    [Fact]
    public void UnpricedVariantsAreAllowedButInvalidPricesAreRejected()
    {
        var source = Fixture();
        SqlCommerceStore.Validate(source with { Prices = [] });
        foreach (var price in new long[] { 0, -1, 1000000000 })
            Assert.Throws<ArgumentException>(() => SqlCommerceStore.Validate(source with { Prices = new() { ["v"] = price } }));
    }

    [Fact]
    public void DuplicateSkusAcrossProductsAndNegativeInventoryAreRejected()
    {
        var source = Fixture();
        var duplicate = source.Products[0] with { Id = "other", Variants = [new("other-v", "SKU", "Beyaz", 1, "")] };
        Assert.Throws<ArgumentException>(() => SqlCommerceStore.Validate(source with { Products = [.. source.Products, duplicate] }));
        var negative = source.Products[0] with { Variants = [source.Products[0].Variants[0] with { Stock = -1 }] };
        Assert.Throws<ArgumentException>(() => SqlCommerceStore.Validate(source with { Products = [negative] }));
    }

    [Fact]
    public void UnknownAndTurkishCaseDuplicateCategoriesAreRejected()
    {
        var source = Fixture();
        Assert.Throws<ArgumentException>(() => SqlCommerceStore.Validate(source with { Categories = ["Başka"] }));
        Assert.Throws<ArgumentException>(() => SqlCommerceStore.Validate(source with { Categories = ["Kahve", "KAHVE"] }));
    }

    [Fact]
    public void PriceComparisonIgnoresObjectOrderButPreservesProductAndVariantOrder()
    {
        var source = Fixture();
        var second = source.Products[0] with { Id = "p2", Variants = [new("v2", "sku2", "Beyaz", 0, "")] };
        source = source with { Products = [.. source.Products, second], Prices = new() { ["v"] = 10, ["v2"] = 20 } };
        Assert.True(SqlCommerceStore.Equivalent(source, source with { Prices = new() { ["v2"] = 20, ["v"] = 10 } }));
        Assert.False(SqlCommerceStore.Equivalent(source, source with { Products = source.Products.Reverse().ToArray() }));
    }

    [Fact]
    public void DatabaseRelationshipsEnforceVariantOwnershipPriceAndCategoryIntegrity()
    {
        using var db = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer("Server=unused;Database=unused").Options);
        var product = db.Model.FindEntityType(typeof(CatalogProduct))!;
        Assert.Contains(product.GetForeignKeys(), key => key.PrincipalEntityType.ClrType == typeof(CatalogCategory) && key.DeleteBehavior == DeleteBehavior.Restrict);
        var price = db.Model.FindEntityType(typeof(CatalogVariantPrice))!;
        Assert.Contains(price.GetForeignKeys(), key => key.PrincipalEntityType.ClrType == typeof(CatalogVariant) && key.DeleteBehavior == DeleteBehavior.Cascade);
        Assert.Equal("bigint", price.FindProperty(nameof(CatalogVariantPrice.Cents))!.GetColumnType());
    }
}
