using System.Globalization;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Catalog;

/// <summary>Turns a commerce snapshot into the public contract. Business rules that used to live in the web client are applied here once.</summary>
public sealed class CatalogProjection(CommerceState state, Func<string?, string?> resolveUrl)
{
    public const string Currency = "TRY";
    private static readonly CompareInfo Turkish = new CultureInfo("tr-TR").CompareInfo;
    private static readonly StringComparer TurkishComparer = StringComparer.Create(new CultureInfo("tr-TR"), true);

    private IEnumerable<CommerceProduct> Active => state.Products.Where(product => product.Active);

    // Until every product carries an explicit flag, tea and coffee machines are personalizable (README, XINOBI U scope).
    public static bool IsPersonalizable(CommerceProduct product) =>
        product.Personalizable ?? (product.Category.Contains("Çay", StringComparison.Ordinal) || product.Category.Contains("Kahve", StringComparison.Ordinal));

    public const int CartLineLimit = 99;

    public static int MaxQuantityFor(int stock) => Math.Clamp(stock, 0, CartLineLimit);

    public static Availability AvailabilityFor(int stock) => stock switch
    {
        <= 0 => new(AvailabilityStatuses.OutOfStock, 0),
        <= 5 => new(AvailabilityStatuses.LowStock, stock),
        _ => new(AvailabilityStatuses.InStock, null),
    };

    private Money? PriceOf(CommerceVariant variant) =>
        state.Prices.TryGetValue(variant.Id, out var cents) && cents > 0 ? new Money(cents, Currency) : null;

    private string? CoverOf(CommerceProduct product) =>
        resolveUrl(!string.IsNullOrEmpty(product.OriginalImage) ? product.OriginalImage : product.Variants.FirstOrDefault(variant => !string.IsNullOrEmpty(variant.Image))?.Image);

    public ProductSummary Summary(CommerceProduct product)
    {
        var prices = product.Variants.Select(PriceOf).OfType<Money>().ToArray();
        return new ProductSummary(
            product.Id, product.Name, product.Category, product.Description, CoverOf(product), IsPersonalizable(product),
            product.Variants.Length,
            prices.Length == 0 ? null : prices.MinBy(price => price.AmountMinor),
            product.Variants.Any(variant => variant.Stock > 0),
            product.Variants.FirstOrDefault()?.Hex);
    }

    public ProductDetail? Detail(string id) => Active.FirstOrDefault(product => product.Id == id) is { } product
        ? new ProductDetail(
            product.Id, product.Name, product.Category, product.Description, product.SeoTitle, CoverOf(product), IsPersonalizable(product),
            product.Variants.Select(variant =>
            {
                var price = PriceOf(variant);
                return new VariantDetail(variant.Id, variant.Sku, variant.Color, variant.Hex, resolveUrl(variant.Image), price,
                    AvailabilityFor(variant.Stock), price is not null && variant.Stock > 0, MaxQuantityFor(variant.Stock), resolveUrl(variant.ApprovedSurfaceMask));
            }).ToArray(),
            resolveUrl(product.OriginalImage),
            (product.Gallery ?? []).Select(resolveUrl).OfType<string>().Distinct().ToArray())
        : null;

    public ProductPage Products(string? category, string? query, bool? personalizable, int page, int pageSize)
    {
        var matches = Active
            .Where(product => category is null || TurkishComparer.Equals(product.Category, category))
            .Where(product => personalizable is null || IsPersonalizable(product) == personalizable)
            .Where(product => string.IsNullOrWhiteSpace(query) || Matches(product, query.Trim()))
            .ToArray();
        return new ProductPage(matches.Skip((page - 1) * pageSize).Take(pageSize).Select(Summary).ToArray(), page, pageSize, matches.Length);
    }

    private static bool Matches(CommerceProduct product, string query) =>
        new[] { product.Name, product.Category, product.Description }.Concat(product.Variants.SelectMany(variant => new[] { variant.Sku, variant.Color }))
            .Any(text => Turkish.IndexOf(text ?? "", query, CompareOptions.IgnoreCase) >= 0);

    private IEnumerable<string> CategoryNames => state.Categories ?? state.Products.Select(product => product.Category).Distinct();

    public CategoryList Categories() => new(CategoryNames
        .Select(name => new CategoryItem(name, Active.Count(product => product.Category == name), Highlight(name)?.ImageUrl))
        .ToArray());

    /// <summary>Homepage category tile: custom photo, else the admin-selected variant, else the first product cover. An empty selection hides the category.</summary>
    public CategoryHighlight? Highlight(string name)
    {
        var selected = state.Content.CategoryProducts?.GetValueOrDefault(name);
        if (selected == "") return null;
        var candidates = Active.Where(product => product.Category == name).ToArray();
        var description = candidates.FirstOrDefault()?.Description is { Length: > 0 } text ? text : $"{name} koleksiyonunu keşfedin. Kendinize uygun modeli ve rengi seçin.";
        if (state.Content.CategoryImages?.GetValueOrDefault(name) is { Length: > 0 } custom)
            return new CategoryHighlight(name, resolveUrl(custom), $"{name} kategori fotoğrafı", candidates.Length, description);
        foreach (var product in candidates)
        {
            var variant = selected is null
                ? product.Variants.FirstOrDefault(item => !string.IsNullOrEmpty(item.Image))
                : product.Variants.FirstOrDefault(item => item.Id == selected && !string.IsNullOrEmpty(item.Image));
            if (variant is null) continue;
            var image = selected is null && !string.IsNullOrEmpty(product.OriginalImage) ? product.OriginalImage : variant.Image;
            return new CategoryHighlight(name, resolveUrl(image), $"{product.Name} · {variant.Color}", candidates.Length, description);
        }
        return null;
    }

    public HomeContent Home()
    {
        var content = state.Content;
        var featured = content.FeaturedProducts is null
            ? Active.Take(4)
            : content.FeaturedProducts.Select(id => Active.FirstOrDefault(product => product.Id == id)).OfType<CommerceProduct>();
        return new HomeContent(
            content.Slides.Where(slide => slide.Active)
                .Select(slide => new HomeSlide(slide.Id, slide.Type == "Video" ? "video" : "image", resolveUrl(slide.Src) ?? "", slide.Alt, slide.Duration))
                .ToArray(),
            resolveUrl(content.TitaniumImage ?? content.TitaniumBanner),
            content.ButtonColor,
            featured.Select(Summary).ToArray(),
            CategoryNames.Select(Highlight).OfType<CategoryHighlight>().ToArray());
    }

    public AnnouncementList Announcements() => new((state.Announcements ?? [])
        .OrderByDescending(item => item.PublishedAt)
        .Select(item => new AnnouncementItem(item.Id, item.Title, item.Body, item.Kind, item.PublishedAt))
        .ToArray());
}
