using System.Security.Cryptography;
using System.Text.Json;
using Xinobi.Api.Infrastructure.MaskProcessing;
using Xinobi.Api.Infrastructure.MediaValidation;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Features.ProductSurfaces.Catalog;

public enum SurfaceStatus { None, Draft, Approved, Stale }

/// <summary>One variant photo's masking work: the current draft and how it was made. The approved mask lives on the variant itself.</summary>
public sealed record SurfaceDraft(string ProductId, string VariantId, string Image, string MaskFile, string Method, string? Prompt, double? Score, DateTimeOffset UpdatedAt);

/// <summary><c>Status</c>: none, draft, approved or stale (approved for a photo the variant no longer uses).</summary>
public sealed record SurfaceSummary(string ProductId, string ProductName, string VariantId, string Color, string Image, string Status, DateTimeOffset? DraftUpdatedAt);

public sealed record SurfaceDetail(string ProductId, string ProductName, string VariantId, string Color, string Image, int Width, int Height,
    string Status, string? ApprovedMask, SurfaceDraft? Draft, SurfaceProviderStatus Provider);

public sealed record SurfaceProviderStatus(bool Configured, int UsedToday, int DailyLimit);

public sealed record SurfaceSegmentRequest(string? Prompt, SurfacePoint[]? Points);
public sealed record SurfacePoint(double X, double Y, bool Keep);
/// <summary><c>Base</c>: "draft" (default when one exists), "approved" or "empty".</summary>
public sealed record SurfaceStrokeRequest(SurfaceStroke[] Strokes, string? Base);
/// <summary><c>Operation</c>: "add" or "remove"; radius and points in source-photo pixels.</summary>
public sealed record SurfaceStroke(string Operation, double Radius, SurfaceStrokePoint[] Points);
public sealed record SurfaceStrokePoint(double X, double Y);

public sealed class SurfaceException(string code, string message, int status = StatusCodes.Status400BadRequest) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;
}

/// <summary>
/// Development workspace behind the admin "Ürün yüzeyi" screen, for every product variant (generalises the Tea Maker review):
/// the admin asks Roboflow SAM3 for a mask (text prompt or keep/exclude points) and/or paints it by hand, then approves it.
/// Approval copies the mask into commerce media and records it on the variant, so storefront, snapshot and deploy carry it
/// like the product photo. Roboflow is called only on an explicit admin action, within a daily limit, with a server-side key.
/// </summary>
public sealed class ProductSurfaceWorkspace(LocalCommerceStore commerce, Xinobi.Api.Infrastructure.IFileStore files, IWebHostEnvironment environment, IConfiguration configuration, IHttpClientFactory http, TimeProvider clock)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly SemaphoreSlim gate = new(1, 1);
    private sealed record State(List<SurfaceDraft> Drafts, Dictionary<string, int> Usage);

    private string Directory => Path.Combine(commerce.DataDirectory, "product-surfaces");
    private string StatePath => Path.Combine(Directory, "workspace.json");
    private string DraftPath(string file) => Path.Combine(Directory, "drafts", file);
    private string? ApiKey => configuration["ProductSurfaces:Roboflow:ApiKey"] is { Length: > 0 } key ? key : null;
    private int DailyLimit => Math.Clamp(configuration.GetValue("ProductSurfaces:Roboflow:DailyLimit", 50), 0, 1000);
    private string Today => clock.GetUtcNow().ToString("yyyy-MM-dd");

    private async Task<State> Read() => File.Exists(StatePath) ? JsonSerializer.Deserialize<State>(await File.ReadAllTextAsync(StatePath), Json)! : new([], []);

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

    private SurfaceProviderStatus Provider(State state) => new(ApiKey is not null, state.Usage.GetValueOrDefault(Today), DailyLimit);

    private static string StatusOf(CommerceVariant variant, SurfaceDraft? draft) => (
        variant.ApprovedSurfaceMask is not null ? SurfaceStatus.Approved
        : draft is not null && draft.Image == variant.Image ? SurfaceStatus.Draft
        : !string.IsNullOrEmpty(variant.SurfaceMask) ? SurfaceStatus.Stale
        : SurfaceStatus.None).ToString().ToLowerInvariant();

    private static MaskStroke[] Strokes(SurfaceStroke[]? strokes) => (strokes ?? []).Select(stroke => new MaskStroke(
        stroke?.Operation?.ToLowerInvariant() switch { "add" => MaskStrokeOperation.Add, "remove" => MaskStrokeOperation.Remove, _ => throw new SurfaceException("invalid_strokes", "Fırça işlemi \"add\" ya da \"remove\" olmalı.") },
        stroke.Radius, (stroke.Points ?? []).Select(point => new MaskStrokePoint(point.X, point.Y)).ToArray())).ToArray();

    private static SurfaceDraft? DraftFor(State state, string productId, CommerceVariant variant) =>
        state.Drafts.FirstOrDefault(draft => draft.ProductId == productId && draft.VariantId == variant.Id && draft.Image == variant.Image);

    public async Task<SurfaceSummary[]> List()
    {
        var catalogue = await commerce.Read();
        return await Locked(state => Task.FromResult(catalogue.Products.SelectMany(product => product.Variants
            .Where(variant => !string.IsNullOrEmpty(variant.Image))
            .Select(variant =>
            {
                var draft = DraftFor(state, product.Id, variant);
                return new SurfaceSummary(product.Id, product.Name, variant.Id, variant.Color, variant.Image, StatusOf(variant, draft), draft?.UpdatedAt);
            })).ToArray()));
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
            StatusOf(variant, draft), variant.ApprovedSurfaceMask, draft, Provider(state));
    }

    public async Task<byte[]> DraftMask(string productId, string variantId)
    {
        var (_, variant) = await Find(productId, variantId);
        return await Locked(async state => DraftFor(state, productId, variant) is { } draft
            ? await File.ReadAllBytesAsync(DraftPath(draft.MaskFile))
            : throw new SurfaceException("draft_not_found", "Bu renk için taslak maske yok.", StatusCodes.Status404NotFound));
    }

    /// <summary>One Roboflow SAM3 call: text prompt (concept segment) or keep/exclude points (visual segment). The result becomes the draft.</summary>
    public async Task<SurfaceDetail> Segment(string productId, string variantId, SurfaceSegmentRequest request, CancellationToken cancellationToken)
    {
        var (product, variant) = await Find(productId, variantId);
        var key = ApiKey ?? throw new SurfaceException("provider_not_configured", "Roboflow anahtarı tanımlı değil. Maskeyi elle çizebilirsin.", StatusCodes.Status503ServiceUnavailable);
        var prompt = request.Prompt?.Trim();
        var points = request.Points ?? [];
        if (points.Length == 0 && string.IsNullOrEmpty(prompt)) throw new SurfaceException("prompt_required", "Bir tarif (ör. \"kettle body\") yaz ya da fotoğrafta nokta seç.");
        if (prompt is { Length: > 120 }) throw new SurfaceException("prompt_too_long", "Tarif en fazla 120 karakter olabilir.");
        if (points.Length > 20) throw new SurfaceException("too_many_points", "En fazla 20 nokta seçebilirsin.");
        var bytes = SourceBytes(variant.Image);
        var source = new AlignedImageInspector().InspectSource(bytes, "commerce:" + variant.Image);

        // Reserve the call before sending it, so parallel clicks cannot exceed the daily limit.
        await Locked(async state =>
        {
            var used = state.Usage.GetValueOrDefault(Today);
            if (used >= DailyLimit) throw new SurfaceException("daily_limit", $"Bugünkü Roboflow sınırına ({DailyLimit}) ulaşıldı. Maskeyi elle düzeltebilirsin.", StatusCodes.Status429TooManyRequests);
            state.Usage.Clear();
            state.Usage[Today] = used + 1;
            await Write(state);
            return true;
        });

        var buffer = new DevelopmentMaskBuffer();
        var options = new RoboflowSegmentationOptions { ApiKey = key, TimeoutSeconds = Math.Clamp(configuration.GetValue("ProductSurfaces:Roboflow:TimeoutSeconds", 60), 1, 120) };
        var provider = new RoboflowSurfaceSegmentationProvider(http.CreateClient("roboflow"), options, externalInferenceEnabled: true, _ => bytes, buffer);
        var surface = new SurfaceIntent("designable-area", string.IsNullOrEmpty(prompt) ? "product body" : prompt);
        SegmentationResult result;
        try
        {
            result = points.Length == 0
                ? await provider.GenerateAutomaticAsync(new AutomaticSegmentationRequest(source, surface), cancellationToken)
                : await provider.GenerateInteractiveAsync(new InteractiveSegmentationRequest(source, surface,
                    points.Select(point => new SourcePoint(point.X, point.Y, point.Keep ? PointIntent.Keep : PointIntent.Exclude))), cancellationToken);
        }
        catch (SegmentationProviderException error) { throw new SurfaceException(error.Message, ProviderMessage(error.Message), error.Status); }
        catch (ArgumentOutOfRangeException) { throw new SurfaceException("invalid_point", "Noktalar fotoğrafın içinde olmalı."); }
        var candidate = result.Candidates[0];
        return await SaveDraft(product, variant, source, buffer.Bytes(candidate.Mask.AssetReference), points.Length == 0 ? "roboflow-text" : "roboflow-points", prompt, candidate.Score?.Value);
    }

    /// <summary>Brush corrections (add/remove) on the draft, the approved mask or an empty canvas. The result becomes the draft.</summary>
    public async Task<SurfaceDetail> Paint(string productId, string variantId, SurfaceStrokeRequest request)
    {
        var (product, variant) = await Find(productId, variantId);
        var bytes = SourceBytes(variant.Image);
        var source = new AlignedImageInspector().InspectSource(bytes, "commerce:" + variant.Image);
        var draft = await Locked(state => Task.FromResult(DraftFor(state, productId, variant)));
        var basis = request.Base ?? (draft is not null ? "draft" : variant.ApprovedSurfaceMask is not null ? "approved" : "empty");
        byte[]? parent = basis switch
        {
            "draft" => draft is null ? throw new SurfaceException("draft_not_found", "Düzeltilecek taslak yok.") : await File.ReadAllBytesAsync(DraftPath(draft.MaskFile)),
            "approved" => variant.ApprovedSurfaceMask is { } approved ? SourceBytes(approved) : throw new SurfaceException("approval_not_found", "Onaylı maske yok."),
            "empty" => null,
            _ => throw new SurfaceException("invalid_base", "Geçersiz başlangıç maskesi."),
        };
        var corrector = new ManualMaskCorrector();
        var reference = "dev:surface-mask:" + Guid.NewGuid().ToString("N");
        MaskCorrectionResult corrected;
        try
        {
            corrected = parent is null
                ? corrector.StartFromStrokes(source, Strokes(request.Strokes), reference)
                : corrector.Correct(parent, new AlignedImageInspector().ValidateMask(parent, reference + ":parent", source, source), source, Strokes(request.Strokes), reference);
        }
        catch (ArgumentException) { throw new SurfaceException("invalid_strokes", "Fırça çizgileri geçersiz (en fazla 100 çizgi, fırça 1–32 px)."); }
        catch (InvalidDataException error) when (error.Message.Contains("empty or full")) { throw new SurfaceException("mask_empty_or_full", "Maske tamamen boş ya da tamamen dolu olamaz."); }
        catch (InvalidDataException) { throw new SurfaceException("mask_invalid", "Maske bu fotoğrafla eşleşmiyor. Yeniden başla."); }
        catch (InvalidOperationException) { throw new SurfaceException("mask_invalid", "Maske bu fotoğrafla eşleşmiyor. Yeniden başla."); }
        var method = draft?.Method is { } previous && basis == "draft" ? (previous.EndsWith("+brush") ? previous : previous + "+brush") : basis == "empty" ? "brush" : "approved+brush";
        return await SaveDraft(product, variant, source, corrected.Bytes, method, draft?.Prompt, draft?.Score);
    }

    private async Task<SurfaceDetail> SaveDraft(CommerceProduct product, CommerceVariant variant, SourceMediaIdentity source, byte[] mask, string method, string? prompt, double? score) =>
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
            state.Drafts.Add(new SurfaceDraft(product.Id, variant.Id, variant.Image, file, method, prompt, score, clock.GetUtcNow()));
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

    private static string ProviderMessage(string code) => code switch
    {
        "provider_authentication_failed" => "Roboflow anahtarı reddedildi. Anahtarı kontrol et.",
        "provider_rate_limited" => "Roboflow şu anda çok fazla istek alıyor. Biraz sonra tekrar dene.",
        "provider_timeout" => "Roboflow zamanında yanıt vermedi. Tekrar deneyebilirsin.",
        "provider_request_rejected" => "Roboflow isteği reddetti. Tarifi veya noktaları değiştir.",
        "provider_invalid_mask" or "provider_invalid_response" => "Roboflow geçerli bir maske döndürmedi. Tarifi değiştir ya da elle çiz.",
        _ => "Roboflow'a ulaşılamadı. Biraz sonra tekrar dene ya da maskeyi elle çiz.",
    };
}
