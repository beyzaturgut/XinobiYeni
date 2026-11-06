using System.Security.Cryptography;
using System.Text.RegularExpressions;
using SkiaSharp;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Features.ProductSurfaces;

public sealed record PersonalizationSourceAsset(string Image, string Sha256, string Mime, long Bytes, int Width, int Height);
public sealed record PersonalizationSourceRevision(int Revision, PersonalizationSourceAsset Asset, DateTimeOffset CreatedAt);
public sealed record PersonalizationSourceProfile(string ProductId, int ProfileRevision, PersonalizationSourceRevision[] Sources, PersonalizationMask[]? Masks = null, string? DraftId = null, string? ApprovedId = null);
public sealed record PersonalizationSourceView(string ProductId, int Revision, string Status, PersonalizationSourceAsset? Source, string SurfaceStatus, int SourceRevision = 0);
public sealed record SavePersonalizationSource(string Image, string SourceSha256, int ExpectedRevision);

/// <summary>Admin-only source staging. Does not replace variant masks or mutate historical designs/orders.</summary>
public sealed partial class PersonalizationSourceStore(FeatureDocuments documents, LocalCommerceStore catalog, IFileStore files,
    IWebHostEnvironment environment, IConfiguration configuration, TimeProvider clock)
{
    private sealed record State(int SchemaVersion, Dictionary<string, PersonalizationSourceProfile> Profiles);
    private readonly DocumentStore<State> store = documents.Open<State>("personalization/personalization-profiles.json", () => new(1, new()), "Kişiselleştirme kaynağı", rejectNull: true);
    private static void Validate(State state)
    {
        if (state.SchemaVersion != 1 || state.Profiles is null || state.Profiles.Any(pair => pair.Value is null || pair.Value.ProductId != pair.Key
            || pair.Value.ProfileRevision < 1 || pair.Value.Sources is null || pair.Value.Sources.Length == 0))
            throw ProblemException.Unavailable("Kişiselleştirme kaynağı");
    }
    private const int MaxBytes = 25 * 1024 * 1024;

    private async Task Product(string productId)
    {
        var product = (await catalog.Read()).Products.SingleOrDefault(p => p.Id == productId);
        if (product is null) throw ProblemException.NotFound("product_not_found", "Ürün bulunamadı.");
        if (product.Personalizable != true) throw new ProblemException("personalization_not_available", "Bu ürün XINOBI U için işaretli değil.", 409);
    }

    private async Task<(PersonalizationSourceAsset Asset, byte[] Bytes)> Inspect(string image)
    {
        byte[] bytes;
        if (image is not null && Regex.IsMatch(image, @"^/api/v1/local-commerce/media/[a-f0-9]{32}\.(png|jpg|webp)$"))
        {
            await using var file = await files.Open(FileAreas.Media, Path.GetFileName(image));
            if (file is null) throw ProblemException.NotFound("source_missing", "Kaynak dosya bulunamadı.");
            if (file.Length > MaxBytes) throw new ProblemException("invalid_source", "Kaynak fotoğraf en fazla 25 MB olabilir.");
            using var stream = new MemoryStream(); await file.Content.CopyToAsync(stream); bytes = stream.ToArray();
        }
        else if (image is not null && Regex.IsMatch(image, @"^/assets/[a-zA-Z0-9/_\-.]+\.(png|jpg|jpeg|webp)$") && !image.Contains(".."))
        {
            var root = Path.GetFullPath(configuration["ProductSurfaces:WebPublicDirectory"] ?? Path.Combine(environment.ContentRootPath, "../../apps/web/public"));
            var path = Path.GetFullPath(Path.Combine(root, image.TrimStart('/')));
            if (!path.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.Ordinal) || !File.Exists(path))
                throw ProblemException.NotFound("source_missing", "Kaynak dosya bulunamadı.");
            if (new FileInfo(path).Length > MaxBytes) throw new ProblemException("invalid_source", "Kaynak fotoğraf en fazla 25 MB olabilir.");
            bytes = await File.ReadAllBytesAsync(path);
        }
        else throw new ProblemException("invalid_source", "Yüklenmiş PNG, JPEG veya WebP kaynak fotoğraf seçin.");
        if (bytes.Length == 0 || bytes.Length > MaxBytes) throw new ProblemException("invalid_source", "Kaynak fotoğraf en fazla 25 MB olabilir.");
        using var data = SKData.CreateCopy(bytes);
        using var codec = SKCodec.Create(data);
        var mime = codec?.EncodedFormat switch { SKEncodedImageFormat.Png => "image/png", SKEncodedImageFormat.Jpeg => "image/jpeg", SKEncodedImageFormat.Webp => "image/webp", _ => null };
        if (codec is null || mime is null || codec.Info.Width <= 0 || codec.Info.Height <= 0 || codec.FrameCount > 1)
            throw new ProblemException("invalid_source", "Geçerli, tek kareli PNG, JPEG veya WebP fotoğraf seçin.");
        // Read dimensions without allocating a full-size pixel buffer. No fixed canvas, crop or resampling.
        return (new(image, Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(), mime, bytes.Length, codec.Info.Width, codec.Info.Height), bytes);
    }

    public async Task<PersonalizationSourceAsset> Candidate(string productId, string image)
    { await Product(productId); return (await Inspect(image)).Asset; }

    public async Task<PersonalizationSourceView> Get(string productId)
    {
        await Product(productId);
        var state = await store.Read(); Validate(state);
        if (!state.Profiles.TryGetValue(productId, out var profile)) return new(productId, 0, "none", null, "none");
        var source = profile.Sources.Last().Asset;
        try
        {
            var current = (await Inspect(source.Image)).Asset;
            var approved = CurrentMask(profile, profile.ApprovedId);
            if (current.Sha256 == source.Sha256 && approved is not null) await MaskBytes(approved);
            return new(productId, profile.ProfileRevision, current.Sha256 == source.Sha256 ? "ready" : "stale", source, current.Sha256 == source.Sha256 && approved is not null ? "approved" : "pending", profile.Sources.Last().Revision);
        }
        catch (ProblemException error) when (error.Code is "source_missing" or "invalid_source")
        { return new(productId, profile.ProfileRevision, "stale", source, "pending", profile.Sources.Last().Revision); }
    }

    public async Task<PersonalizationSourceView> Save(string productId, SavePersonalizationSource request)
    {
        await Product(productId);
        if (request.ExpectedRevision < 0) throw new ProblemException("invalid_revision", "Kaynak sürümünü kontrol et.");
        var previous = await store.Read(); Validate(previous);
        if ((previous.Profiles.GetValueOrDefault(productId)?.ProfileRevision ?? 0) != request.ExpectedRevision)
            throw new ProblemException("source_revision_conflict", "Kaynak başka bir işlemde değişti. Güncel kaydı yükleyip yeniden inceleyin.", 409);
        var candidate = await Inspect(request.Image);
        if (candidate.Asset.Sha256 != request.SourceSha256) throw new ProblemException("source_changed", "Kaynak fotoğraf değişti; yeniden seçin.", 409);
        // An independent immutable copy also protects sources selected from mutable catalogue/static photos.
        var extension = candidate.Asset.Mime switch { "image/png" => ".png", "image/jpeg" => ".jpg", _ => ".webp" };
        var key = Guid.NewGuid().ToString("N") + extension;
        await files.Save(FileAreas.Media, key, new MemoryStream(candidate.Bytes), candidate.Asset.Mime);
        var savedAsset = candidate.Asset with { Image = "/api/v1/local-commerce/media/" + key };
        await store.Update(state =>
        {
            Validate(state);
            state.Profiles.TryGetValue(productId, out var current);
            if ((current?.ProfileRevision ?? 0) != request.ExpectedRevision)
                throw new ProblemException("source_revision_conflict", "Kaynak başka bir işlemde değişti. Güncel kaydı yükleyip yeniden inceleyin.", 409);
            var revision = (current?.ProfileRevision ?? 0) + 1;
            var history = (current?.Sources ?? []).Append(new PersonalizationSourceRevision(revision, savedAsset, clock.GetUtcNow())).ToArray();
            state.Profiles[productId] = current is null ? new(productId, revision, history) : current with { ProfileRevision = revision, Sources = history };
            return true;
        });
        return new(productId, request.ExpectedRevision + 1, "ready", savedAsset, "pending", request.ExpectedRevision + 1);
    }
}
