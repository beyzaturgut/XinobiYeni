using System.Security.Cryptography;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Designs;

/// <summary>
/// A design kept in the customer's account (K-21): an AI design copied out of its short-lived XINOBI U session (<c>ai</c>) or
/// an image the customer uploaded (<c>upload</c>). The file is copied, so it outlives the session and is never shared.
/// </summary>
public record SavedDesign(string Id, string AccountId, string Kind, string Name, string ProductId, string ProductName, string? VariantId, string? Color,
    string[] Profile, string File, string Mime, DateTimeOffset CreatedAt);

/// <summary>What the owner sees; <paramref name="ImageUrl"/> needs the owner's session.</summary>
public record MyDesign(string Id, string Kind, string Name, string ProductId, string ProductName, string? VariantId, string? Color, string[] Profile, string ImageUrl, DateTimeOffset CreatedAt);
public record SaveDesignFromSession(string SessionId, string? Name);
public record RenameDesign(string Name);

public sealed partial class SavedDesignStore(FeatureDocuments documents, IFileStore files, TimeProvider clock, IConfiguration? configuration = null)
{
    public const int MaxPerAccount = 50;
    public const long MaxUploadBytes = 8 * 1024 * 1024;
    private sealed record State(List<SavedDesign> Designs) { public List<StoredConfiguration> Configurations { get; init; } = []; }
    private readonly DocumentStore<State> store = documents.Open<State>(Path.Combine("designs", "designs.json"), () => new([]), "Tasarımlarım");

    public static MyDesign View(SavedDesign design) => new(design.Id, design.Kind, design.Name, design.ProductId, design.ProductName, design.VariantId, design.Color, design.Profile,
        $"/api/v1/me/designs/{design.Id}/image", design.CreatedAt);

    public static string CleanName(string? name, string fallback)
    {
        var text = name?.Trim() ?? "";
        if (text.Length == 0)
        {
            text = new string(fallback.Where(character => !char.IsControl(character)).ToArray()).Trim();
            if (text.Length > 60) text = text[..(char.IsHighSurrogate(text[59]) ? 59 : 60)];
            return text.Length == 0 ? "Tasarım" : text;
        }
        return text.Length <= 60 && !text.Any(char.IsControl) ? text : throw new ProblemException("invalid_name", "Tasarım adı en fazla 60 karakter olabilir.");
    }

    /// <summary>PNG, JPEG or WebP by content, not by name; returns the MIME type and file extension.</summary>
    public static (string Mime, string Extension) DetectImage(ReadOnlySpan<byte> bytes) =>
        bytes.Length >= 8 && bytes[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) ? ("image/png", ".png")
        : bytes.Length >= 3 && bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255 ? ("image/jpeg", ".jpg")
        : bytes.Length >= 12 && System.Text.Encoding.ASCII.GetString(bytes[..4]) == "RIFF" && System.Text.Encoding.ASCII.GetString(bytes[8..12]) == "WEBP" ? ("image/webp", ".webp")
        : throw new ProblemException("invalid_image", "PNG, JPEG veya WebP görsel yükle.");

    public async Task<MyDesign[]> Mine(string accountId) =>
        (await store.Read()).Designs.Where(design => design.AccountId == accountId).OrderByDescending(design => design.CreatedAt).Select(View).ToArray();

    private async Task<SavedDesign[]> AdminSnapshot()
    {
        var state = await store.ReadRequired();
        if (state.Designs is null || state.Designs.Any(design => design is null || string.IsNullOrWhiteSpace(design.Id)
            || string.IsNullOrWhiteSpace(design.Kind) || string.IsNullOrWhiteSpace(design.ProductId)
            || string.IsNullOrWhiteSpace(design.ProductName) || string.IsNullOrWhiteSpace(design.Mime) || design.CreatedAt == default)
            || state.Designs.Select(design => design.Id).Distinct(StringComparer.Ordinal).Count() != state.Designs.Count)
            throw ProblemException.Unavailable("Tasarım kayıtları");
        return state.Designs.OrderByDescending(design => design.CreatedAt).ThenBy(design => design.Id, StringComparer.Ordinal).ToArray();
    }

    public async Task<AdminDesignPage> AdminList(int page, int pageSize)
    {
        if (page < 1 || pageSize is < 1 or > 100)
            throw new ProblemException("invalid_page", "Sayfa en az 1, sayfa boyutu 1–100 olmalı.");
        var designs = await AdminSnapshot();
        var offset = ((long)page - 1) * pageSize;
        var rows = offset >= designs.Length ? [] : designs.Skip((int)offset).Take(pageSize).Select(AdminDesignRow.From).ToArray();
        return new(rows, page, pageSize, designs.Length, (int)Math.Ceiling((double)designs.Length / pageSize));
    }

    public async Task<AdminDesignDetails> AdminDetails(string id)
    {
        var design = (await AdminSnapshot()).SingleOrDefault(design => design.Id == id)
            ?? throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
        return new(design.Id, design.Kind, design.ProductId, design.ProductName, design.VariantId, design.Color, design.CreatedAt, design.Mime);
    }

    /// <summary>Approved staff-only read; never exposes the owner or storage key.</summary>
    public async Task<StoredFile> AdminImage(string id)
    {
        var design = (await AdminSnapshot()).SingleOrDefault(item => item.Id == id)
            ?? throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
        if (design.Mime is not ("image/png" or "image/jpeg" or "image/webp"))
            throw ProblemException.Unavailable("Tasarım görseli");
        try
        {
            FileAreas.CheckedKey(FileAreas.Designs, design.File);
            var file = await files.Open(FileAreas.Designs, design.File)
                ?? throw ProblemException.NotFound("design_image_not_found", "Tasarım görseli bulunamadı.");
            if (file.ContentType != design.Mime)
            {
                await file.DisposeAsync();
                throw ProblemException.Unavailable("Tasarım görseli");
            }
            return file;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or ArgumentException)
        { throw ProblemException.Unavailable("Tasarım görseli"); }
    }

    /// <summary>Stores <paramref name="bytes"/> as a new design of the account; refuses past <see cref="MaxPerAccount"/>.</summary>
    public async Task<MyDesign> Add(string accountId, string kind, string name, string productId, string productName, string? variantId, string? color, string[] profile, byte[] bytes)
    {
        var (mime, extension) = DetectImage(bytes);
        var id = Guid.NewGuid().ToString("N");
        var file = id + extension;
        // The file goes first; if the record is refused (limit) the file is removed again.
        await files.Save(FileAreas.Designs, file, new MemoryStream(bytes), mime);
        try
        {
            return await store.Update(state =>
            {
                if (state.Designs.Count(design => design.AccountId == accountId) >= MaxPerAccount)
                    throw new ProblemException("design_limit", $"En fazla {MaxPerAccount} tasarım saklayabilirsin. Eskilerden birini sil.", StatusCodes.Status409Conflict);
                var design = new SavedDesign(id, accountId, kind, name, productId, productName, variantId, color, profile, file, mime, clock.GetUtcNow());
                state.Designs.Add(design);
                return View(design);
            });
        }
        catch
        {
            await files.Delete(FileAreas.Designs, file);
            throw;
        }
    }

    public Task<MyDesign> Rename(string accountId, string id, string name) => store.Update(state =>
    {
        var index = state.Designs.FindIndex(design => design.Id == id && design.AccountId == accountId);
        if (index < 0) throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
        return View(state.Designs[index] = state.Designs[index] with { Name = CleanName(name, state.Designs[index].Name) });
    });

    public async Task<bool> Delete(string accountId, string id)
    {
        var removed = await store.Update(state =>
        {
            var design = state.Designs.FirstOrDefault(item => item.Id == id && item.AccountId == accountId);
            // Deleting the latest source retires its whole configuration, so an
            // older favorite cannot reappear and revision numbers are not reused.
            var retired = state.Configurations.Where(item => item.AccountId == accountId).GroupBy(item => item.Value.Id)
                .Where(group => group.MaxBy(item => item.Value.Revision)!.Value.DesignId == id).Select(group => group.Key).ToHashSet();
            var configurations = state.Configurations.Where(item => item.AccountId == accountId && (item.Value.DesignId == id || retired.Contains(item.Value.Id))).ToArray();
            if (design is not null)
            {
                state.Designs.Remove(design);
                foreach (var configuration in configurations) state.Configurations.Remove(configuration);
            }
            return (Design: design, Previews: configurations.Select(item => item.Value).ToArray());
        });
        if (removed.Design is null) return false;
        await DeletePreviews(removed.Previews);
        await files.Delete(FileAreas.Designs, removed.Design.File);
        return true;
    }

    /// <summary>The file of the owner's design; null for anyone else (another customer's id is indistinguishable from a missing one).</summary>
    public async Task<StoredFile?> Image(string accountId, string id) =>
        (await store.Read()).Designs.FirstOrDefault(design => design.Id == id && design.AccountId == accountId) is { } design
            ? await files.Open(FileAreas.Designs, design.File) is { } file ? file with { ContentType = design.Mime } : null
            : null;

    /// <summary>The owner's design record; null for anyone else.</summary>
    public async Task<SavedDesign?> Find(string accountId, string id) =>
        (await store.Read()).Designs.FirstOrDefault(design => design.Id == id && design.AccountId == accountId);

    /// <summary>File key of a design copied into an order line; the order owns it, independent of the saved design.</summary>
    public static string OrderFile(string orderId, int line) => $"order-{orderId}-{line}";

    /// <summary>
    /// Copies the design image for an order line and returns its reference; null when the saved file is gone. A file whose checksum
    /// differs from the ordered placement's <paramref name="expectedSha256"/> is refused, so an order never binds another revision.
    /// </summary>
    public async Task<Identity.OrderDesignFile?> CopyToOrder(SavedDesign design, string orderId, int line, string? expectedSha256 = null, bool singleSource = false)
    {
        byte[] bytes;
        await using (var source = await files.Open(FileAreas.Designs, design.File))
        {
            if (source is null) return null;
            bytes = await ReadAll(source.Content);
        }
        if (singleSource) ValidateOrderImage(bytes, design.Mime);
        var copied = Reference(bytes, design.Mime);
        if (expectedSha256 is not null && copied.Sha256 != expectedSha256)
            throw new ProblemException("design_changed", $"{design.Name} tasarımının dosyası kayıtlı yerleşimle eşleşmiyor. Tasarımını yeniden aç.", StatusCodes.Status409Conflict);
        await files.Save(FileAreas.Designs, OrderFile(orderId, line), new MemoryStream(bytes), design.Mime);
        return copied;
    }

    /// <summary>Keeps the product photo the editor masked; later catalogue photo or mask changes do not reach the order.</summary>
    public async Task<Identity.OrderDesignFile> CopySourceToOrder(SurfaceSourceImage source, string orderId, int line, bool singleSource = false)
    {
        if (singleSource) ValidateOrderImage(source.Bytes, DetectImage(source.Bytes).Mime);
        var copied = Reference(source.Bytes, DetectImage(source.Bytes).Mime);
        await files.Save(FileAreas.Designs, OrderFile(orderId, line) + "-source", new MemoryStream(source.Bytes), copied.Mime);
        return copied;
    }

    /// <summary>The composed product preview is retained independently of editable designs; null when the revision has none.</summary>
    public async Task<Identity.OrderDesignFile?> CopyPreviewToOrder(string accountId, string configurationId, int revision, string orderId, int line)
    {
        byte[] bytes;
        await using (var preview = await Preview(accountId, configurationId, revision))
        {
            // Legacy/native clients may not have uploaded a composition. Do not substitute the raw artwork.
            if (preview is null) return null;
            bytes = await ReadAll(preview.Content);
        }
        ValidateOrderImage(bytes, "image/jpeg");
        await files.Save(FileAreas.Designs, OrderFile(orderId, line) + "-preview", new MemoryStream(bytes), "image/jpeg");
        return Reference(bytes, "image/jpeg");
    }

    public Task<StoredFile?> OrderImage(string orderId, int line, string mime, Identity.OrderDesignFile? expected = null) =>
        CheckedOrderCopy(OrderFile(orderId, line), mime, expected);

    public Task<StoredFile?> OrderPreview(string orderId, int line, Identity.OrderDesignFile? expected = null) =>
        CheckedOrderCopy(OrderFile(orderId, line) + "-preview", "image/jpeg", expected);

    public Task<StoredFile?> OrderSourceImage(string orderId, int line, Identity.OrderDesignFile expected) =>
        OrderCopy(OrderFile(orderId, line) + "-source", expected.Mime, expected);

    /// <summary>The kept product photo without the checksum check, for the read-only record inventory that compares it itself.</summary>
    public Task<StoredFile?> OrderSourceImageUnchecked(string orderId, int line, string mime) =>
        OrderCopy(OrderFile(orderId, line) + "-source", mime, null);

    /// <summary>An order's copy; with a recorded reference the bytes must still match it, otherwise the copy is reported unavailable.</summary>
    private async Task<StoredFile?> OrderCopy(string key, string mime, Identity.OrderDesignFile? expected)
    {
        var file = await files.Open(FileAreas.Designs, key);
        if (file is null || expected is null) return file is null ? null : file with { ContentType = mime };
        byte[] bytes;
        await using (file)
        {
            if (file.Length != expected.Bytes || file.Length is < 1 or > 32 * 1024 * 1024) throw ProblemException.Unavailable("Sipariş tasarım dosyası");
            bytes = await ReadAll(file.Content);
        }
        if (Reference(bytes, mime) != expected) throw ProblemException.Unavailable("Sipariş tasarım dosyası");
        try { if (Orders.OrderImageIntegrity.Inspect(bytes).Mime != expected.Mime) throw new InvalidDataException("Image type mismatch."); }
        catch (InvalidDataException) { throw ProblemException.Unavailable("Sipariş tasarım dosyası"); }
        return new StoredFile(new MemoryStream(bytes), mime, bytes.Length);
    }

    private async Task<StoredFile?> CheckedOrderCopy(string key, string mime, Identity.OrderDesignFile? expected)
    {
        var file = await OrderCopy(key, mime, expected);
        if (file is null || expected is not null) return file;
        byte[] bytes;
        await using (file)
        {
            if (file.Length is < 1 or > 32 * 1024 * 1024) throw ProblemException.Unavailable("Sipariş tasarım dosyası");
            bytes = await ReadAll(file.Content);
        }
        try { if (Orders.OrderImageIntegrity.Inspect(bytes).Mime != mime) throw new InvalidDataException("Image type mismatch."); }
        catch (InvalidDataException) { throw ProblemException.Unavailable("Sipariş tasarım dosyası"); }
        return new StoredFile(new MemoryStream(bytes), mime, bytes.Length);
    }

    private void ValidateOrderImage(byte[] bytes, string mime)
    {
        try
        {
            if (Orders.OrderImageIntegrity.Inspect(bytes, decode: true, Orders.OrderImageIntegrity.PixelBudget(configuration)).Mime != mime)
                throw new InvalidDataException("Image type mismatch.");
        }
        catch (InvalidDataException) { throw new ProblemException("invalid_order_image", "Sipariş görseli doğrulanamadı; tasarımı yeniden kaydedin.", 409); }
    }

    private static Identity.OrderDesignFile Reference(byte[] bytes, string mime) =>
        new(Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(), mime, bytes.Length);

    private static async Task<byte[]> ReadAll(Stream content)
    {
        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer);
        return buffer.ToArray();
    }

    public async Task ForgetOrderImage(string orderId, int line)
    {
        await files.Delete(FileAreas.Designs, OrderFile(orderId, line));
        await files.Delete(FileAreas.Designs, OrderFile(orderId, line) + "-preview");
        await files.Delete(FileAreas.Designs, OrderFile(orderId, line) + "-source");
    }

    public async Task ForgetAccount(string accountId)
    {
        var removed = await store.Update(state =>
        {
            var mine = state.Designs.Where(item => item.AccountId == accountId).ToArray();
            var previews = state.Configurations.Where(item => item.AccountId == accountId).Select(item => item.Value).ToArray();
            state.Designs.RemoveAll(item => item.AccountId == accountId);
            state.Configurations.RemoveAll(item => item.AccountId == accountId);
            return (Designs: mine, Previews: previews);
        });
        await DeletePreviews(removed.Previews);
        foreach (var design in removed.Designs) await files.Delete(FileAreas.Designs, design.File);
    }
}
