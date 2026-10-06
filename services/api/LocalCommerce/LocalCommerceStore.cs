using System.Text.Json;

namespace Xinobi.Api.LocalCommerce;

public record CommerceVariant(string Id, string Sku, string Color, int Stock, string Image, string? Hex = null);
public record CommerceProduct(string Id, string Name, string Category, bool Active, string Description, string SeoTitle, CommerceVariant[] Variants, bool? Personalizable = null, string? OriginalImage = null);
public record CommerceSlide(long Id, string Name, string Type, string Src, string Alt, int Duration, bool Active);
public record CommerceContent(CommerceSlide[] Slides, string XinobiBanner, string ButtonColor);
public record CommerceState(CommerceProduct[] Products, Dictionary<string, long> Prices, CommerceContent Content);
public record PriceUpdate(long Cents);

// Development-only persistence. Production commerce remains SQL Server backed.
public sealed class LocalCommerceStore(IWebHostEnvironment environment, IConfiguration configuration)
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string path = configuration["LocalCommerce:DataDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "local-commerce");
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    public string DataDirectory => path;
    public string MediaDirectory => Path.Combine(path, "media");

    private async Task<CommerceState> ReadCore()
    {
        var file = Path.Combine(path, "state.json");
        var source = File.Exists(file) ? file : Path.Combine(environment.ContentRootPath, "LocalCommerce", "seed.json");
        return JsonSerializer.Deserialize<CommerceState>(await File.ReadAllTextAsync(source), JsonOptions)
            ?? throw new InvalidDataException("Local commerce state is invalid.");
    }

    public async Task<CommerceState> Read()
    {
        await gate.WaitAsync();
        try { return await ReadCore(); }
        finally { gate.Release(); }
    }

    public async Task<CommerceState> Update(Func<CommerceState, CommerceState> change)
    {
        await gate.WaitAsync();
        try
        {
            var next = change(await ReadCore());
            Directory.CreateDirectory(path);
            var temporary = Path.Combine(path, "state.tmp");
            await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(next, JsonOptions));
            File.Move(temporary, Path.Combine(path, "state.json"), true);
            return next;
        }
        finally { gate.Release(); }
    }
}
