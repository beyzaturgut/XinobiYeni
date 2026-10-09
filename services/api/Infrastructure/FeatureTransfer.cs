using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;

namespace Xinobi.Api.Infrastructure;

/// <summary>Explicit offline operation: copies the Development feature files into an empty ops.FeatureDocuments, verifies, then switches.</summary>
public static class FeatureTransfer
{
    public static async Task<int> Run(IServiceProvider services, bool activate)
    {
        var documents = services.GetRequiredService<FeatureDocuments>();
        var directory = documents.DataDirectory ?? throw new InvalidOperationException("Feature import requires Development.");
        var sources = new Dictionary<string, string>();
        foreach (var file in FeatureDocuments.Files.Where(file => File.Exists(Path.Combine(directory, file))))
        {
            var text = await File.ReadAllTextAsync(Path.Combine(directory, file));
            // Compact form; invalid JSON stops the import before anything is written.
            sources[FeatureDocuments.Name(file)] = JsonNode.Parse(text)!.ToJsonString();
        }
        await using (var scope = services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
            await using var transaction = await db.Database.BeginTransactionAsync();
            if (await db.FeatureDocuments.AnyAsync()) throw new InvalidOperationException("ops.FeatureDocuments is not empty; import refused.");
            foreach (var (name, json) in sources) db.FeatureDocuments.Add(new() { Name = name, Json = json, UpdatedAt = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
            var stored = await db.FeatureDocuments.AsNoTracking().ToDictionaryAsync(x => x.Name, x => x.Json);
            if (stored.Count != sources.Count || sources.Any(pair => !JsonNode.DeepEquals(JsonNode.Parse(stored[pair.Key]), JsonNode.Parse(pair.Value))))
                throw new InvalidOperationException("Imported feature documents differ from the source.");
            await transaction.CommitAsync();
        }
        if (activate)
        {
            foreach (var file in FeatureDocuments.Files.Where(file => File.Exists(Path.Combine(directory, file))))
                if (JsonNode.Parse(await File.ReadAllTextAsync(Path.Combine(directory, file)))!.ToJsonString() != sources[FeatureDocuments.Name(file)])
                    throw new InvalidOperationException("Feature files changed during import; SQL activation refused. Stop the API and review.");
            var marker = Path.Combine(directory, FeatureDocuments.Marker);
            await File.WriteAllTextAsync(marker + ".tmp", "Feature documents imported and verified. The JSON files are an archive.\n");
            File.Move(marker + ".tmp", marker, true);
        }
        Console.WriteLine(JsonSerializer.Serialize(new { documents = sources.Keys.Order(), verified = true, activated = activate }));
        return 0;
    }
}
