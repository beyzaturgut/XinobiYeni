using Xinobi.Api.Designs;
using Xinobi.Api.Infrastructure;
namespace Xinobi.Api.Features.ProductSurfaces;

// Visual identity is independent of the explicitly selected commercial SKU. Never infer a variant from photo/order.
public sealed record SingleSourceBinding(string ProductId, int ProfileRevision, int SourceRevision, string SurfaceId,
    string ProductSourceSha256, string MaskSha256, int Width, int Height, string FulfillmentVariantId);
public sealed record SingleSourcePurchase(string Status, int ProfileRevision, string? VariantId, string? Sku,
    long? PriceMinor, int? Stock, SingleSourceBinding? Binding);
public sealed record SaveFulfillmentBinding(string? VariantId, int ExpectedRevision);
public sealed partial class PersonalizationSourceStore
{
    public async Task<SingleSourcePurchase> Purchase(string productId)
    {
        var commerce = await catalog.ReadAsync();
        var product = commerce.Products.SingleOrDefault(p => p.Id == productId && p.Active && p.Personalizable == true)
            ?? throw ProblemException.NotFound("product_not_found", "Ürün bulunamadı.");
        var state = await store.Read(); Validate(state);
        var profile = state.Profiles.GetValueOrDefault(productId);
        if (profile is null) return new("source_missing", 0, null, null, null, null, null);
        var variant = product.Variants.SingleOrDefault(v => v.Id == profile.FulfillmentVariantId);
        if (variant is null) return new("commercial_binding_missing", profile.ProfileRevision, null, null, null, null, null);
        var prices = commerce.Prices;
        long? price = prices.TryGetValue(variant.Id, out var amount) && amount > 0 ? amount : null;
        var publication = await RenderingInputs(productId);
        if ((await store.Read()).Profiles.GetValueOrDefault(productId)?.ProfileRevision != profile.ProfileRevision)
            throw new ProblemException("source_revision_conflict", "Ürün kaynağı değişti; güncel ürünü yeniden açın.", 409);
        var binding = new SingleSourceBinding(productId, profile.ProfileRevision, publication.SourceRevision, publication.SurfaceId,
            publication.Inputs.SourceMediaVersion, publication.Inputs.SurfaceVersion, publication.Inputs.Width, publication.Inputs.Height, variant.Id);
        return new(price is null ? "price_missing" : variant.Stock <= 0 ? "out_of_stock" : "ready", profile.ProfileRevision,
            variant.Id, variant.Sku, price, variant.Stock, binding);
    }
    public async Task<SingleSourcePurchase> SetFulfillment(string productId, SaveFulfillmentBinding request)
    {
        await Product(productId);
        var product = (await catalog.ReadAsync()).Products.Single(p => p.Id == productId);
        if (request.VariantId is not null && !product.Variants.Any(v => v.Id == request.VariantId))
            throw new ProblemException("invalid_commercial_variant", "Bu ürünün ticari SKU'sunu seçin.", 409);
        await store.Update(state => {
            Validate(state);
            var profile = state.Profiles.GetValueOrDefault(productId) ?? throw new ProblemException("source_missing", "Önce kaynak fotoğraf kaydedin.", 409);
            if (profile.ProfileRevision != request.ExpectedRevision) throw new ProblemException("source_revision_conflict", "Kayıt değişti; güncel kaydı yükleyin.", 409);
            state.Profiles[productId] = profile with { ProfileRevision = profile.ProfileRevision + 1, FulfillmentVariantId = request.VariantId };
            return true;
        });
        // Saving a commercial mapping does not require an approved mask yet.
        return new("saved", request.ExpectedRevision + 1, request.VariantId,
            product.Variants.SingleOrDefault(v => v.Id == request.VariantId)?.Sku, null, null, null);
    }
    public async Task<bool> HasSourceProfile(string productId)
    { var state = await store.Read(); Validate(state); return state.Profiles.ContainsKey(productId); }
    public async Task<string?> FulfillmentVariant(string productId) => (await store.Read()).Profiles.GetValueOrDefault(productId)?.FulfillmentVariantId;
    public async Task<SurfaceSourceImage> ValidateSelection(string productId, string variantId, DesignPlacement placement, SingleSourceBinding binding)
    {
        PlacementRules.Validate(placement, singleSource: true);
        var current = await Purchase(productId);
        if (current.Binding is null || binding.ProductId != productId || variantId != binding.FulfillmentVariantId
            || current.Binding.FulfillmentVariantId != binding.FulfillmentVariantId || current.Binding.ProfileRevision != binding.ProfileRevision)
            throw new ProblemException("commercial_binding_changed", "Ürün kaynağı veya ticari eşleme değişti. Güncel üründe yeniden yerleştirin.", 409);
        if (current.Binding != binding || placement.SurfaceVersion != binding.MaskSha256 || placement.SourceWidth != binding.Width || placement.SourceHeight != binding.Height)
            throw new ProblemException("surface_changed", "Ürün kaynağı değişti. Güncel yüzeyde yeniden yerleştirin.", 409);
        var published = await Published(productId);
        if (published.Source.Sha256 != binding.ProductSourceSha256 || SurfaceId(published.Mask) != binding.SurfaceId)
            throw new ProblemException("surface_changed", "Ürün kaynağı değişti. Güncel yüzeyde yeniden yerleştirin.", 409);
        return new(published.Source.Sha256, published.SourceBytes);
    }
}
