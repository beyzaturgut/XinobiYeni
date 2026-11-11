using System.Security.Cryptography;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Infrastructure.MaskProcessing;
using Xinobi.Api.Infrastructure.MediaValidation;

namespace Xinobi.Api.Features.ProductSurfaces;

public sealed partial class PersonalizationSourceStore
{
    // Selecting/downloading a catalogue photo never writes a profile. Only a valid explicit mask upload commits it.
    private async Task<SingleSourceMaskDetail> UploadCatalogMask(string productId, SingleSourceMaskUpload request)
    {
        var photos = await CatalogPhotos(productId);
        var photo = photos.SingleOrDefault(x => x.Id == request.CatalogPhotoId && x.Image == request.Image)
            ?? throw new ProblemException("source_changed", "Katalog fotoğrafını yeniden seçip maskeyi kontrol edin.", 409);
        var inspected = await Inspect(photo.Image); var source = inspected.Asset;
        if (source.Sha256 != request.SourceSha256) throw new ProblemException("source_changed", "Katalog fotoğrafı değişti. Güncel fotoğrafı indirip yeniden maskeleyin.", 409);
        if (string.IsNullOrWhiteSpace(request.WebpBase64) || request.WebpBase64.Length > 12 * 1024 * 1024)
            throw new ProblemException("invalid_mask_webp", "En fazla 8 MB WebP maske yükleyin.");
        if ((long)source.Width * source.Height > MaskPixelBudget)
            throw new ProblemException("mask_processing_capacity", "Kaynak korunuyor; maske mevcut işleme kapasitesini aşıyor. Otomatik küçültme yapılmadı.", 413);
        byte[] encoded;
        try { encoded = Convert.FromBase64String(request.WebpBase64); }
        catch (FormatException) { throw new ProblemException("invalid_mask_webp", "WebP aktarımı okunamadı."); }
        var bytes = ManualSurfaceMasks.Webp(encoded, request.Mode, new SourceMediaIdentity("catalog:" + productId, source.Sha256, source.Width, source.Height), MaskPixelBudget);
        var extension = source.Mime switch { "image/png" => ".png", "image/jpeg" => ".jpg", _ => ".webp" };
        var sourceKey = Guid.NewGuid().ToString("N") + extension; var maskId = Guid.NewGuid().ToString("N");
        await files.Save(FileAreas.Media, sourceKey, new MemoryStream(inspected.Bytes), source.Mime);
        await files.Save(FileAreas.Designs, "surface-mask-" + maskId + ".png", new MemoryStream(bytes), "image/png");
        // Recheck mutable catalogue association and bytes after processing; never copy the mask to other photos.
        var currentPhoto = (await CatalogPhotos(productId)).SingleOrDefault(x => x.Id == photo.Id);
        if (currentPhoto?.Image != photo.Image || (await Inspect(photo.Image)).Asset.Sha256 != source.Sha256)
            throw new ProblemException("source_changed", "Katalog fotoğrafı değişti; yükleme kaydedilmedi.", 409);
        var asset = source with { Image = "/api/v1/local-commerce/media/" + sourceKey };
        var mask = new PersonalizationMask(maskId,1,source.Sha256,MaskUrl(productId,maskId),Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),bytes.LongLength,"webp-"+request.Mode,clock.GetUtcNow(),"designs");
        await store.Update(state => {
            Validate(state);
            if (state.Profiles.ContainsKey(productId)) throw new ProblemException("source_revision_conflict", "Başka işlem bu ürünün maskesini değiştirdi. Güncel kaydı yükleyin.", 409);
            // A selected variant photo is also an explicit physical SKU selection. Original photo alone selects no SKU.
            state.Profiles[productId] = new(productId,1,[new(1,asset,clock.GetUtcNow())],[mask],maskId,null,photo.Id == "original" ? null : photo.Id);
            return true;
        });
        return await GetMask(productId);
    }
}
