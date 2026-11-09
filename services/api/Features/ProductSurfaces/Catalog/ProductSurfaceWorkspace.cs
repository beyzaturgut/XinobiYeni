using System.Security.Cryptography;
using System.Text.Json;
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

public sealed class SurfaceException(string code, string message, int status = StatusCodes.Status400BadRequest) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;
}

/// <summary>
/// Historical variant workspace, retained read-only for existing links and orders.
/// New masks use PersonalizationSourceStore and are never copied between colours.
/// </summary>
public sealed class ProductSurfaceWorkspace(LocalCommerceStore commerce, Xinobi.Api.Infrastructure.IFileStore files, IWebHostEnvironment environment, IConfiguration configuration)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly SemaphoreSlim gate = new(1, 1);
    private sealed record State(List<SurfaceDraft> Drafts);

    private string Directory => Path.Combine(commerce.DataDirectory, "product-surfaces");
    private string StatePath => Path.Combine(Directory, "workspace.json");
    private string DraftPath(string file) => Path.Combine(Directory, "drafts", file);
    private async Task<State> Read() => File.Exists(StatePath) ? JsonSerializer.Deserialize<State>(await File.ReadAllTextAsync(StatePath), Json)! : new([]);

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
