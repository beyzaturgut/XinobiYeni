using System.Net;
using System.Text.RegularExpressions;

namespace Xinobi.Api.LocalCommerce;

public static class LocalCommerceEndpoints
{
    public static bool AllowedOrigin(string origin) => origin is "http://127.0.0.1:3000" or "http://localhost:3000" or "http://127.0.0.1:5173" or "http://localhost:5173";
    private static bool ValidMedia(string source) => string.IsNullOrEmpty(source) ||
        Regex.IsMatch(source, @"^/assets/[a-zA-Z0-9/_\-.]+$") || Regex.IsMatch(source, @"^/api/v1/local-commerce/media/[a-f0-9]{32}\.(png|jpg|webp|mp4|webm)$");

    public static void MapLocalCommerce(this WebApplication app)
    {
        // These endpoints must never be exposed by a production deployment.
        if (!app.Environment.IsDevelopment()) return;
        var group = app.MapGroup("/api/v1/local-commerce").WithTags("LocalCommerce");
        group.AddEndpointFilter(async (context, next) =>
        {
            var request = context.HttpContext;
            if (request.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(403);
            var origin = request.Request.Headers.Origin.ToString();
            if (origin.Length > 0 && !AllowedOrigin(origin)) return Results.StatusCode(403);
            request.Response.Headers.CacheControl = "no-store";
            return await next(context);
        });
        group.MapGet("/state", async (LocalCommerceStore store) => Results.Ok(await store.Read()));
        group.MapPost("/categories", async (CategoryCreate category, LocalCommerceStore store) =>
        {
            var name = category.Name?.Trim();
            if (string.IsNullOrWhiteSpace(name) || name.Length > 80 || name.Any(char.IsControl) || string.Equals(name, "Tümü", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest(new { message = "1–80 karakterlik geçerli kategori adı girin." });
            try
            {
                return Results.Ok(await store.Update(state =>
                {
                    var comparer = StringComparer.Create(new System.Globalization.CultureInfo("tr-TR"), true);
                    if (state.Categories!.Contains(name, comparer)) throw new ArgumentException("Bu kategori zaten var.");
                    return state with { Categories = [.. state.Categories!, name] };
                }));
            }
            catch (ArgumentException error) { return Results.Conflict(new { message = error.Message }); }
        });
        group.MapDelete("/categories/{name}", async (string name, string? moveTo, LocalCommerceStore store) =>
        {
            try
            {
                return Results.Ok(await store.Update(state =>
                {
                    if (!state.Categories!.Contains(name)) throw new KeyNotFoundException("Kategori bulunamadı.");
                    var populated = state.Products.Any(product => product.Category == name);
                    if (populated && (moveTo == name || moveTo is null || !state.Categories!.Contains(moveTo)))
                        throw new ArgumentException("Bu kategoride ürün var. Ürünlerin taşınacağı başka bir kategori seçin.");
                    return state with
                    {
                        Categories = state.Categories!.Where(category => category != name).ToArray(),
                        Products = state.Products.Select(product => product.Category == name ? product with { Category = moveTo! } : product).ToArray(),
                        Content = state.Content with { CategoryProducts = state.Content.CategoryProducts?.Where(pair => pair.Key != name).ToDictionary() }
                    };
                }));
            }
            catch (KeyNotFoundException error) { return Results.NotFound(new { message = error.Message }); }
            catch (ArgumentException error) { return Results.Conflict(new { message = error.Message }); }
        });
        group.MapPut("/products/{id}", async (string id, CommerceProduct product, LocalCommerceStore store) =>
        {
            if (id != product.Id || string.IsNullOrWhiteSpace(product.Name) || product.Name.Length > 120 || product.Variants is null || !ValidMedia(product.OriginalImage ?? "") ||
                (product.Active && product.Variants.Length == 0) || product.Variants.Any(v => string.IsNullOrWhiteSpace(v.Id) || string.IsNullOrWhiteSpace(v.Sku) || string.IsNullOrWhiteSpace(v.Color) || v.Stock < 0 || !ValidMedia(v.Image) || (!string.IsNullOrEmpty(v.Hex) && !Regex.IsMatch(v.Hex, "^#[a-fA-F0-9]{6}$"))) ||
                product.Variants.Select(v => v.Id).Distinct().Count() != product.Variants.Length || product.Variants.Select(v => v.Sku.ToUpperInvariant()).Distinct().Count() != product.Variants.Length)
                return Results.BadRequest(new { message = "Ürün adı, benzersiz SKU, geçerli görsel, #RRGGBB HEX kodu ve pozitif stok alanlarını kontrol edin." });
            try
            {
                var state = await store.Update(state =>
                {
                    if (!state.Categories!.Contains(product.Category)) throw new ArgumentException("Geçerli kategori seçin.");
                    if (state.Products.Where(p => p.Id != id).SelectMany(p => p.Variants).Any(other => product.Variants.Any(v => v.Id == other.Id || string.Equals(v.Sku, other.Sku, StringComparison.OrdinalIgnoreCase))))
                        throw new ArgumentException("SKU veya varyant kimliği başka bir üründe kullanılıyor.");
                    return state with { Products = state.Products.Any(p => p.Id == id) ? state.Products.Select(p => p.Id == id ? product : p).ToArray() : [.. state.Products, product] };
                });
                return Results.Ok(state);
            }
            catch (ArgumentException error) { return Results.BadRequest(new { message = error.Message }); }
        });
        group.MapDelete("/products/{id}", async (string id, LocalCommerceStore store) => Results.Ok(await store.Update(state => state with
        {
            Products = state.Products.Where(p => p.Id != id).ToArray(),
            Prices = state.Prices.Where(pair => !state.Products.Where(p => p.Id == id).SelectMany(p => p.Variants).Any(v => v.Id == pair.Key)).ToDictionary()
        })));
        group.MapPut("/prices/{id}", async (string id, PriceUpdate price, LocalCommerceStore store) =>
        {
            if (price.Cents <= 0 || price.Cents > 999999999) return Results.BadRequest(new { message = "Geçerli pozitif fiyat girin." });
            try
            {
                return Results.Ok(await store.Update(state =>
                {
                    if (!state.Products.SelectMany(p => p.Variants).Any(v => v.Id == id)) throw new ArgumentException("Varyant bulunamadı.");
                    return state with { Prices = new Dictionary<string, long>(state.Prices) { [id] = price.Cents } };
                }));
            }
            catch (ArgumentException error) { return Results.BadRequest(new { message = error.Message }); }
        });
        group.MapPut("/content", async (CommerceContent content, LocalCommerceStore store) =>
        {
            if (content.Slides is null || content.Slides.Length > 50 || !ValidMedia(content.XinobiBanner) || !ValidMedia(content.TitaniumBanner ?? "") || !Regex.IsMatch(content.ButtonColor ?? "", "^#[a-fA-F0-9]{6}$") ||
                content.Slides.Select(s => s.Id).Distinct().Count() != content.Slides.Length || content.Slides.Any(s => !ValidMedia(s.Src) || string.IsNullOrEmpty(s.Src) || s.Type is not ("Fotoğraf" or "Video") || (s.Type == "Fotoğraf" && (s.Duration < 3 || s.Duration > 20))))
                return Results.BadRequest(new { message = "Banner görselleri, süreleri ve buton rengini kontrol edin." });
            try
            {
                return Results.Ok(await store.Update(state =>
                {
                    if (content.FeaturedProducts is { } featured && (featured.Length > 4 || featured.Distinct().Count() != featured.Length || featured.Any(id => !state.Products.Any(product => product.Id == id && product.Active) && !(state.Content.FeaturedProducts?.Contains(id) ?? false))))
                        throw new ArgumentException("Öne çıkanlar için en fazla dört farklı aktif ürün seçin.");
                    if (content.CategoryProducts is { } selections && (selections.Count > 100 || selections.Any(pair =>
                        !state.Categories!.Contains(pair.Key) || (pair.Value != "" && state.Content.CategoryProducts?.GetValueOrDefault(pair.Key) != pair.Value && !state.Products.Any(p => p.Active && p.Category == pair.Key && p.Variants.Any(v => v.Id == pair.Value && !string.IsNullOrEmpty(v.Image)))))))
                        throw new ArgumentException("Kategori için aynı kategorideki aktif bir ürün görselini seçin.");
                    return state with { Content = content };
                }));
            }
            catch (ArgumentException error) { return Results.BadRequest(new { message = error.Message }); }
        });
        group.MapPost("/media", async (HttpRequest request, LocalCommerceStore store) =>
        {
            if (!request.HasFormContentType) return Results.BadRequest(new { message = "Medya dosyası gerekli." });
            var form = await request.ReadFormAsync();
            var file = form.Files.GetFile("file");
            var extensions = new Dictionary<string, string> { ["image/png"] = ".png", ["image/jpeg"] = ".jpg", ["image/webp"] = ".webp", ["video/mp4"] = ".mp4", ["video/webm"] = ".webm" };
            if (file is null || file.Length == 0 || file.Length > 25 * 1024 * 1024 || !extensions.TryGetValue(file.ContentType, out var extension))
                return Results.BadRequest(new { message = "PNG, JPEG, WebP, MP4 veya WebM yükleyin (en fazla 25 MB)." });
            var signature = new byte[12];
            await using (var input = file.OpenReadStream())
            {
                var read = await input.ReadAtLeastAsync(signature, 12, throwOnEndOfStream: false);
                var valid = extension switch
                {
                    ".png" => read >= 8 && signature.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
                    ".jpg" => read >= 3 && signature[0] == 255 && signature[1] == 216 && signature[2] == 255,
                    ".webp" => read >= 12 && System.Text.Encoding.ASCII.GetString(signature, 0, 4) == "RIFF" && System.Text.Encoding.ASCII.GetString(signature, 8, 4) == "WEBP",
                    ".mp4" => read >= 8 && System.Text.Encoding.ASCII.GetString(signature, 4, 4) == "ftyp",
                    ".webm" => read >= 4 && signature.AsSpan(0, 4).SequenceEqual(new byte[] { 26, 69, 223, 163 }),
                    _ => false
                };
                if (!valid) return Results.BadRequest(new { message = "Dosya içeriği seçilen medya türüyle eşleşmiyor." });
            }
            var name = Guid.NewGuid().ToString("N") + extension;
            Directory.CreateDirectory(store.MediaDirectory);
            await using var stream = File.Create(Path.Combine(store.MediaDirectory, name));
            await file.CopyToAsync(stream);
            return Results.Ok(new { src = "/api/v1/local-commerce/media/" + name });
        }).DisableAntiforgery();
        group.MapGet("/media/{name}", (string name, LocalCommerceStore store) =>
        {
            if (!Regex.IsMatch(name, @"^[a-f0-9]{32}\.(png|jpg|webp|mp4|webm)$")) return Results.NotFound();
            var file = Path.Combine(store.MediaDirectory, name);
            if (!File.Exists(file)) return Results.NotFound();
            var type = Path.GetExtension(name) switch { ".png" => "image/png", ".jpg" => "image/jpeg", ".webp" => "image/webp", ".mp4" => "video/mp4", _ => "video/webm" };
            return Results.File(file, type, enableRangeProcessing: true);
        });
    }
}
