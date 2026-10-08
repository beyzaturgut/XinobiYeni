namespace Xinobi.Api.Catalog;

// Public read contract shared by web and mobile (/api/v1/catalog, /api/v1/content).
// Image URLs are absolute; money is an integer amount in minor units with an ISO 4217 currency (Faz00 T-02 proposal for the API).

public record Money(long AmountMinor, string Currency);

/// <summary><c>Remaining</c> is only disclosed when stock is low (1–5); availability is informational, checkout re-checks it.</summary>
public record Availability(string Status, int? Remaining);

public static class AvailabilityStatuses
{
    public const string InStock = "in_stock";
    public const string LowStock = "low_stock";
    public const string OutOfStock = "out_of_stock";
}

public record CategoryItem(string Name, int ProductCount, string? ImageUrl);
public record CategoryList(CategoryItem[] Items);

public record ProductSummary(
    string Id,
    string Name,
    string Category,
    string Description,
    string? ImageUrl,
    bool Personalizable,
    int ColorCount,
    Money? PriceFrom,
    bool InStock);

public record ProductPage(ProductSummary[] Items, int Page, int PageSize, int Total);

/// <summary><c>MaxQuantity</c> is the most a cart may hold (stock, capped at 99, as the web cart enforces); checkout re-checks stock.</summary>
public record VariantDetail(
    string Id,
    string Sku,
    string Color,
    string? Hex,
    string? ImageUrl,
    Money? Price,
    Availability Availability,
    bool Purchasable,
    int MaxQuantity);

public record ProductDetail(
    string Id,
    string Name,
    string Category,
    string Description,
    string SeoTitle,
    string? ImageUrl,
    bool Personalizable,
    VariantDetail[] Variants,
    /// <summary>The product's own photo (no colour), when one was uploaded. <see cref="ImageUrl"/> falls back to a colour photo; this does not.</summary>
    string? OriginalImageUrl,
    /// <summary>Extra photos shared by every colour, in display order. Gallery order: original photo, selected colour's photo, these.</summary>
    string[] Gallery);

public record HomeSlide(long Id, string Type, string Url, string Alt, int DurationSeconds);
public record CategoryHighlight(string Category, string? ImageUrl, string ImageAlt, int ProductCount, string Description);
/// <summary>
/// The XINOBI U home section is a fixed designed block on web and mobile (06.10.2026), so there is no banner image here.
/// <c>FeatureImageUrl</c> is the editable titanium feature photo.
/// </summary>
public record HomeContent(
    HomeSlide[] Slides,
    string? FeatureImageUrl,
    string AccentColor,
    ProductSummary[] FeaturedProducts,
    CategoryHighlight[] Categories);

public record AnnouncementItem(string Id, string Title, string Body, string Kind, DateTimeOffset PublishedAt);
public record AnnouncementList(AnnouncementItem[] Items);
