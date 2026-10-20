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

public sealed class SavedDesignStore(FeatureDocuments documents, IFileStore files, TimeProvider clock)
{
    public const int MaxPerAccount = 50;
    public const long MaxUploadBytes = 8 * 1024 * 1024;
    private sealed record State(List<SavedDesign> Designs);
    private readonly DocumentStore<State> store = documents.Open<State>(Path.Combine("designs", "designs.json"), () => new([]), "Tasarımlarım");

    public static MyDesign View(SavedDesign design) => new(design.Id, design.Kind, design.Name, design.ProductId, design.ProductName, design.VariantId, design.Color, design.Profile,
        $"/api/v1/me/designs/{design.Id}/image", design.CreatedAt);

    public static string CleanName(string? name, string fallback)
    {
        var text = name?.Trim() ?? "";
        if (text.Length == 0) return fallback;
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
        var design = await store.Update(state =>
        {
            var found = state.Designs.FirstOrDefault(item => item.Id == id && item.AccountId == accountId);
            if (found is not null) state.Designs.Remove(found);
            return found;
        });
        if (design is null) return false;
        await files.Delete(FileAreas.Designs, design.File);
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

    /// <summary>Copies the design image for an order line. Returns false when the saved file is gone.</summary>
    public async Task<bool> CopyToOrder(SavedDesign design, string orderId, int line)
    {
        await using var source = await files.Open(FileAreas.Designs, design.File);
        if (source is null) return false;
        await files.Save(FileAreas.Designs, OrderFile(orderId, line), source.Content, design.Mime);
        return true;
    }

    public async Task<StoredFile?> OrderImage(string orderId, int line, string mime) =>
        await files.Open(FileAreas.Designs, OrderFile(orderId, line)) is { } file ? file with { ContentType = mime } : null;

    public Task ForgetOrderImage(string orderId, int line) => files.Delete(FileAreas.Designs, OrderFile(orderId, line));

    public async Task ForgetAccount(string accountId)
    {
        var removed = await store.Update(state =>
        {
            var mine = state.Designs.Where(item => item.AccountId == accountId).ToArray();
            state.Designs.RemoveAll(item => item.AccountId == accountId);
            return mine;
        });
        foreach (var design in removed) await files.Delete(FileAreas.Designs, design.File);
    }
}
