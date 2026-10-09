using System.Text.Json;
using Xinobi.Api.Catalog;

namespace Xinobi.Api.LocalCommerce;

/// <summary><c>SurfaceMask</c> is the approved designable-area mask (a media path) made for <c>SurfaceImage</c>; it only applies while that is still the variant's image.</summary>
public record CommerceVariant(string Id, string Sku, string Color, int Stock, string Image, string? Hex = null, string? SurfaceMask = null, string? SurfaceImage = null)
{
    public string? ApprovedSurfaceMask => !string.IsNullOrEmpty(SurfaceMask) && SurfaceImage == Image ? SurfaceMask : null;
}
/// <summary>
/// <c>Gallery</c> holds extra product photos shared by every colour, shown after the cover in the product gallery.
/// <c>Specs</c> are the technical properties shown on the product page and in product comparison.
/// </summary>
public record CommerceProduct(string Id, string Name, string Category, bool Active, string Description, string SeoTitle, CommerceVariant[] Variants, bool? Personalizable = null, string? OriginalImage = null, string[]? Gallery = null, ProductSpec[]? Specs = null);
/// <summary>One technical property, e.g. Güç = 1650 W.</summary>
public record ProductSpec(string Name, string Value);
public record CommerceSlide(long Id, string Name, string Type, string Src, string Alt, int Duration, bool Active);
public record CommerceContent(CommerceSlide[] Slides, string XinobiBanner, string ButtonColor, Dictionary<string, string>? CategoryProducts = null, string? TitaniumBanner = null, string[]? FeaturedProducts = null, Dictionary<string, string>? CategoryImages = null, string? TitaniumImage = null);
public record CommerceState(CommerceProduct[] Products, Dictionary<string, long> Prices, CommerceContent Content, string[]? Categories = null, CommerceAnnouncement[]? Announcements = null);
public record CommerceAnnouncement(string Id, string Title, string Body, string Kind, DateTimeOffset PublishedAt);
public record AnnouncementCreate(string Title, string Body, string Kind);
public record CategoryCreate(string Name);
public record PriceUpdate(long Cents);

// Compatibility facade for panel, media and Development identity. SQL catalog use is explicit; files remain intact.
public sealed class LocalCommerceStore(IWebHostEnvironment environment, IConfiguration configuration, SqlCommerceStore sql)
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string path = configuration["LocalCommerce:DataDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "local-commerce");
    internal static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    public string DataDirectory => path;
    public bool UsesSql => configuration["Catalog:StorageProvider"] == "SqlServer"
        || configuration["Catalog:StorageProvider"] is null && File.Exists(Path.Combine(path, "catalog-sql.enabled"));

    private async Task<CommerceState> ReadCore()
    {
        var file = Path.Combine(path, "state.json");
        var source = File.Exists(file) ? file : Path.Combine(environment.ContentRootPath, "LocalCommerce", "seed.json");
        return Parse(await File.ReadAllTextAsync(source));
    }

    /// <summary>Reads a state document and completes its category list; shared with the read-only production snapshot.</summary>
    public static CommerceState Parse(string json)
    {
        var state = JsonSerializer.Deserialize<CommerceState>(json, JsonOptions)
            ?? throw new InvalidDataException("Local commerce state is invalid.");
        return state with { Categories = (state.Categories ?? ["Çay makineleri", "Kahve makineleri", "Hava temizleme", "Pişirme teknolojileri"]).Concat(state.Products.Select(p => p.Category)).Distinct(StringComparer.Create(new System.Globalization.CultureInfo("tr-TR"), true)).ToArray() };
    }

    public async Task<CommerceState> Read()
    {
        if (UsesSql) return await sql.Read();
        await gate.WaitAsync();
        try { return await ReadCore(); }
        finally { gate.Release(); }
    }

    public async Task<CommerceState> Update(Func<CommerceState, CommerceState> change)
    {
        if (UsesSql) return await sql.Update(change);
        await gate.WaitAsync();
        try
        {
            var next = change(await ReadCore());
            Directory.CreateDirectory(path);
            var temporary = Path.Combine(path, "state.tmp");
            await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(next, JsonOptions));
            File.Move(temporary, Path.Combine(path, "state.json"), true);
            return next;
        }
        finally { gate.Release(); }
    }
}
