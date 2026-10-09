using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Catalog;

/// <summary>
/// Read side behind the public catalog contract. Development uses the compatibility facade; an explicit SQL provider
/// selects the relational catalog. Other environments may use the published read-only snapshot or answer 503.
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

public sealed class SqlCatalogSource(SqlCommerceStore store) : ICatalogSource
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
