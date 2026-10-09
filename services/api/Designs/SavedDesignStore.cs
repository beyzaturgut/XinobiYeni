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

public sealed class SavedDesignStore(IWebHostEnvironment environment, IConfiguration configuration, TimeProvider clock)
{
    public const int MaxPerAccount = 50;
    public const long MaxUploadBytes = 8 * 1024 * 1024;
    private sealed record State(List<SavedDesign> Designs);
    private readonly DevJsonStore<State> store = new(DevJsonStore<State>.DataDirectory(environment, configuration), Path.Combine("designs", "designs.json"), () => new([]), "Tasarımlarım");
    private string FileDirectory => Path.Combine(store.Folder, "files");

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

    /// <summary>Stores <paramref name="bytes"/> as a new design of the account; refuses past <see cref="MaxPerAccount"/>.</summary>
    public async Task<MyDesign> Add(string accountId, string kind, string name, string productId, string productName, string? variantId, string? color, string[] profile, byte[] bytes)
    {
        var (mime, extension) = DetectImage(bytes);
        var id = Guid.NewGuid().ToString("N");
        var file = id + extension;
        return await store.Update(state =>
        {
            if (state.Designs.Count(design => design.AccountId == accountId) >= MaxPerAccount)
                throw new ProblemException("design_limit", $"En fazla {MaxPerAccount} tasarım saklayabilirsin. Eskilerden birini sil.", StatusCodes.Status409Conflict);
            Directory.CreateDirectory(FileDirectory);
            System.IO.File.WriteAllBytes(Path.Combine(FileDirectory, file), bytes);
            var design = new SavedDesign(id, accountId, kind, name, productId, productName, variantId, color, profile, file, mime, clock.GetUtcNow());
            state.Designs.Add(design);
            return View(design);
        });
    }

    public Task<MyDesign> Rename(string accountId, string id, string name) => store.Update(state =>
    {
        var index = state.Designs.FindIndex(design => design.Id == id && design.AccountId == accountId);
        if (index < 0) throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
        return View(state.Designs[index] = state.Designs[index] with { Name = CleanName(name, state.Designs[index].Name) });
    });

    public Task<bool> Delete(string accountId, string id) => store.Update(state =>
    {
        var design = state.Designs.FirstOrDefault(item => item.Id == id && item.AccountId == accountId);
        if (design is null) return false;
        state.Designs.Remove(design);
        System.IO.File.Delete(Path.Combine(FileDirectory, design.File));
        return true;
    });

    /// <summary>The file of the owner's design; null for anyone else (another customer's id is indistinguishable from a missing one).</summary>
    public async Task<(string Path, string Mime)?> Image(string accountId, string id) =>
        (await store.Read()).Designs.FirstOrDefault(design => design.Id == id && design.AccountId == accountId) is { } design
            ? (Path.Combine(FileDirectory, design.File), design.Mime)
            : null;

    public Task ForgetAccount(string accountId) => store.Update(state =>
    {
        foreach (var design in state.Designs.Where(item => item.AccountId == accountId))
            System.IO.File.Delete(Path.Combine(FileDirectory, design.File));
        return state.Designs.RemoveAll(item => item.AccountId == accountId);
    });
}
