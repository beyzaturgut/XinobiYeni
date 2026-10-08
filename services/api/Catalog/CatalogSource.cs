using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Catalog;

/// <summary>
/// Read side behind the public catalog contract. Development reads the local file store (ADR-003); other environments
/// read the published catalogue snapshot when <c>Catalog:SnapshotPath</c> is set, and otherwise answer 503 until the
/// SQL Server catalog lands (Faz03 03.11 / Faz04).
/// </summary>
public interface ICatalogSource
{
    Task<CommerceState> ReadAsync();
}

public sealed class CatalogUnavailableException() : Exception("Catalog source is not configured for this environment.");

public sealed class LocalCommerceCatalogSource(LocalCommerceStore store) : ICatalogSource
{
    public Task<CommerceState> ReadAsync() => store.Read();
}

public sealed class UnavailableCatalogSource : ICatalogSource
{
    public Task<CommerceState> ReadAsync() => throw new CatalogUnavailableException();
}

/// <summary>
/// Read-only catalogue from the snapshot the web package publishes (<c>commerce-preview/state.json</c>), so the mobile app
/// shows the same products as the deployed web. Nothing writes to it; it is reread when the file changes.
/// </summary>
public sealed class SnapshotCatalogSource(string path) : ICatalogSource
{
    private (DateTime Written, CommerceState State)? cached;

    public async Task<CommerceState> ReadAsync()
    {
        if (!File.Exists(path)) throw new CatalogUnavailableException();
        var written = File.GetLastWriteTimeUtc(path);
        if (cached is { } hit && hit.Written == written) return hit.State;
        var state = LocalCommerceStore.Parse(await File.ReadAllTextAsync(path));
        cached = (written, state);
        return state;
    }
}
