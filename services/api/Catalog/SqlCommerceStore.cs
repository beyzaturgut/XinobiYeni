using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Api.Catalog;

/// <summary>
/// Relational catalog behind the existing panel contract. A database transaction and application lock protect the
/// read/change/write operation across API processes. SQL errors never fall back to a stale file or seed catalog.
/// </summary>
public sealed class SqlCommerceStore(IServiceScopeFactory scopes)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private async Task<T> Locked<T>(bool write, Func<XinobiDbContext, Task<T>> action)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        await using var transaction = await db.Database.BeginTransactionAsync();
        var mode = write ? "Exclusive" : "Shared";
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            DECLARE @result int;
            EXEC @result = sys.sp_getapplock @Resource=N'Xinobi.Catalog.State', @LockMode={mode},
                @LockOwner=N'Transaction', @LockTimeout=10000;
            IF @result < 0 THROW 51000, 'Catalog lock unavailable', 1;
            """);
        var result = await action(db);
        await transaction.CommitAsync();
        return result;
    }

    public async Task<CommerceState> Read()
    {
        try { return await Locked(false, ReadCore); }
        catch (Exception error) when (error is SqlException or DbUpdateException) { throw new CatalogUnavailableException(); }
    }

    public async Task<CommerceState> Update(Func<CommerceState, CommerceState> change)
    {
        try
        {
            return await Locked(true, async db =>
            {
                var next = change(await ReadCore(db));
                Validate(next);
                await Save(db, next);
                return next;
            });
        }
        catch (Exception error) when (error is SqlException or DbUpdateException) { throw ProblemException.Unavailable("Katalog kaydı"); }
    }

    /// <summary>First import only. An identical repeat is a no-op; existing different SQL content is never overwritten.</summary>
    public Task<bool> Import(CommerceState source)
    {
        Validate(source);
        return Locked(true, async db =>
        {
            if (await db.CatalogContent.AnyAsync())
            {
                if (!Equivalent(source, await ReadCore(db))) throw new InvalidOperationException("SQL catalog differs from the source; import refused.");
                return false;
            }
            if (await db.CatalogCategories.AnyAsync() || await db.CatalogProducts.AnyAsync() || await db.CatalogVariants.AnyAsync()
                || await db.CatalogPrices.AnyAsync() || await db.CatalogAnnouncements.AnyAsync())
                throw new InvalidOperationException("SQL catalog is not empty; import refused.");
            await Save(db, source);
            if (!Equivalent(source, await ReadCore(db))) throw new InvalidOperationException("Catalog import verification failed; transaction rolled back.");
            return true;
        });
    }

    public static bool Equivalent(CommerceState left, CommerceState right) =>
        JsonNode.DeepEquals(JsonSerializer.SerializeToNode(left, Json), JsonSerializer.SerializeToNode(right, Json));

    public static void Validate(CommerceState state)
    {
        var categories = state.Categories ?? throw new ArgumentException("Kategoriler eksik.");
        var categoryNames = new HashSet<string>(StringComparer.Ordinal);
        var normalizedCategories = new HashSet<string>(StringComparer.Create(System.Globalization.CultureInfo.GetCultureInfo("tr-TR"), true));
        foreach (var name in categories)
            if (string.IsNullOrWhiteSpace(name) || name.Length > 80 || !categoryNames.Add(name) || !normalizedCategories.Add(name))
                throw new ArgumentException("Geçersiz veya yinelenen kategori.");
        var products = new HashSet<string>(StringComparer.Ordinal);
        var variants = new HashSet<string>(StringComparer.Ordinal);
        var skus = new HashSet<string>(StringComparer.Ordinal);
        foreach (var product in state.Products)
        {
            if (!Key(product.Id) || !products.Add(product.Id) || string.IsNullOrWhiteSpace(product.Name) || product.Name.Length > 120
                || product.Description is null || product.SeoTitle is null || !categoryNames.Contains(product.Category))
                throw new ArgumentException("Geçersiz ürün veya kategori.");
            foreach (var variant in product.Variants)
                if (!Key(variant.Id) || !variants.Add(variant.Id) || string.IsNullOrWhiteSpace(variant.Sku) || variant.Sku.Length > 256
                    || !skus.Add(variant.Sku.ToUpperInvariant()) || variant.Stock < 0 || variant.Image is null || variant.Hex?.Length > 7)
                    throw new ArgumentException("Geçersiz varyant, yinelenen SKU veya negatif stok.");
        }
        if (state.Prices.Any(price => !variants.Contains(price.Key) || price.Value is <= 0 or > 999999999))
            throw new ArgumentException("Fiyat mevcut varyanta ait, pozitif ve geçerli aralıkta olmalı.");
        var announcementIds = new HashSet<string>(StringComparer.Ordinal);
        foreach (var item in state.Announcements ?? [])
            if (!Key(item.Id) || !announcementIds.Add(item.Id) || item.Title.Length > 120 || item.Body.Length > 4000 || item.Kind.Length > 16)
                throw new ArgumentException("Geçersiz duyuru.");
    }

    private static bool Key(string value) => !string.IsNullOrWhiteSpace(value) && value.Length <= 128;

    private static async Task<CommerceState> ReadCore(XinobiDbContext db)
    {
        var content = await db.CatalogContent.AsNoTracking().SingleOrDefaultAsync();
        if (content is null) throw new CatalogUnavailableException();
        var categories = await db.CatalogCategories.AsNoTracking().OrderBy(x => x.Position).Select(x => x.Name).ToArrayAsync();
        var variants = await db.CatalogVariants.AsNoTracking().OrderBy(x => x.Position).ToArrayAsync();
        var grouped = variants.ToLookup(x => x.ProductId, StringComparer.Ordinal);
        var products = (await db.CatalogProducts.AsNoTracking().OrderBy(x => x.Position).ToArrayAsync()).Select(p => new CommerceProduct(
            p.Id, p.Name, p.CategoryName, p.Active, p.Description, p.SeoTitle,
            grouped[p.Id].Select(v => new CommerceVariant(v.Id, v.Sku, v.Color, v.Stock, v.Image, v.Hex, v.SurfaceMask, v.SurfaceImage)).ToArray(),
            p.Personalizable, p.OriginalImage, p.GalleryJson is null ? null : JsonSerializer.Deserialize<string[]>(p.GalleryJson, Json),
            p.SpecsJson is null ? null : JsonSerializer.Deserialize<ProductSpec[]>(p.SpecsJson, Json))).ToArray();
        var prices = await db.CatalogPrices.AsNoTracking().ToDictionaryAsync(x => x.VariantId, x => x.Cents);
        var announcements = (await db.CatalogAnnouncements.AsNoTracking().OrderBy(x => x.Position).ToArrayAsync())
            .Select(x => new CommerceAnnouncement(x.Id, x.Title, x.Body, x.Kind, x.PublishedAt)).ToArray();
        return new(products, prices, JsonSerializer.Deserialize<CommerceContent>(content.HomeJson, Json)!, categories,
            content.AnnouncementsDefined ? announcements : null);
    }

    private static async Task Save(XinobiDbContext db, CommerceState state)
    {
        var productIds = state.Products.Select(x => x.Id).ToHashSet(StringComparer.Ordinal);
        var variantIds = state.Products.SelectMany(x => x.Variants).Select(x => x.Id).ToHashSet(StringComparer.Ordinal);
        var categories = await db.CatalogCategories.ToDictionaryAsync(x => x.Name);
        var products = await db.CatalogProducts.ToDictionaryAsync(x => x.Id);
        var variants = await db.CatalogVariants.ToDictionaryAsync(x => x.Id);
        var prices = await db.CatalogPrices.ToDictionaryAsync(x => x.VariantId);
        db.CatalogPrices.RemoveRange(prices.Values.Where(x => !state.Prices.ContainsKey(x.VariantId)));
        // Free old unique SKUs before swaps/replacements. These intermediate values never leave the transaction.
        var desiredSkus = state.Products.SelectMany(x => x.Variants).ToDictionary(x => x.Id, x => x.Sku.ToUpperInvariant());
        foreach (var v in variants.Values)
            if (!variantIds.Contains(v.Id)) db.CatalogVariants.Remove(v);
            else if (v.NormalizedSku != desiredSkus[v.Id]) v.NormalizedSku = "__transition_" + Guid.NewGuid().ToString("N");
        await db.SaveChangesAsync();
        for (var i = 0; i < state.Categories!.Length; i++)
        {
            var name = state.Categories[i];
            var value = new CatalogCategory { Name = name, NormalizedName = name.ToUpper(System.Globalization.CultureInfo.GetCultureInfo("tr-TR")), Position = i };
            Upsert(db, db.CatalogCategories, categories, name, value);
        }
        await db.SaveChangesAsync();
        for (var i = 0; i < state.Products.Length; i++)
        {
            var p = state.Products[i];
            Upsert(db, db.CatalogProducts, products, p.Id, new CatalogProduct
            {
                Id = p.Id, Name = p.Name, CategoryName = p.Category, Active = p.Active, Description = p.Description, SeoTitle = p.SeoTitle,
                Personalizable = p.Personalizable, OriginalImage = p.OriginalImage, Position = i,
                GalleryJson = p.Gallery is null ? null : JsonSerializer.Serialize(p.Gallery, Json),
                SpecsJson = p.Specs is null ? null : JsonSerializer.Serialize(p.Specs, Json)
            });
        }
        await db.SaveChangesAsync();
        foreach (var p in state.Products)
            for (var i = 0; i < p.Variants.Length; i++)
            {
                var v = p.Variants[i];
                Upsert(db, db.CatalogVariants, variants, v.Id, new CatalogVariant
                {
                    Id = v.Id, ProductId = p.Id, Sku = v.Sku, NormalizedSku = v.Sku.ToUpperInvariant(), Color = v.Color, Stock = v.Stock,
                    Image = v.Image, Hex = v.Hex, SurfaceMask = v.SurfaceMask, SurfaceImage = v.SurfaceImage, Position = i
                });
            }
        await db.SaveChangesAsync();
        foreach (var price in state.Prices)
            Upsert(db, db.CatalogPrices, prices, price.Key, new CatalogVariantPrice { VariantId = price.Key, Cents = price.Value });
        db.CatalogProducts.RemoveRange(products.Values.Where(x => !productIds.Contains(x.Id)));
        await db.SaveChangesAsync();
        db.CatalogCategories.RemoveRange(categories.Values.Where(x => !state.Categories.Contains(x.Name, StringComparer.Ordinal)));
        var content = await db.CatalogContent.SingleOrDefaultAsync();
        if (content is null) db.CatalogContent.Add(new CatalogContent
            { Id = 1, HomeJson = JsonSerializer.Serialize(state.Content, Json), AnnouncementsDefined = state.Announcements is not null });
        else
        {
            content.HomeJson = JsonSerializer.Serialize(state.Content, Json);
            content.AnnouncementsDefined = state.Announcements is not null;
        }
        var announcements = await db.CatalogAnnouncements.ToDictionaryAsync(x => x.Id);
        var items = state.Announcements ?? [];
        db.CatalogAnnouncements.RemoveRange(announcements.Values.Where(x => !items.Any(item => item.Id == x.Id)));
        for (var i = 0; i < items.Length; i++)
        {
            var a = items[i];
            Upsert(db, db.CatalogAnnouncements, announcements, a.Id, new CatalogAnnouncement
                { Id = a.Id, Title = a.Title, Body = a.Body, Kind = a.Kind, PublishedAt = a.PublishedAt, Position = i });
        }
        await db.SaveChangesAsync();
    }

    private static void Upsert<T>(XinobiDbContext db, DbSet<T> set, Dictionary<string, T> existing, string id, T value) where T : class
    {
        if (existing.TryGetValue(id, out var stored)) db.Entry(stored).CurrentValues.SetValues(value);
        else set.Add(value);
    }
}
