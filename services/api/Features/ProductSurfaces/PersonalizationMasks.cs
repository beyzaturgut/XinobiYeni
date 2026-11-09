using System.Security.Cryptography;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Infrastructure.MaskProcessing;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Features.ProductSurfaces;

public sealed record PersonalizationMask(string Id, int SourceRevision, string SourceSha256, string Image, string Sha256, long Bytes, string Method, DateTimeOffset CreatedAt, string StorageArea = "media");
public sealed record SingleSourceMaskDetail(string ProductId, string ProductName, int ProfileRevision, int SourceRevision, string SourceStatus,
    PersonalizationSourceAsset? Source, string Status, PersonalizationMask? Draft, PersonalizationMask? Approved);
public sealed record SingleSourceMaskUpload(string Image, string SourceSha256, int SourceRevision, int ExpectedRevision, string WebpBase64, string Mode);
public sealed record SingleSourceMaskAction(string SourceSha256, int SourceRevision, int ExpectedRevision, string? DraftId = null);

public sealed partial class PersonalizationSourceStore
{
    private static PersonalizationMask? CurrentMask(PersonalizationSourceProfile profile, string? id) =>
        (profile.Masks ?? []).SingleOrDefault(mask => mask.Id == id && mask.SourceRevision == profile.Sources.Last().Revision && mask.SourceSha256 == profile.Sources.Last().Asset.Sha256);

    private async Task<SingleSourceMaskDetail> MaskDetail(string productId, string name, State state)
    {
        if (!state.Profiles.TryGetValue(productId, out var profile)) return new(productId, name, 0, 0, "none", null, "none", null, null);
        var source = profile.Sources.Last(); var sourceStatus = "ready";
        try { if ((await Inspect(source.Asset.Image)).Asset.Sha256 != source.Asset.Sha256) sourceStatus = "stale"; }
        catch (ProblemException error) when (error.Code is "source_missing" or "invalid_source") { sourceStatus = "stale"; }
        var draft = CurrentMask(profile, profile.DraftId); var approved = CurrentMask(profile, profile.ApprovedId);
        foreach (var mask in new[] { draft, approved }.OfType<PersonalizationMask>()) await MaskBytes(mask);
        var status = sourceStatus == "stale" ? "stale" : draft is not null ? "draft" : approved is not null ? "approved"
            : profile.DraftId is not null || profile.ApprovedId is not null ? "stale" : "none";
        return new(productId, name, profile.ProfileRevision, source.Revision, sourceStatus, source.Asset, status,
            sourceStatus == "ready" && draft is not null ? draft with { Image = MaskUrl(productId, draft.Id) } : null, sourceStatus == "ready" && approved is not null ? approved with { Image = MaskUrl(productId, approved.Id) } : null);
    }

    public async Task<SingleSourceMaskDetail[]> ListMasks()
    {
        var products = (await catalog.Read()).Products.Where(p => p.Personalizable == true).ToArray();
        var state = await store.Read(); Validate(state);
        var result = new List<SingleSourceMaskDetail>();
        foreach (var product in products) result.Add(await MaskDetail(product.Id, product.Name, state));
        return result.ToArray();
    }

    public async Task<SingleSourceMaskDetail> GetMask(string productId)
    {
        await Product(productId);
        var name = (await catalog.Read()).Products.Single(p => p.Id == productId).Name;
        var state = await store.Read(); Validate(state);
        return await MaskDetail(productId, name, state);
    }

    private static PersonalizationSourceProfile CheckMaskSource(State state, string productId, SingleSourceMaskAction request)
    {
        Validate(state);
        if (!state.Profiles.TryGetValue(productId, out var profile)) throw new ProblemException("source_missing", "Önce katalogda tek kaynak fotoğrafı kaydedin.", 409);
        var source = profile.Sources.Last();
        if (profile.ProfileRevision != request.ExpectedRevision || source.Revision != request.SourceRevision || source.Asset.Sha256 != request.SourceSha256)
            throw new ProblemException("source_revision_conflict", "Kaynak veya maske değişti. Güncel kaydı yükleyip yeniden inceleyin.", 409);
        return profile;
    }

    private static string MaskUrl(string productId, string maskId) => "/api/v1/local-commerce/surfaces/products/" + Uri.EscapeDataString(productId) + "/masks/" + maskId + ".png";

    private async Task<byte[]> MaskBytes(PersonalizationMask mask)
    {
        var area = mask.StorageArea switch { "designs" => FileAreas.Designs, "media" => FileAreas.Media, _ => throw ProblemException.Unavailable("Maske dosyası") };
        var key = mask.StorageArea == "designs" ? "surface-mask-" + mask.Id + ".png" : mask.Id + ".png";
        await using var file = await files.Open(area, key);
        if (file is null) throw ProblemException.NotFound("mask_missing", "Kayıtlı maske dosyası bulunamadı.");
        using var buffer = new MemoryStream(); await file.Content.CopyToAsync(buffer); var bytes = buffer.ToArray();
        if (bytes.LongLength != mask.Bytes || Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant() != mask.Sha256)
            throw new ProblemException("mask_corrupt", "Kayıtlı maske dosyası doğrulanamadı.", 503);
        return bytes;
    }

    // Bound peak bitmap allocations, rather than imposing a source canvas or resolution.
    private static readonly SemaphoreSlim MaskProcessing = new(1, 1);
    private long MaskPixelBudget => Math.Clamp(configuration.GetValue<long>("ProductSurfaces:MaskProcessingMemoryMiB", 512), 16, 1024) * 1024 * 1024 / 16;

    public async Task<SingleSourceMaskDetail> UploadMask(string productId, SingleSourceMaskUpload request)
    {
        await MaskProcessing.WaitAsync();
        try { return await UploadMaskCore(productId, request); }
        finally { MaskProcessing.Release(); }
    }

    private async Task<SingleSourceMaskDetail> UploadMaskCore(string productId, SingleSourceMaskUpload request)
    {
        await Product(productId);
        var action = new SingleSourceMaskAction(request.SourceSha256, request.SourceRevision, request.ExpectedRevision);
        var state = await store.Read(); var profile = CheckMaskSource(state, productId, action); var source = profile.Sources.Last().Asset;
        if (source.Image != request.Image || (await Inspect(source.Image)).Asset.Sha256 != source.Sha256)
            throw new ProblemException("source_changed", "Kaynak fotoğraf değişti; güncel kaydı yükleyin.", 409);
        if (string.IsNullOrWhiteSpace(request.WebpBase64) || request.WebpBase64.Length > 12 * 1024 * 1024)
            throw new ProblemException("invalid_mask_webp", "En fazla 8 MB WebP maske yükleyin.");
        // Resource budget only: no required size, aspect ratio, crop or working copy.
        if ((long)source.Width * source.Height > MaskPixelBudget)
            throw new ProblemException("mask_processing_capacity", "Kaynak korunuyor; bu maskenin çözülmesi mevcut işleme kapasitesini aşıyor. Otomatik küçültme yapılmadı.", 413);
        byte[] encoded;
        try { encoded = Convert.FromBase64String(request.WebpBase64); }
        catch (FormatException) { throw new ProblemException("invalid_mask_webp", "WebP aktarımı okunamadı."); }
        var identity = new SourceMediaIdentity("personalization:" + productId, source.Sha256, source.Width, source.Height);
        var bytes = ManualSurfaceMasks.Webp(encoded, request.Mode, identity, MaskPixelBudget);
        var id = Guid.NewGuid().ToString("N"); var key = "surface-mask-" + id + ".png";
        await files.Save(FileAreas.Designs, key, new MemoryStream(bytes), "image/png");
        var mask = new PersonalizationMask(id, request.SourceRevision, source.Sha256, MaskUrl(productId, id),
            Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(), bytes.LongLength, "webp-" + request.Mode, clock.GetUtcNow(), "designs");
        await store.Update(current =>
        {
            var live = CheckMaskSource(current, productId, action);
            current.Profiles[productId] = live with { ProfileRevision = live.ProfileRevision + 1, Masks = [.. live.Masks ?? [], mask], DraftId = mask.Id };
            return true;
        });
        return await GetMask(productId);
    }

    public async Task<SingleSourceMaskDetail> MaskAction(string productId, SingleSourceMaskAction request, string action)
    {
        await Product(productId);
        var state = await store.Read(); var profile = CheckMaskSource(state, productId, request); var source = profile.Sources.Last().Asset;
        if ((await Inspect(source.Image)).Asset.Sha256 != source.Sha256) throw new ProblemException("source_changed", "Kaynak fotoğraf değişti.", 409);
        var draft = CurrentMask(profile, profile.DraftId);
        if (action == "approve")
        {
            if (draft is null || draft.Id != request.DraftId) throw new ProblemException("draft_changed", "Onaylanacak taslak değişti veya yok.", 409);
            await MaskBytes(draft);
        }
        await store.Update(current =>
        {
            var live = CheckMaskSource(current, productId, request);
            if (action == "approve" && live.DraftId != request.DraftId) throw new ProblemException("draft_changed", "Taslak değişti.", 409);
            current.Profiles[productId] = action switch
            {
                "approve" => live with { ProfileRevision = live.ProfileRevision + 1, ApprovedId = live.DraftId, DraftId = null },
                "discard" => live with { ProfileRevision = live.ProfileRevision + 1, DraftId = null },
                "revoke" => live with { ProfileRevision = live.ProfileRevision + 1, ApprovedId = null },
                _ => throw new ProblemException("invalid_mask_action", "Geçersiz maske işlemi.")
            };
            return true;
        });
        return await GetMask(productId);
    }

    public async Task<byte[]> MaskImage(string productId, string maskId)
    {
        await Product(productId);
        var state = await store.Read(); Validate(state);
        var mask = state.Profiles.GetValueOrDefault(productId)?.Masks?.SingleOrDefault(item => item.Id == maskId)
            ?? throw ProblemException.NotFound("mask_missing", "Bu ürünün maske dosyası bulunamadı.");
        return await MaskBytes(mask);
    }

    public async Task<byte[]> DownloadDraft(string productId, int sourceRevision, string maskId)
    {
        var detail = await GetMask(productId);
        if (detail.SourceRevision != sourceRevision || detail.SourceStatus != "ready" || detail.Draft is not { } draft || draft.Id != maskId)
            throw new ProblemException("draft_changed", "Kaynak veya taslak değişti; güncel kaydı yükleyin.", 409);
        return ManualSurfaceMasks.ExportWebp(await MaskBytes(draft));
    }
}
