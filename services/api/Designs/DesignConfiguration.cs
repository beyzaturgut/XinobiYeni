using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using Xinobi.Api.Catalog;
using Xinobi.Api.Features.ProductSurfaces.Catalog;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Designs;

public record BodyPlacement(
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] double? X = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] double? Y = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] double? Scale = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] double? Rotation = null);
public record DesignPlacement(int SourceWidth, int SourceHeight, string SurfaceVersion, double X, double Y, double Scale,
    double Rotation, double CurvatureStrength,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] Dictionary<string, BodyPlacement>? BodyAdjustments = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Mode = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] bool? FillMask = null);
public record SaveDesignConfiguration(string VariantId, DesignPlacement Placement, string? ConfigurationId = null, int? ExpectedRevision = null, bool Favorite = false);
/// <summary>Immutable revision of a customer's product/variant placement. SchemaVersion describes placement, not the mask.</summary>
public record MyDesignConfiguration(string Id, string DesignId, string ProductId, string VariantId, int Revision, int SchemaVersion,
    DesignPlacement Placement, bool Favorite, string SourceSha256, DateTimeOffset CreatedAt, Print.PrintSetupSnapshot? PrintSetup = null);
public record SetConfigurationFavorite(bool Favorite);

public static class PlacementRules
{
    public static DesignPlacement Validate(DesignPlacement? p)
    {
        static bool Bound(double value, double min, double max) => double.IsFinite(value) && value >= min && value <= max;
        if (p is null || p.SourceWidth is < 1 or > 6000 || p.SourceHeight is < 1 or > 6000
            || p.SurfaceVersion is null || !System.Text.RegularExpressions.Regex.IsMatch(p.SurfaceVersion, "^[a-f0-9]{64}$")
            || !Bound(p.X, -60000, 60000) || !Bound(p.Y, -60000, 60000) || !Bound(p.Scale, .000001, 10)
            || !Bound(p.Rotation, -3600, 3600) || !Bound(p.CurvatureStrength, 0, 1)
            || p.Mode is not (null or "pattern" or "artwork") || p.BodyAdjustments is { Count: > 2 }
            || p.BodyAdjustments?.Any(pair => pair.Key is not ("upper-body" or "lower-body") || pair.Value is null
                || pair.Value.X is { } x && !Bound(x, -60000, 60000) || pair.Value.Y is { } y && !Bound(y, -60000, 60000)
                || pair.Value.Scale is { } s && !Bound(s, .000001, 10) || pair.Value.Rotation is { } r && !Bound(r, -3600, 3600)) == true)
            throw new ProblemException("invalid_placement", "Tasarım yerleşim değerlerini kontrol et.");
        return p;
    }
}

/// <summary>Validates the exact current photo/mask; never fetches a browser-supplied URL or trusts a client mask checksum.</summary>
public sealed class DesignSurfaceValidator(ICatalogSource catalog, IServiceProvider services, IWebHostEnvironment environment, IConfiguration settings)
{
    public async Task Validate(string productId, string variantId, DesignPlacement placement)
    {
        PlacementRules.Validate(placement);
        Xinobi.Api.LocalCommerce.CommerceState state;
        try { state = await catalog.ReadAsync(); } catch (CatalogUnavailableException) { throw ProblemException.Unavailable("Katalog"); }
        var product = state.Products.FirstOrDefault(p => p.Id == productId && p.Active && p.Personalizable == true);
        var variant = product?.Variants.FirstOrDefault(v => v.Id == variantId);
        if (variant is null) throw new ProblemException("configuration_variant_mismatch", "Bu ürün veya renk kişiselleştirme için kullanılamıyor.", 409);
        JsonElement? inputs = null;
        if (variant.ApprovedSurfaceMask is not null && services.GetService<ProductSurfaceWorkspace>() is { } workspace)
        {
            try
            {
                var bundle = JsonSerializer.SerializeToElement(await workspace.RenderingInputs(productId, variantId));
                if (bundle.GetProperty("previewAvailable").GetBoolean()) inputs = bundle.GetProperty("inputs");
            }
            catch (Exception error) when (error is SurfaceException or IOException or InvalidDataException or ArgumentException) { throw new ProblemException("surface_unavailable", "Onaylı ürün yüzeyi doğrulanamadı.", 409); }
        }
        // Published bundles must be present on this server and match the current variant photo.
        if (inputs is null)
        {
            var root = settings["ProductSurfaces:PublishedRoot"] ?? (environment.IsDevelopment()
                ? Path.GetFullPath(Path.Combine(environment.ContentRootPath, "../../apps/web/public/assets/product-previews")) : null);
            if (root is not null && Safe(productId) && Safe(variantId))
            {
                var path = Path.Combine(root, productId, variantId, "inputs.json");
                if (File.Exists(path))
                {
                    try
                    {
                        using var document = JsonDocument.Parse(await File.ReadAllTextAsync(path));
                        var bundle = document.RootElement;
                        if (bundle.GetProperty("productReference").GetString() == productId && bundle.GetProperty("variantReference").GetString() == variantId
                            && bundle.GetProperty("sourceImage").GetString() == variant.Image)
                        {
                            var published = bundle.GetProperty("inputs");
                            await VerifyPublishedFiles(root, productId, variantId, published);
                            inputs = published.Clone();
                        }
                    }
                    catch (Exception error) when (error is IOException or InvalidDataException or JsonException or KeyNotFoundException or InvalidOperationException or FormatException)
                    { throw new ProblemException("surface_unavailable", "Yayınlanmış ürün yüzeyi dosyaları doğrulanamadı.", 409); }
                }
            }
        }
        if (inputs is not { } value) throw new ProblemException("surface_unavailable", "Bu renk için onaylı yüzey sunucuda doğrulanamıyor.", 409);
        var width = value.GetProperty("width").GetInt32(); var height = value.GetProperty("height").GetInt32();
        var ratio = (double)width * height > 20_000_000 ? Math.Sqrt(16_000_000d / ((double)width * height)) : 1;
        if (value.GetProperty("surfaceVersion").GetString() != placement.SurfaceVersion
            || placement.SourceWidth != Math.Max(1, (int)(width * ratio)) || placement.SourceHeight != Math.Max(1, (int)(height * ratio)))
            throw new ProblemException("surface_changed", "Ürün yüzeyi değişti. Tasarımını güncel yüzeyde yeniden aç.", 409);
    }
    private static async Task VerifyPublishedFiles(string root, string product, string variant, JsonElement inputs)
    {
        string? version = null;
        foreach (var role in new[] { "source", "mask", "branding" })
        {
            if (role == "branding" && (!inputs.TryGetProperty(role, out var branding) || branding.ValueKind == JsonValueKind.Null)) continue;
            var media = inputs.GetProperty(role);
            var sha = media.GetProperty("sha256").GetString() ?? "";
            var prefix = $"/assets/product-previews/{product}/{variant}/";
            var url = media.GetProperty("url").GetString() ?? "";
            if (sha.Length != 64 || sha.Any(c => !char.IsAsciiHexDigit(c)) || !url.StartsWith(prefix, StringComparison.Ordinal)
                || !url.EndsWith("?v=" + sha, StringComparison.Ordinal)) throw new InvalidDataException("Invalid published media identity.");
            var relative = url[prefix.Length..].Split('?')[0].Split('/');
            if (relative.Length != 2 || !Guid.TryParseExact(relative[0], "D", out _) || relative[1] != (role == "source" ? "source.webp" : role + ".png")
                || version is not null && version != relative[0]) throw new InvalidDataException("Mixed published media versions.");
            version = relative[0];
            var path = Path.Combine(root, product, variant, relative[0], relative[1]);
            if (!File.Exists(path) || new FileInfo(path).Length > 32 * 1024 * 1024) throw new InvalidDataException("Published media unavailable.");
            await using var file = File.OpenRead(path);
            if (Convert.ToHexString(await SHA256.HashDataAsync(file)).ToLowerInvariant() != sha) throw new InvalidDataException("Published media checksum mismatch.");
            if (role == "mask" && sha != inputs.GetProperty("surfaceVersion").GetString()) throw new InvalidDataException("Published mask version mismatch.");
        }
    }
    private static bool Safe(string value) => value.Length is > 0 and <= 128 && value.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_');
}

public sealed partial class SavedDesignStore
{
    private record StoredConfiguration(string AccountId, MyDesignConfiguration Value);
    public async Task<MyDesignConfiguration[]> Configurations(string accountId) => (await store.Read()).Configurations
        .Where(item => item.AccountId == accountId).GroupBy(item => item.Value.Id).Select(group => group.MaxBy(item => item.Value.Revision)!.Value).ToArray();
    public async Task<MyDesignConfiguration> Configuration(string accountId, string id, int revision) =>
        (await store.Read()).Configurations.FirstOrDefault(item => item.AccountId == accountId && item.Value.Id == id && item.Value.Revision == revision)?.Value
            ?? throw ProblemException.NotFound("configuration_not_found", "Tasarım yerleşimi bulunamadı.");
    public async Task<MyDesignConfiguration> SaveConfiguration(string accountId, string designId, SaveDesignConfiguration request, Print.PrintSetupSnapshot? printSetup = null)
    {
        PlacementRules.Validate(request.Placement);
        var design = await Find(accountId, designId) ?? throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
        await using var image = await Image(accountId, designId) ?? throw ProblemException.NotFound("design_not_found", "Tasarım dosyası bulunamadı.");
        var sha = Convert.ToHexString(await SHA256.HashDataAsync(image.Content)).ToLowerInvariant();
        return await store.Update(state =>
        {
            if (!state.Designs.Any(d => d.Id == designId && d.AccountId == accountId)) throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
            var existing = request.ConfigurationId is null ? null : state.Configurations.Where(c => c.AccountId == accountId && c.Value.Id == request.ConfigurationId).MaxBy(c => c.Value.Revision)?.Value;
            if (request.ConfigurationId is not null && existing is null) throw ProblemException.NotFound("configuration_not_found", "Tasarım yerleşimi bulunamadı.");
            if (existing is not null && (existing.ProductId != design.ProductId || existing.Revision != request.ExpectedRevision))
                throw new ProblemException("configuration_changed", "Yerleşim başka bir işlemde değişti. Yeniden aç.", 409);
            if (state.Configurations.Count(c => c.AccountId == accountId) >= 1000) throw new ProblemException("configuration_limit", "Yerleşim kayıt sınırına ulaşıldı.", 409);
            var saved = new MyDesignConfiguration(existing?.Id ?? Guid.NewGuid().ToString("N"), designId, design.ProductId, request.VariantId,
                (existing?.Revision ?? 0) + 1, 1, request.Placement, request.Favorite, sha, clock.GetUtcNow(), printSetup);
            state.Configurations.Add(new(accountId, saved)); return saved;
        });
    }
    private static string PreviewFile(MyDesignConfiguration value) => $"preview-{value.Id}-{value.Revision}.jpg";
    public async Task SavePreview(string accountId, string id, int revision, byte[] bytes)
    {
        var value = await Configuration(accountId, id, revision);
        if (bytes.Length is 0 or > 2 * 1024 * 1024 || DetectImage(bytes).Mime != "image/jpeg")
            throw new ProblemException("invalid_preview", "Tasarım önizlemesi hazırlanamadı.");
        await files.Save(FileAreas.Designs, PreviewFile(value), new MemoryStream(bytes), "image/jpeg");
        // A design can be deleted while its thumbnail is being uploaded.
        try { await Configuration(accountId, id, revision); }
        catch { await files.Delete(FileAreas.Designs, PreviewFile(value)); throw; }
    }
    public async Task<StoredFile?> Preview(string accountId, string id, int revision)
    {
        var value = await Configuration(accountId, id, revision);
        return await files.Open(FileAreas.Designs, PreviewFile(value));
    }
    private async Task DeletePreviews(IEnumerable<MyDesignConfiguration> values)
    {
        foreach (var value in values) await files.Delete(FileAreas.Designs, PreviewFile(value));
    }
    public Task SetFavorite(string accountId, string id, bool favorite) => store.Update(state =>
    {
        var index = state.Configurations.FindLastIndex(item => item.AccountId == accountId && item.Value.Id == id);
        if (index < 0) throw ProblemException.NotFound("configuration_not_found", "Tasarım yerleşimi bulunamadı.");
        state.Configurations[index] = state.Configurations[index] with { Value = state.Configurations[index].Value with { Favorite = favorite } };
        return true;
    });
}
