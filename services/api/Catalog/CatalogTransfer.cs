using System.Text.Json;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Catalog;

/// <summary>Explicit offline operation: no listener, background worker, e-mail or inference is started.</summary>
public static class CatalogTransfer
{
    public static async Task<int> Run(IServiceProvider services, string sourcePath, bool activate)
    {
        var commerce = services.GetRequiredService<LocalCommerceStore>();
        if (activate && Path.GetFullPath(sourcePath) != Path.GetFullPath(Path.Combine(commerce.DataDirectory, "state.json")))
            throw new InvalidOperationException("Activation requires the current catalog state.json; a fixture cannot activate the local catalog.");
        var sourceText = await File.ReadAllTextAsync(sourcePath);
        var state = LocalCommerceStore.Parse(sourceText);
        var sql = services.GetRequiredService<SqlCommerceStore>();
        var imported = await sql.Import(state);
        if (activate)
        {
            if (!SqlCommerceStore.Equivalent(state, LocalCommerceStore.Parse(await File.ReadAllTextAsync(sourcePath))))
                throw new InvalidOperationException("Source changed during import; SQL activation refused. Stop catalog writes and review.");
            // Presence selects SQL only for this data directory. Test directories continue using isolated files.
            var marker = Path.Combine(commerce.DataDirectory, "catalog-sql.enabled");
            await File.WriteAllTextAsync(marker + ".tmp", "SQL catalog imported and verified. Legacy state.json is an archive.\n");
            File.Move(marker + ".tmp", marker, true);
        }
        Console.WriteLine(JsonSerializer.Serialize(new
        {
            imported, products = state.Products.Length, variants = state.Products.Sum(p => p.Variants.Length),
            prices = state.Prices.Count, categories = state.Categories!.Length, verified = true, activated = activate
        }));
        return 0;
    }
}
