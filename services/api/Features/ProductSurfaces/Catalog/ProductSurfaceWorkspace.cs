using System.Security.Cryptography;
using System.Text.Json;
using Xinobi.Api.Infrastructure.MaskProcessing;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Features.ProductSurfaces.Catalog;

public enum SurfaceStatus { None, Draft, Approved, Stale }

/// <summary>One variant photo's masking work: the current draft and how it was made. The approved mask lives on the variant itself.</summary>
public sealed record SurfaceDraft(string ProductId, string VariantId, string Image, string MaskFile, string Method, DateTimeOffset UpdatedAt);

/// <summary><c>Status</c>: none, draft, approved or stale (approved for a photo the variant no longer uses).</summary>
public sealed record SurfaceSummary(string ProductId, string ProductName, string VariantId, string Color, string Image, string Status, DateTimeOffset? DraftUpdatedAt);

public sealed record SurfaceDetail(string ProductId, string ProductName, string VariantId, string Color, string Image, int Width, int Height,
    string Status, string? ApprovedMask, SurfaceDraft? Draft, SurfaceColor[] Colors, string SourceSha256);

public sealed record SurfaceColor(string VariantId, string Color, string Image, int Width, int Height);
public sealed record SurfaceApprovalRequest(SurfaceColor[] Colors, bool SamePlacementConfirmed, DateTimeOffset ExpectedDraftUpdatedAt);
public sealed record SurfaceWebpRequest(string Image, string SourceSha256, string WebpBase64, string Mode);

public sealed class SurfaceException(string code, string message, int status = StatusCodes.Status400BadRequest) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;
}

/// <summary>
/// Development workspace behind the admin "Ürün yüzey maskeleri" screen, for every product variant: the admin uploads a WebP mask
/// as a draft, then approves it for the reference colour or for same-sized, same-placement colours in one step.
/// Approval copies the mask into commerce media and records it on the variant, so storefront, snapshot and deploy carry it
/// like the product photo. No inference or external calls.
/// </summary>
public sealed class ProductSurfaceWorkspace(LocalCommerceStore commerce, Xinobi.Api.Infrastructure.IFileStore files, IWebHostEnvironment environment, IConfiguration configuration, TimeProvider clock)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly SemaphoreSlim gate = new(1, 1);
    private sealed record State(List<SurfaceDraft> Drafts);

    private string Directory => Path.Combine(commerce.DataDirectory, "product-surfaces");
    private string StatePath => Path.Combine(Directory, "workspace.json");
    private string DraftPath(string file) => Path.Combine(Directory, "drafts", file);
    private async Task<State> Read() => File.Exists(StatePath) ? JsonSerializer.Deserialize<State>(await File.ReadAllTextAsync(StatePath), Json)! : new([]);

    private async Task Write(State state)
    {
        System.IO.Directory.CreateDirectory(Directory);
        var temporary = StatePath + ".tmp";
        await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(state, Json));
        File.Move(temporary, StatePath, true);
    }

    private async Task<T> Locked<T>(Func<State, Task<T>> action)
    {
        await gate.WaitAsync();
        try { return await action(await Read()); }
        finally { gate.Release(); }
    }

    private static string StatusOf(CommerceVariant variant, SurfaceDraft? draft) => (
        variant.ApprovedSurfaceMask is not null ? SurfaceStatus.Approved
        : draft is not null && draft.Image == variant.Image ? SurfaceStatus.Draft
        : !string.IsNullOrEmpty(variant.SurfaceMask) ? SurfaceStatus.Stale
        : SurfaceStatus.None).ToString().ToLowerInvariant();

    private static SurfaceDraft? DraftFor(State state, string productId, CommerceVariant variant) =>
        state.Drafts.FirstOrDefault(draft => draft.ProductId == productId && draft.VariantId == variant.Id && draft.Image == variant.Image);

    public async Task<SurfaceSummary[]> List()
    {
        var catalogue = await commerce.Read();
        return await Locked(state => Task.FromResult(catalogue.Products.Where(product => product.Personalizable == true).SelectMany(product => product.Variants
            .Where(variant => !string.IsNullOrEmpty(variant.Image))
            .Select(variant =>
            {
                var draft = DraftFor(state, product.Id, variant);
                return new SurfaceSummary(product.Id, product.Name, variant.Id, variant.Color, variant.Image, StatusOf(variant, draft), draft?.UpdatedAt);
            })).ToArray()));
    }

    public async Task<object> RenderingInputs(string productId, string variantId)
    {
        var (product, variant) = await Find(productId, variantId);
        if (!product.Active || variant.ApprovedSurfaceMask is not { } mask)
            return new { scope = "development-preview", productReference = productId, variantReference = variantId, previewAvailable = false, inputs = (object?)null };
        var source = InspectSource(variant.Image);
        var maskBytes = SourceBytes(mask);
        new AlignedImageInspector().ValidateMask(maskBytes, "dev:shared-mask", source, source);
        var sha = Convert.ToHexString(SHA256.HashData(maskBytes)).ToLowerInvariant();
        return new { scope = "development-preview", productReference = productId, variantReference = variantId, previewAvailable = true,
            inputs = new { surfaceVersion = sha, sourceMediaVersion = source.Sha256, width = source.Width, height = source.Height,
                source = new { url = variant.Image + "?v=" + source.Sha256, sha256 = source.Sha256 },
                mask = new { url = mask + "?v=" + sha, sha256 = sha }, brandingRequired = false, branding = (object?)null } };
    }

    public async Task<SurfaceDetail> Detail(string productId, string variantId)
    {
        var (product, variant) = await Find(productId, variantId);
        var source = InspectSource(variant.Image);
        return await Locked(state => Task.FromResult(DetailOf(state, product, variant, source)));
    }

    private SurfaceDetail DetailOf(State state, CommerceProduct product, CommerceVariant variant, SourceMediaIdentity source)
    {
        var draft = DraftFor(state, product.Id, variant);
        return new SurfaceDetail(product.Id, product.Name, variant.Id, variant.Color, variant.Image, source.Width, source.Height,
            StatusOf(variant, draft), variant.ApprovedSurfaceMask, draft,
            product.Variants.Where(v => !string.IsNullOrEmpty(v.Image)).Select(v =>
            {
                try { var identity = InspectSource(v.Image); return new SurfaceColor(v.Id, v.Color, v.Image, identity.Width, identity.Height); }
                catch (SurfaceException) { return new SurfaceColor(v.Id, v.Color, v.Image, 0, 0); }
            }).ToArray(), source.Sha256);
    }

    public async Task<byte[]> DraftMask(string productId, string variantId)
    {
        var (_, variant) = await Find(productId, variantId);
        return await Locked(async state => DraftFor(state, productId, variant) is { } draft
            ? await File.ReadAllBytesAsync(DraftPath(draft.MaskFile))
            : throw new SurfaceException("draft_not_found", "Bu renk için taslak maske yok.", StatusCodes.Status404NotFound));
    }

    public async Task<SurfaceDetail> ImportWebp(string productId, string variantId, SurfaceWebpRequest request)
    {
        var (product, variant) = await Find(productId, variantId);
        var source = InspectSource(variant.Image);
        EnsureManualSource(variant, source, request.Image, request.SourceSha256);
        if (string.IsNullOrWhiteSpace(request.WebpBase64)) throw new SurfaceException("invalid_mask_webp", "WebP maske verisi eksik. Paneli yenileyip dosyayı tekrar seçin.");
        if (request.WebpBase64.Length > 12 * 1024 * 1024) throw new SurfaceException("invalid_mask_webp", "WebP dosyası çok büyük; en fazla 8 MB yükleyin.");
        byte[] webp;
        try { webp = Convert.FromBase64String(request.WebpBase64); }
        catch (FormatException) { throw new SurfaceException("invalid_mask_webp", "WebP aktarımı okunamadı."); }
        var bytes = ManualSurfaceMasks.Webp(webp, request.Mode, source);
        return await SaveDraft(product, variant, source, bytes, "webp-" + request.Mode);
    }

    private static void EnsureManualSource(CommerceVariant variant, SourceMediaIdentity source, string image, string sha)
    {
        if (variant.Image != image || source.Sha256 != sha) throw new SurfaceException("image_changed", "Fotoğraf değişti; ürünü yeniden seçin.", 409);
    }

    private async Task<SurfaceDetail> SaveDraft(CommerceProduct product, CommerceVariant variant, SourceMediaIdentity source, byte[] mask, string method) =>
        await Locked(async state =>
        {
            var file = $"{Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant()}.png";
            System.IO.Directory.CreateDirectory(DraftPath(""));
            await File.WriteAllBytesAsync(DraftPath(file), mask);
            foreach (var old in state.Drafts.Where(draft => draft.ProductId == product.Id && draft.VariantId == variant.Id).ToArray())
            {
                state.Drafts.Remove(old);
                File.Delete(DraftPath(old.MaskFile));
            }
            state.Drafts.Add(new SurfaceDraft(product.Id, variant.Id, variant.Image, file, method, clock.GetUtcNow()));
            await Write(state);
            return DetailOf(state, product, variant, source);
        });

    /// <summary>The draft becomes the variant's approved mask: copied into commerce media and recorded on the variant for this exact photo.</summary>
    public async Task<SurfaceDetail> Approve(string productId, string variantId)
    {
        var (product, variant) = await Find(productId, variantId);
        var source = InspectSource(variant.Image);
        var draft = await Locked(state => Task.FromResult(DraftFor(state, productId, variant)))
            ?? throw new SurfaceException("draft_not_found", "Onaylanacak taslak maske yok.");
        var bytes = await File.ReadAllBytesAsync(DraftPath(draft.MaskFile));
        new AlignedImageInspector().ValidateMask(bytes, "dev:surface-approval", source, source);
        var media = $"{Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant()}.png";
        await files.Save(Xinobi.Api.Infrastructure.FileAreas.Media, media, new MemoryStream(bytes), "image/png");
        var path = "/api/v1/local-commerce/media/" + media;
        var updated = await SetSurface(productId, variantId, variant.Image, path, path);
        return await Locked(async state =>
        {
            state.Drafts.RemoveAll(item => item.ProductId == productId && item.VariantId == variantId);
            File.Delete(DraftPath(draft.MaskFile));
            await Write(state);
            return DetailOf(state, product, updated, source);
        });
    }

    /// <summary>
    /// One explicit approval applies the reference mask unchanged to selected, same-sized colour photographs the admin
    /// confirmed as the same placement; they all share one mask file.
    /// </summary>
    public async Task<SurfaceDetail> ApproveColors(string productId, string variantId, SurfaceApprovalRequest request)
    {
        if (!request.SamePlacementConfirmed || request.Colors is not { Length: > 0 and <= 100 } ||
            request.Colors.Select(c => c.VariantId).Distinct().Count() != request.Colors.Length || !request.Colors.Any(c => c.VariantId == variantId))
            throw new SurfaceException("same_placement_required", "Aynı konumdaki renkleri ve referans rengini açıkça seçin.");
        var (product, variant) = await Find(productId, variantId);
        var source = InspectSource(variant.Image);
        return await Locked(async state =>
        {
            var draft = DraftFor(state, productId, variant) ?? throw new SurfaceException("draft_not_found", "Onaylanacak taslak yok.");
            if (draft.UpdatedAt != request.ExpectedDraftUpdatedAt) throw new SurfaceException("draft_changed", "Taslak değişti; yeniden inceleyin.", 409);
            foreach (var color in request.Colors)
            {
                var target = product.Variants.SingleOrDefault(v => v.Id == color.VariantId);
                if (target is null || target.Image != color.Image) throw new SurfaceException("image_changed", "Renk fotoğrafı değişti.", 409);
                var identity = InspectSource(target.Image);
                if (identity.Width != source.Width || identity.Height != source.Height || color.Width != identity.Width || color.Height != identity.Height)
                    throw new SurfaceException("color_dimensions_mismatch", "Ortak maske için renk fotoğrafları aynı boyutta ve aynı konumda olmalı.", 409);
            }
            var bytes = await File.ReadAllBytesAsync(DraftPath(draft.MaskFile));
            new AlignedImageInspector().ValidateMask(bytes, "dev:shared-surface-approval", source, source);
            var media = $"{Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant()}.png";
            await files.Save(Xinobi.Api.Infrastructure.FileAreas.Media, media, new MemoryStream(bytes), "image/png");
            var mask = "/api/v1/local-commerce/media/" + media;
            var expected = request.Colors.ToDictionary(c => c.VariantId);
            CommerceVariant? updated = null;
            await commerce.Update(current =>
            {
                var live = current.Products.SingleOrDefault(p => p.Id == productId) ?? throw new SurfaceException("product_not_found", "Ürün bulunamadı.", 404);
                foreach (var color in expected.Values)
                    if (!live.Variants.Any(v => v.Id == color.VariantId && v.Image == color.Image))
                        throw new SurfaceException("image_changed", "Renk fotoğrafı işlem sırasında değişti.", 409);
                var variants = live.Variants.Select(v => expected.ContainsKey(v.Id) ? v with { SurfaceMask = mask, SurfaceImage = v.Image } : v).ToArray();
                updated = variants.Single(v => v.Id == variantId);
                return current with { Products = [.. current.Products.Select(p => p.Id == productId ? p with { Variants = variants } : p)] };
            });
            state.Drafts.Remove(draft);
            File.Delete(DraftPath(draft.MaskFile));
            await Write(state);
            return DetailOf(state, product, updated!, source);
        });
    }

    public async Task<SurfaceDetail> Revoke(string productId, string variantId)
    {
        var (product, variant) = await Find(productId, variantId);
        var updated = await SetSurface(productId, variantId, variant.Image, null, null);
        return await Locked(state => Task.FromResult(DetailOf(state, product, updated, InspectSource(variant.Image))));
    }

    public async Task<SurfaceDetail> Discard(string productId, string variantId)
    {
        var (product, variant) = await Find(productId, variantId);
        return await Locked(async state =>
        {
            foreach (var old in state.Drafts.Where(draft => draft.ProductId == productId && draft.VariantId == variantId).ToArray())
            {
                state.Drafts.Remove(old);
                File.Delete(DraftPath(old.MaskFile));
            }
            await Write(state);
            return DetailOf(state, product, variant, InspectSource(variant.Image));
        });
    }

    private async Task<CommerceVariant> SetSurface(string productId, string variantId, string image, string? mask, string? expected)
    {
        CommerceVariant? result = null;
        await commerce.Update(state =>
        {
            var product = state.Products.FirstOrDefault(item => item.Id == productId) ?? throw new SurfaceException("product_not_found", "Ürün bulunamadı.", StatusCodes.Status404NotFound);
            var variant = product.Variants.FirstOrDefault(item => item.Id == variantId) ?? throw new SurfaceException("variant_not_found", "Renk bulunamadı.", StatusCodes.Status404NotFound);
            // The photo may have changed while the admin worked; never attach a mask to a different photo.
            if (variant.Image != image) throw new SurfaceException("image_changed", "Bu rengin fotoğrafı değişti. Maskeyi yeni fotoğraf için yeniden hazırla.", StatusCodes.Status409Conflict);
            result = variant with { SurfaceMask = mask, SurfaceImage = mask is null ? null : image };
            return state with { Products = [.. state.Products.Select(item => item.Id != productId ? item : item with { Variants = [.. item.Variants.Select(v => v.Id == variantId ? result : v)] })] };
        });
        return result!;
    }

    private async Task<(CommerceProduct Product, CommerceVariant Variant)> Find(string productId, string variantId)
    {
        var state = await commerce.Read();
        var product = state.Products.FirstOrDefault(item => item.Id == productId) ?? throw new SurfaceException("product_not_found", "Ürün bulunamadı.", StatusCodes.Status404NotFound);
        var variant = product.Variants.FirstOrDefault(item => item.Id == variantId) ?? throw new SurfaceException("variant_not_found", "Renk bulunamadı.", StatusCodes.Status404NotFound);
        if (string.IsNullOrEmpty(variant.Image)) throw new SurfaceException("image_missing", "Bu renge önce bir fotoğraf ekle.");
        return (product, variant);
    }

    private SourceMediaIdentity InspectSource(string image)
    {
        try { return new AlignedImageInspector().InspectSource(SourceBytes(image), "commerce:" + image); }
        catch (InvalidDataException) { throw new SurfaceException("image_unreadable", "Ürün fotoğrafı okunamadı."); }
    }

    /// <summary>Reads commerce media or a web static asset, refusing anything outside those two folders.</summary>
    public byte[] SourceBytes(string image)
    {
        const string media = "/api/v1/local-commerce/media/";
        string? path = null;
        if (image.StartsWith(media, StringComparison.Ordinal))
        {
            // Development tool: the local store opens synchronously, so blocking here costs nothing.
            var key = Path.GetFileName(image[media.Length..]);
            var stored = System.Text.RegularExpressions.Regex.IsMatch(key, "^[a-f0-9]{32}\\.(png|jpg|webp)$")
                ? files.Open(Xinobi.Api.Infrastructure.FileAreas.Media, key).GetAwaiter().GetResult() : null;
            if (stored is null) throw new SurfaceException("image_unreadable", "Ürün fotoğrafı bulunamadı.", StatusCodes.Status404NotFound);
            using var content = stored.Content;
            using var buffer = new MemoryStream();
            content.CopyTo(buffer);
            return buffer.ToArray();
        }
        else if (image.StartsWith("/assets/", StringComparison.Ordinal))
        {
            var root = Path.GetFullPath(Path.Combine(configuration["ProductSurfaces:WebPublicDirectory"] ?? Path.Combine(environment.ContentRootPath, "../../apps/web/public")));
            var candidate = Path.GetFullPath(Path.Combine(root, image.TrimStart('/')));
            if (candidate.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.Ordinal)) path = candidate;
        }
        if (path is null || !File.Exists(path)) throw new SurfaceException("image_unreadable", "Ürün fotoğrafı bulunamadı.", StatusCodes.Status404NotFound);
        return File.ReadAllBytes(path);
    }
}
