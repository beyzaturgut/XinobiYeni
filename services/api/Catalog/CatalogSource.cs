using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Catalog;

/// <summary>
/// Read side behind the public catalog contract. Development reads the local file store (ADR-003);
/// other environments have no source until the SQL Server catalog lands (Faz03 03.11 / Faz04), so they answer 503.
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
