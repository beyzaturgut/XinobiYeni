namespace Xinobi.Persistence.Entities;

public sealed class CatalogCategory
{
    public required string Name { get; set; }
    public required string NormalizedName { get; set; }
    public int Position { get; set; }
}

public sealed class CatalogProduct
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string CategoryName { get; set; }
    public bool Active { get; set; }
    public required string Description { get; set; }
    public required string SeoTitle { get; set; }
    public bool? Personalizable { get; set; }
    public string? OriginalImage { get; set; }
    public string? GalleryJson { get; set; }
    public string? SpecsJson { get; set; }
    public int Position { get; set; }
}

public sealed class CatalogVariant
{
    public required string Id { get; set; }
    public required string ProductId { get; set; }
    public required string Sku { get; set; }
    public required string NormalizedSku { get; set; }
    public required string Color { get; set; }
    public int Stock { get; set; }
    public required string Image { get; set; }
    public string? Hex { get; set; }
    public string? SurfaceMask { get; set; }
    public string? SurfaceImage { get; set; }
    public int Position { get; set; }
}

/// <summary>TRY minor units, preserving the existing per-variant pricing contract. No row means no sale price.</summary>
public sealed class CatalogVariantPrice
{
    public required string VariantId { get; set; }
    public long Cents { get; set; }
}

/// <summary>Only presentation settings are JSON; products, variants, prices and inventory are relational.</summary>
public sealed class CatalogContent
{
    public int Id { get; set; }
    public required string HomeJson { get; set; }
    public bool AnnouncementsDefined { get; set; }
}

public sealed class CatalogAnnouncement
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required string Body { get; set; }
    public required string Kind { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
    public int Position { get; set; }
}
