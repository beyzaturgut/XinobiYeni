using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Catalog;
using Xinobi.Api.LocalCommerce;
using Xinobi.Persistence;

namespace Xinobi.Architecture.Tests;

public sealed class EmptySqlCatalogFactAttribute : FactAttribute
{
    public EmptySqlCatalogFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL"))
            || Environment.GetEnvironmentVariable("XINOBI_TEST_EMPTY_CATALOG") != "1")
            Skip = "Explicit SQL connection and confirmed empty catalog required; never reads local real credentials.";
    }
}

public sealed class SqlCatalogIntegrationTests
{
    [EmptySqlCatalogFact]
    public async Task EmptyCatalogImportConcurrencyConstraintsAndRollback()
    {
        var connection = Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!;
        var services = new ServiceCollection();
        services.AddXinobiPersistence(connection);
        services.AddSingleton<SqlCommerceStore>();
        await using var provider = services.BuildServiceProvider();
        var store = provider.GetRequiredService<SqlCommerceStore>();
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        // Fail before the cleanup block if there is any existing catalog data.
        Assert.False(await db.CatalogContent.AnyAsync());
        Assert.False(await db.CatalogProducts.AnyAsync());
        Assert.False(await db.CatalogVariants.AnyAsync());
        Assert.False(await db.CatalogPrices.AnyAsync());
        Assert.False(await db.CatalogCategories.AnyAsync());
        Assert.False(await db.CatalogAnnouncements.AnyAsync());
        var seed = LocalCommerceStore.Parse(await File.ReadAllTextAsync(Path.Combine(Repo(), "services/api/LocalCommerce/seed.json")));
        var fixture = seed with { Products = seed.Products.Select(p => p with
        {
            Gallery = ["/assets/test-gallery.png"], Specs = [new ProductSpec("Güç", "1500 W")],
            Variants = p.Variants.Select(v => v with { SurfaceMask = "/assets/test-mask.png", SurfaceImage = v.Image }).ToArray()
        }).ToArray() };
        try
        {
            Assert.True(await store.Import(fixture));
            Assert.True(SqlCommerceStore.Equivalent(fixture, await store.Read()));
            Assert.False(await store.Import(fixture));
            await Assert.ThrowsAsync<InvalidOperationException>(() => store.Import(fixture with { Content = fixture.Content with { ButtonColor = "#112233" } }));
            var first = fixture.Products[0].Variants[0];
            await Assert.ThrowsAsync<InvalidOperationException>(() => store.Update(_ => throw new InvalidOperationException("abort")));
            Assert.True(SqlCommerceStore.Equivalent(fixture, await store.Read()));
            await Task.WhenAll(Enumerable.Range(0, 6).Select(_ => store.Update(s => s with
            {
                Products = s.Products.Select(p => p with { Variants = p.Variants.Select(v => v.Id == first.Id ? v with { Stock = v.Stock + 1 } : v).ToArray() }).ToArray()
            })));
            Assert.Equal(first.Stock + 6, (await store.Read()).Products[0].Variants[0].Stock);
            var changed = await store.Update(s => s with { Prices = new(s.Prices) { [first.Id] = 123456 } });
            Assert.Equal(123456, (await store.Read()).Prices[first.Id]);
            // An exception after SQL has already changed earlier rows still rolls the entire transaction back.
            await using (var transaction = await db.Database.BeginTransactionAsync())
            {
                await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE catalog.Variants SET Stock=1 WHERE Id={first.Id}");
                var constraint = await Assert.ThrowsAsync<SqlException>(() => db.Database.ExecuteSqlInterpolatedAsync($"UPDATE catalog.Variants SET Stock=-1 WHERE Id={first.Id}"));
                Assert.Equal(547, constraint.Number);
                await transaction.RollbackAsync();
            }
            Assert.True(SqlCommerceStore.Equivalent(changed, await store.Read()));
            var other = fixture.Products.SelectMany(p => p.Variants).First(v => v.Id != first.Id);
            var duplicate = await Assert.ThrowsAsync<SqlException>(() => db.Database.ExecuteSqlInterpolatedAsync($"UPDATE catalog.Variants SET NormalizedSku={first.Sku.ToUpperInvariant()} WHERE Id={other.Id}"));
            Assert.True(duplicate.Number is 2601 or 2627);
            var invalidPrice = await Assert.ThrowsAsync<SqlException>(() => db.Database.ExecuteSqlInterpolatedAsync($"UPDATE catalog.VariantPrices SET Cents=0 WHERE VariantId={first.Id}"));
            Assert.Equal(547, invalidPrice.Number);
            // SKU swap frees the old unique values inside a transaction.
            await store.Update(s => s with { Products = s.Products.Select(p => p with { Variants = p.Variants.Select(v =>
                v.Id == first.Id ? v with { Sku = other.Sku } : v.Id == other.Id ? v with { Sku = first.Sku } : v).ToArray() }).ToArray() });
            Assert.Equal(other.Sku, (await store.Read()).Products[0].Variants[0].Sku);
            // Child removal and category moves must not leave stale prices or break references.
            var removed = await store.Update(s => s with
            {
                Products = s.Products.Select(p => p with { Variants = p.Variants.Where(v => v.Id != first.Id).ToArray() }).ToArray(),
                Prices = s.Prices.Where(x => x.Key != first.Id).ToDictionary()
            });
            Assert.True(SqlCommerceStore.Equivalent(removed, await store.Read()));
            var oldCategory = removed.Categories![0];
            var moved = await store.Update(s => s with
            {
                Categories = s.Categories!.Where(x => x != oldCategory).ToArray(),
                Products = s.Products.Select(p => p.Category == oldCategory ? p with { Category = s.Categories![1] } : p).ToArray()
            });
            Assert.True(SqlCommerceStore.Equivalent(moved, await store.Read()));
        }
        finally
        {
            // This explicitly opted-in fixture is the only catalog writer during this pre-import test.
            var known = fixture.Products.Select(p => p.Id).ToHashSet();
            Assert.All(await db.CatalogProducts.Select(p => p.Id).ToListAsync(), id => Assert.Contains(id, known));
            var productIds = known.ToArray();
            var variantIds = fixture.Products.SelectMany(p => p.Variants).Select(v => v.Id).ToArray();
            var categoryNames = fixture.Categories!;
            var announcementIds = (fixture.Announcements ?? []).Select(a => a.Id).ToArray();
            await using var cleanup = await db.Database.BeginTransactionAsync();
            await db.CatalogPrices.Where(p => variantIds.Contains(p.VariantId)).ExecuteDeleteAsync();
            await db.CatalogVariants.Where(v => variantIds.Contains(v.Id)).ExecuteDeleteAsync();
            await db.CatalogProducts.Where(p => productIds.Contains(p.Id)).ExecuteDeleteAsync();
            await db.CatalogCategories.Where(c => categoryNames.Contains(c.Name)).ExecuteDeleteAsync();
            await db.CatalogAnnouncements.Where(a => announcementIds.Contains(a.Id)).ExecuteDeleteAsync();
            await db.CatalogContent.Where(c => c.Id == 1).ExecuteDeleteAsync();
            await cleanup.CommitAsync();
        }
    }

    private static string Repo()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "XinobiYeni.slnx"))) dir = dir.Parent;
        return dir!.FullName;
    }

    [Fact]
    public void PriceCannotBeAssignedToMissingVariant()
    {
        var source = LocalCommerceStore.Parse(File.ReadAllText(Path.Combine(Repo(), "services/api/LocalCommerce/seed.json")));
        Assert.Throws<ArgumentException>(() => SqlCommerceStore.Validate(source with { Prices = new(source.Prices) { ["missing"] = 100 } }));
    }
}
