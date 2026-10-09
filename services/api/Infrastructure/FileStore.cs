using System.Text.RegularExpressions;

namespace Xinobi.Api.Infrastructure;

/// <summary>A stored file opened for reading; dispose it after use.</summary>
public sealed record StoredFile(Stream Content, string ContentType, long Length) : IAsyncDisposable
{
    public ValueTask DisposeAsync() => Content.DisposeAsync();
}

/// <summary>
/// Binary files (product media, customer designs) behind one contract, so the backend can move from a local folder to object
/// storage without touching features. Access rules stay in the endpoints: the store has no notion of who may read a file.
/// Keys are flat names (no folders), checked here so a caller can never escape its area.
/// </summary>
public interface IFileStore
{
    Task Save(string area, string key, Stream content, string contentType, CancellationToken cancellationToken = default);
    Task<StoredFile?> Open(string area, string key, CancellationToken cancellationToken = default);
    Task Delete(string area, string key, CancellationToken cancellationToken = default);
}

public static partial class FileAreas
{
    /// <summary>Catalog photos and videos; public on the storefront.</summary>
    public const string Media = "media";
    /// <summary>Customer designs; private to their owner (and staff for orders).</summary>
    public const string Designs = "designs";

    [GeneratedRegex("^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")]
    private static partial Regex KeyPattern();

    public static string CheckedKey(string area, string key) =>
        area is Media or Designs && KeyPattern().IsMatch(key) && !key.Contains("..", StringComparison.Ordinal)
            ? key
            : throw new ArgumentException($"Invalid file key for area '{area}'.", nameof(key));

    public static string ContentTypeOf(string key) => Path.GetExtension(key).ToLowerInvariant() switch
    {
        ".png" => "image/png", ".jpg" or ".jpeg" => "image/jpeg", ".webp" => "image/webp", ".mp4" => "video/mp4", ".webm" => "video/webm",
        _ => "application/octet-stream",
    };
}

/// <summary>
/// Files in a local folder: the Development data directory by default, or <c>Storage:LocalRoot</c> on a single server (kept out of
/// the web root and included in backups). Writes go to a temporary file first and are moved into place, so readers never see a
/// half-written file. The folder layout matches the earlier Development layout, so existing files stay where they are.
/// </summary>
public sealed class LocalFileStore(string root) : IFileStore
{
    private string Folder(string area) => area == FileAreas.Designs ? Path.Combine(root, "designs", "files") : Path.Combine(root, area);
    private string PathOf(string area, string key) => Path.Combine(Folder(area), FileAreas.CheckedKey(area, key));

    public async Task Save(string area, string key, Stream content, string contentType, CancellationToken cancellationToken = default)
    {
        var path = PathOf(area, key);
        Directory.CreateDirectory(Folder(area));
        var temporary = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            await using (var stream = File.Create(temporary)) await content.CopyToAsync(stream, cancellationToken);
            File.Move(temporary, path, true);
        }
        finally { File.Delete(temporary); }
    }

    public Task<StoredFile?> Open(string area, string key, CancellationToken cancellationToken = default)
    {
        var path = PathOf(area, key);
        if (!File.Exists(path)) return Task.FromResult<StoredFile?>(null);
        var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete, 64 * 1024, useAsync: true);
        return Task.FromResult<StoredFile?>(new StoredFile(stream, FileAreas.ContentTypeOf(key), stream.Length));
    }

    public Task Delete(string area, string key, CancellationToken cancellationToken = default)
    {
        File.Delete(PathOf(area, key));
        return Task.CompletedTask;
    }
}

/// <summary>No storage configured (outside Development without <c>Storage:LocalRoot</c>): every call is a 503, never a silent write.</summary>
public sealed class UnavailableFileStore : IFileStore
{
    private static ProblemException Unavailable() => ProblemException.Unavailable("Dosya deposu");
    public Task Save(string area, string key, Stream content, string contentType, CancellationToken cancellationToken = default) => throw Unavailable();
    public Task<StoredFile?> Open(string area, string key, CancellationToken cancellationToken = default) => throw Unavailable();
    public Task Delete(string area, string key, CancellationToken cancellationToken = default) => throw Unavailable();
}

public static class FileStorage
{
    /// <summary>Local root from <c>Storage:LocalRoot</c>, or the Development data directory; null means no storage here.</summary>
    public static string? LocalRoot(IWebHostEnvironment environment, IConfiguration configuration) =>
        configuration["Storage:LocalRoot"] is { Length: > 0 } root ? Path.GetFullPath(root)
        : environment.IsDevelopment() ? configuration["LocalCommerce:DataDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "local-commerce")
        : null;
}
