using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Designs;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Architecture.Tests;

/// <summary>
/// SIP-TAS-02: an order line keeps its own pattern, masked product photo and composition, bound by checksum to the ordered
/// placement revision. Isolated temp folder, file store and synthetic catalogue only; no real account, order or SQL is used.
/// </summary>
public sealed class OrderDesignSnapshotTests : IDisposable
{
    private static readonly byte[] Pattern = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");
    // Distinct bytes for the product photo and mask, so a test can tell every file apart (PNG detection only reads the header).
    private static readonly byte[] Photo = [.. Pattern, 1, 1], NewPhoto = [.. Pattern, 2, 2], Mask = [.. Pattern, 3], NewMask = [.. Pattern, 4];
    private static readonly byte[] Composition = [255, 216, 255, 217], NewComposition = [255, 216, 255, 0, 217];
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-order-snapshot-test-" + Guid.NewGuid());
    private readonly RecordingFileStore recorder;

    public OrderDesignSnapshotTests() => recorder = new(new LocalFileStore(directory));

    private WebApplicationFactory<Program> Factory() => new IsolatedApiFactory(directory).WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Notifications:WorkerEnabled", "false");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            { ["LocalCommerce:DataDirectory"] = directory, ["ProductSurfaces:PublishedRoot"] = Path.Combine(directory, "published") }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IFileStore>(); services.AddSingleton<IFileStore>(recorder);
            services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(new PreviewSender());
        });
    });

    /// <summary>Tracks the order copies that exist and can fail one save, to prove a half-copied order leaves nothing behind.</summary>
    private sealed class RecordingFileStore(IFileStore inner) : IFileStore
    {
        public readonly HashSet<string> OrderKeys = [];
        public string? FailSuffix;
        public async Task Save(string area, string key, Stream content, string contentType, CancellationToken cancellationToken = default)
        {
            if (FailSuffix is not null && key.StartsWith("order-", StringComparison.Ordinal) && key.EndsWith(FailSuffix, StringComparison.Ordinal))
                throw new IOException("Synthetic storage failure");
            await inner.Save(area, key, content, contentType, cancellationToken);
            if (key.StartsWith("order-", StringComparison.Ordinal)) lock (OrderKeys) OrderKeys.Add(key);
        }
        public Task<StoredFile?> Open(string area, string key, CancellationToken cancellationToken = default) => inner.Open(area, key, cancellationToken);
        public async Task Delete(string area, string key, CancellationToken cancellationToken = default)
        {
            await inner.Delete(area, key, cancellationToken);
            lock (OrderKeys) OrderKeys.Remove(key);
        }
    }

    private sealed class PreviewSender : IVerificationEmailSender
    {
        public bool IsConfigured => true;
        public bool IsPreview => true;
        public Task Send(string email, string code, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private static string Sha(byte[] bytes) => Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, HttpContent? content = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = content };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    private static async Task<T> Read<T>(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task<string?> Code(HttpResponseMessage response)
    {
        using var body = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    private static async Task<byte[]> Bytes(StoredFile? file)
    {
        Assert.NotNull(file);
        await using (file) { using var buffer = new MemoryStream(); await file.Content.CopyToAsync(buffer); return buffer.ToArray(); }
    }

    /// <summary>Publishes a synthetic approved surface bundle for the variant, the way the storefront editor sees it.</summary>
    private async Task<string> Publish(string productId, string variantId, string sourceImage, byte[] photo, byte[] mask)
    {
        var root = Path.Combine(directory, "published", productId, variantId);
        var media = Guid.NewGuid().ToString("D");
        Directory.CreateDirectory(Path.Combine(root, media));
        await File.WriteAllBytesAsync(Path.Combine(root, media, "source.webp"), photo);
        await File.WriteAllBytesAsync(Path.Combine(root, media, "mask.png"), mask);
        var prefix = $"/assets/product-previews/{productId}/{variantId}/{media}/";
        await File.WriteAllTextAsync(Path.Combine(root, "inputs.json"), System.Text.Json.JsonSerializer.Serialize(new
        {
            productReference = productId, variantReference = variantId, sourceImage,
            inputs = new { width = 100, height = 100, surfaceVersion = Sha(mask),
                source = new { url = prefix + "source.webp?v=" + Sha(photo), sha256 = Sha(photo) },
                mask = new { url = prefix + "mask.png?v=" + Sha(mask), sha256 = Sha(mask) }, branding = (object?)null }
        }));
        return Sha(mask);
    }

    private sealed record Fixture(WebApplicationFactory<Program> Factory, HttpClient Client, HttpClient Staff, string Token, MyDesign Design,
        string ProductId, string VariantId, string SourceImage, CustomerAddress Address) : IDisposable
    {
        public void Dispose() { Staff.Dispose(); Client.Dispose(); Factory.Dispose(); }
    }

    private async Task<Fixture> Start(string email)
    {
        var factory = Factory(); var client = factory.CreateClient(); var staff = await TestStaff.Client(factory);
        var challenge = await Read<AccountEmailVerification>(await client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification(email)));
        var token = (await Read<AuthSession>(await client.PostAsJsonAsync("/api/v1/auth/register",
            new RegisterAccount("Test Kullanıcı", email, "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!)))).AccessToken;
        using var upload = new MultipartFormDataContent { { new ByteArrayContent(Pattern), "file", "desen.png" }, { new StringContent("DEMO-P101"), "productId" }, { new StringContent("DEMO-V101-B"), "variantId" } };
        var design = await Read<MyDesign>(await Send(client, HttpMethod.Post, "/api/v1/me/designs/upload", token, upload));
        var state = (await staff.GetFromJsonAsync<Xinobi.Api.LocalCommerce.CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.First(p => p.Id == design.ProductId);
        (await staff.PutAsJsonAsync("/api/v1/local-commerce/products/" + product.Id, product with { Personalizable = true })).EnsureSuccessStatusCode();
        var address = await Read<CustomerAddress>(await Send(client, HttpMethod.Post, "/api/v1/me/addresses", token,
            JsonContent.Create(new SaveCustomerAddress("Ev", "Test Kullanıcı", "05321234567", "İstanbul", "Kadıköy", "Test sokak no 12", "34710", true))));
        return new(factory, client, staff, token, design, product.Id, design.VariantId!, product.Variants.First(v => v.Id == design.VariantId).Image!, address);
    }

    private async Task<MyDesignConfiguration> Configure(Fixture f, DesignPlacement placement, string? id = null, int? revision = null, byte[]? preview = null)
    {
        var saved = await Read<MyDesignConfiguration>(await Send(f.Client, HttpMethod.Post, $"/api/v1/me/designs/{f.Design.Id}/configurations", f.Token,
            JsonContent.Create(new SaveDesignConfiguration(f.VariantId, placement, id, revision))));
        using var upload = new MultipartFormDataContent { { new ByteArrayContent(preview ?? Composition), "file", "preview.jpg" } };
        (await Send(f.Client, HttpMethod.Put, $"/api/v1/me/design-configurations/{saved.Id}/revisions/{saved.Revision}/preview", f.Token, upload)).EnsureSuccessStatusCode();
        return saved;
    }

    private static PlaceOrder Order(Fixture f, string request, MyDesignConfiguration? configuration) =>
        new(f.Address.Id, [new(f.ProductId, f.VariantId, 1, f.Design.Id, configuration?.Id, configuration?.Revision)], request);

    [Fact]
    public async Task OrderKeepsVerifiedCopiesWhenDesignCatalogueAndMaskChangeLater()
    {
        using var f = await Start("snapshot@example.com");
        var surface = await Publish(f.ProductId, f.VariantId, f.SourceImage, Photo, Mask);
        var placement = new DesignPlacement(100, 100, surface, 25, 35, 1.2, 15, .4, Mode: "artwork");
        var first = await Configure(f, placement);
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "snapshot-1", first))));
        var line = order.Lines[0].Personalization!;
        // Order, line index, product/variant/SKU, design, revision, placement schema and the three file references in one record.
        Assert.Equal((f.ProductId, f.VariantId, f.Design.Id, first.Id, 1, 1), (order.Lines[0].ProductId, order.Lines[0].VariantId, line.DesignId, line.ConfigurationId, line.ConfigurationRevision, line.SchemaVersion));
        Assert.False(string.IsNullOrEmpty(line.Sku));
        Assert.Equal(new OrderDesignFile(Sha(Pattern), "image/png", Pattern.Length), line.Files!.Pattern);
        Assert.Equal(line.SourceSha256, line.Files.Pattern.Sha256);
        Assert.Equal(new OrderDesignFile(Sha(Photo), "image/png", Photo.Length), line.Files.ProductSource);
        Assert.Equal(new OrderDesignFile(Sha(Composition), "image/jpeg", Composition.Length), line.Files.Composition);
        var designs = f.Factory.Services.GetRequiredService<SavedDesignStore>();
        Assert.Equal(Photo, await Bytes(await designs.OrderSourceImage(order.Id, 0, line.Files.ProductSource!)));

        // The customer edits: rename, a new placement revision with a new composition, then deletes the design.
        (await Send(f.Client, HttpMethod.Patch, $"/api/v1/me/designs/{f.Design.Id}", f.Token, JsonContent.Create(new RenameDesign("Yeni ad")))).EnsureSuccessStatusCode();
        await Configure(f, placement with { X = 70 }, first.Id, 1, NewComposition);
        // The catalogue photo and mask are replaced: a new published bundle with other bytes.
        var newSurface = await Publish(f.ProductId, f.VariantId, f.SourceImage, NewPhoto, NewMask);
        Assert.NotEqual(surface, newSurface);
        (await Send(f.Client, HttpMethod.Delete, $"/api/v1/me/designs/{f.Design.Id}", f.Token)).EnsureSuccessStatusCode();

        var kept = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}", f.Token));
        var keptLine = kept.Lines[0].Personalization!;
        Assert.Equal((line.Name, line.Placement, line.ConfigurationRevision, line.Files), (keptLine.Name, keptLine.Placement, keptLine.ConfigurationRevision, keptLine.Files));
        Assert.Equal(Pattern, await (await Send(f.Client, HttpMethod.Get, keptLine.ImageUrl!, f.Token)).Content.ReadAsByteArrayAsync());
        Assert.Equal(Composition, await (await Send(f.Client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}/lines/0/preview", f.Token)).Content.ReadAsByteArrayAsync());
        Assert.Equal(Photo, await Bytes(await designs.OrderSourceImage(order.Id, 0, keptLine.Files!.ProductSource!)));
        var panel = await f.Staff.GetAsync($"/api/v1/local-commerce/orders/{order.Id}/lines/0/design");
        Assert.Equal(Pattern, await panel.Content.ReadAsByteArrayAsync());
    }

    [Fact]
    public async Task ChangedOrderCopiesAreReportedNotServed()
    {
        using var f = await Start("tamper@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, Photo, Mask), 25, 35, 1, 0, 0);
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "tamper-1", await Configure(f, placement)))));
        var files = f.Factory.Services.GetRequiredService<IFileStore>();
        var designs = f.Factory.Services.GetRequiredService<SavedDesignStore>();
        var references = order.Lines[0].Personalization!.Files!;
        // Same length, other bytes: only the recorded checksum can tell.
        await files.Save(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0), new MemoryStream([.. Pattern[..^1], 0]), "image/png");
        await files.Save(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0) + "-preview", new MemoryStream([255, 216, 255, 218]), "image/jpeg");
        await files.Save(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0) + "-source", new MemoryStream(NewPhoto), "image/png");
        var customer = await Send(f.Client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}/lines/0/design", f.Token);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, customer.StatusCode);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync($"/api/v1/local-commerce/orders/{order.Id}/lines/0/design?download=true")).StatusCode);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await Send(f.Client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}/lines/0/preview", f.Token)).StatusCode);
        Assert.Equal(503, (await Assert.ThrowsAsync<ProblemException>(() => designs.OrderSourceImage(order.Id, 0, references.ProductSource!))).Status);
    }

    [Fact]
    public async Task RetriesFailuresAndOlderRevisionsNeverLeaveHalfOrWrongCopies()
    {
        using var f = await Start("retry@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, Photo, Mask), 25, 35, 1, 0, 0);
        var first = await Configure(f, placement);
        var second = await Configure(f, placement with { X = 80 }, first.Id, 1, NewComposition);

        // A storage failure on the last copy of the line: no order, and none of the line's copies remain.
        recorder.FailSuffix = "-preview";
        var failed = await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "retry-request-1", first)));
        Assert.False(failed.IsSuccessStatusCode);
        Assert.Empty(recorder.OrderKeys);
        Assert.Empty(await Read<CustomerOrder[]>(await Send(f.Client, HttpMethod.Get, "/api/v1/me/orders", f.Token)));
        recorder.FailSuffix = null;

        // The older revision is ordered as asked: its own placement and composition, not the latest one.
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "retry-request-1", first))));
        var line = order.Lines[0].Personalization!;
        Assert.Equal((1, 25d, Sha(Composition)), (line.ConfigurationRevision, line.Placement!.X, line.Files!.Composition!.Sha256));
        Assert.Equal(3, recorder.OrderKeys.Count);

        // Same request again returns the stored order; the retry's own copies are removed and nothing is rebound.
        var again = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "retry-request-1", first))));
        Assert.Equal((order.Id, line.Files), (again.Id, again.Lines[0].Personalization!.Files));
        Assert.Equal(3, recorder.OrderKeys.Count);
        Assert.Equal("idempotency_conflict", await Code(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "retry-request-1", second)))));
        Assert.Equal(3, recorder.OrderKeys.Count);

        // A changed surface refuses the stale placement before anything is copied.
        await Publish(f.ProductId, f.VariantId, f.SourceImage, NewPhoto, NewMask);
        Assert.Equal("surface_changed", await Code(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "retry-request-2", second)))));
        Assert.Equal(3, recorder.OrderKeys.Count);
    }

    [Fact]
    public async Task OrderWithoutPlacementRecordsOnlyThePatternAndDesignFileMustMatchTheRevision()
    {
        using var f = await Start("legacy@example.com");
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "legacy-1", null))));
        var files = order.Lines[0].Personalization!.Files!;
        // No placement means no masked photo or composition; nothing is filled in from the live catalogue.
        Assert.Equal((Sha(Pattern), (OrderDesignFile?)null, (OrderDesignFile?)null), (files.Pattern.Sha256, files.ProductSource, files.Composition));
        Assert.Single(recorder.OrderKeys);

        var designs = f.Factory.Services.GetRequiredService<SavedDesignStore>();
        var accountDesign = (await f.Factory.Services.GetRequiredService<IAccountStore>().FindByAccessToken(f.Token))!;
        var saved = (await designs.Find(accountDesign.Id, f.Design.Id))!;
        var mismatch = await Assert.ThrowsAsync<ProblemException>(() => designs.CopyToOrder(saved, "synthetic-order", 0, new string('0', 64)));
        Assert.Equal("design_changed", mismatch.Code);
        Assert.Null(await f.Factory.Services.GetRequiredService<IFileStore>().Open(FileAreas.Designs, SavedDesignStore.OrderFile("synthetic-order", 0)));
    }

    private sealed class WithoutOrdersRead : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            foreach (var identity in principal.Identities)
                foreach (var claim in identity.FindAll(PermissionAuthorization.PermissionClaim).Where(c => c.Value == "orders.read").ToArray()) identity.RemoveClaim(claim);
            return Task.FromResult(principal);
        }
    }

    private static string PatternRoute(string orderId, int line) => $"/api/v1/admin/orders/{orderId}/lines/{line}/pattern";

    [Fact]
    public async Task StaffDownloadsTheOrderedPatternBytesWithItsRealTypeAndName()
    {
        using var f = await Start("pattern@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, Photo, Mask), 25, 35, 1, 0, 0);
        var first = await Configure(f, placement);
        await Configure(f, placement with { X = 90 }, first.Id, 1, NewComposition);
        // Revision 1 is ordered while revision 2 exists; a second, plain line has no design.
        var request = new PlaceOrder(f.Address.Id, [new(f.ProductId, f.VariantId, 1, f.Design.Id, first.Id, 1), new(f.ProductId, f.VariantId, 1)], "pattern-request-1");
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(request)));
        (await Send(f.Client, HttpMethod.Delete, $"/api/v1/me/designs/{f.Design.Id}", f.Token)).EnsureSuccessStatusCode();

        using var download = await f.Staff.GetAsync(PatternRoute(order.Id, 0));
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        var bytes = await download.Content.ReadAsByteArrayAsync();
        Assert.Equal(Pattern, bytes);
        Assert.Equal(order.Lines[0].Personalization!.Files!.Pattern.Sha256, Sha(bytes));
        Assert.Equal("image/png", download.Content.Headers.ContentType?.MediaType);
        Assert.Equal("attachment", download.Content.Headers.ContentDisposition?.DispositionType);
        var number = System.Text.RegularExpressions.Regex.Replace(order.Number, "[^A-Za-z0-9-]+", "-").Trim('-');
        Assert.Equal($"xinobi-{number}-satir-1-desen-rev1.png", download.Content.Headers.ContentDisposition?.FileNameStar ?? download.Content.Headers.ContentDisposition?.FileName?.Trim('"'));
        Assert.Equal("nosniff", download.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Contains("no-store", download.Headers.CacheControl?.ToString());
        // The Development panel runs on another origin; it must be allowed to read the server-given file name.
        using var crossOrigin = new HttpRequestMessage(HttpMethod.Get, PatternRoute(order.Id, 0));
        crossOrigin.Headers.Add("Origin", "http://127.0.0.1:5173");
        using var panelDownload = await f.Staff.SendAsync(crossOrigin);
        Assert.Contains("Content-Disposition", panelDownload.Headers.GetValues("Access-Control-Expose-Headers").Single(), StringComparison.OrdinalIgnoreCase);

        Assert.Equal("order_line_design_not_found", await Code(await f.Staff.GetAsync(PatternRoute(order.Id, 1))));
        Assert.Equal("order_line_design_not_found", await Code(await f.Staff.GetAsync(PatternRoute(order.Id, 9))));
        Assert.Equal("order_not_found", await Code(await f.Staff.GetAsync(PatternRoute("missing-order", 0))));

        // A missing copy is reported as missing, a changed copy as unavailable; neither falls back to another file.
        var files = f.Factory.Services.GetRequiredService<IFileStore>();
        await files.Save(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0), new MemoryStream([.. Pattern[..^1], 0]), "image/png");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(PatternRoute(order.Id, 0))).StatusCode);
        await files.Delete(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0));
        Assert.Equal("order_pattern_not_found", await Code(await f.Staff.GetAsync(PatternRoute(order.Id, 0))));
    }

    [Fact]
    public async Task PatternDownloadNeedsStaffWithOrdersReadAndAnOlderOrderHasNoRevisionInItsName()
    {
        using var f = await Start("pattern-access@example.com");
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "pattern-legacy-1", null))));
        var route = PatternRoute(order.Id, 0);
        Assert.Equal(HttpStatusCode.Unauthorized, (await f.Client.GetAsync(route)).StatusCode);
        // The owner, or any other customer, is not staff.
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(f.Client, HttpMethod.Get, route, f.Token)).StatusCode);
        using var restricted = f.Factory.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddTransient<IClaimsTransformation, WithoutOrdersRead>()));
        using var noRead = await TestStaff.Client(restricted);
        Assert.Equal(HttpStatusCode.Forbidden, (await noRead.GetAsync(route)).StatusCode);

        using var download = await f.Staff.GetAsync(route);
        Assert.Equal(Pattern, await download.Content.ReadAsByteArrayAsync());
        Assert.EndsWith("-satir-1-desen.png", download.Content.Headers.ContentDisposition?.FileNameStar ?? download.Content.Headers.ContentDisposition?.FileName?.Trim('"'));
    }

    [Fact]
    public async Task ACopyWhoseBytesDisagreeWithTheRecordedTypeIsNotServed()
    {
        using var f = await Start("pattern-type@example.com");
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "pattern-type-1", null))));
        // An older order without file references: a JPEG under a PNG record is refused rather than renamed or served.
        await f.Factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0), new MemoryStream([255, 216, 255, 217]), "image/jpeg");
        var accounts = f.Factory.Services.GetRequiredService<IAccountStore>();
        var account = (await accounts.FindByAccessToken(f.Token))!;
        await accounts.ChangeOrder(account.Id, order.Id, stored => stored with { Lines = [stored.Lines[0] with { Personalization = stored.Lines[0].Personalization! with { Files = null } }] });
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(PatternRoute(order.Id, 0))).StatusCode);
    }

    /// <summary>A real encoded photo of the editor canvas size; the colour tells two catalogue photos apart.</summary>
    private static byte[] CanvasPhoto(SkiaSharp.SKColor colour, int width = 100, int height = 100)
    {
        using var bitmap = new SkiaSharp.SKBitmap(width, height);
        bitmap.Erase(colour);
        using var image = SkiaSharp.SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SkiaSharp.SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }

    private static string SourceRoute(string orderId, int line) => $"/api/v1/admin/orders/{orderId}/lines/{line}/source";

    private static string? FileName(HttpResponseMessage response) =>
        response.Content.Headers.ContentDisposition?.FileNameStar ?? response.Content.Headers.ContentDisposition?.FileName?.Trim('"');

    [Fact]
    public async Task SourceDownloadIsTheOrderedPhotoAfterCatalogueColourAndMaskChange()
    {
        using var f = await Start("source@example.com");
        byte[] red = CanvasPhoto(SkiaSharp.SKColors.Red), blue = CanvasPhoto(SkiaSharp.SKColors.Blue);
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, red, Mask), 25, 35, 1, 0, 0);
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "source-request-1", await Configure(f, placement)))));
        var line = order.Lines[0].Personalization!;
        Assert.Equal(Sha(red), line.Files!.ProductSource!.Sha256);

        // Later: a new photo and mask are published, the variant's catalogue image changes and the design is deleted.
        await Publish(f.ProductId, f.VariantId, f.SourceImage, blue, NewMask);
        var state = (await f.Staff.GetFromJsonAsync<Xinobi.Api.LocalCommerce.CommerceState>("/api/v1/local-commerce/state"))!;
        var product = state.Products.First(p => p.Id == f.ProductId);
        (await f.Staff.PutAsJsonAsync("/api/v1/local-commerce/products/" + product.Id, product with
            { Variants = [.. product.Variants.Select(v => v.Id == f.VariantId ? v with { Image = "/assets/changed-colour.webp" } : v)] })).EnsureSuccessStatusCode();
        (await Send(f.Client, HttpMethod.Delete, $"/api/v1/me/designs/{f.Design.Id}", f.Token)).EnsureSuccessStatusCode();

        using var download = await f.Staff.GetAsync(SourceRoute(order.Id, 0));
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        var bytes = await download.Content.ReadAsByteArrayAsync();
        Assert.Equal(red, bytes);
        Assert.NotEqual(blue, bytes); Assert.NotEqual(Pattern, bytes);
        Assert.Equal(line.Files.ProductSource.Sha256, Sha(bytes));
        Assert.Equal("image/png", download.Content.Headers.ContentType?.MediaType);
        Assert.Equal("attachment", download.Content.Headers.ContentDisposition?.DispositionType);
        var number = System.Text.RegularExpressions.Regex.Replace(order.Number, "[^A-Za-z0-9-]+", "-").Trim('-');
        var sku = System.Text.RegularExpressions.Regex.Replace(line.Sku!, "[^A-Za-z0-9-]+", "-").Trim('-');
        Assert.Equal($"xinobi-{number}-satir-1-urun-kaynak-{sku}.png", FileName(download));
        Assert.Equal("nosniff", download.Headers.GetValues("X-Content-Type-Options").Single());

        // Only the order and line choose the file: extra query values, odd ids and lines never open anything else.
        using var withUrl = await f.Staff.GetAsync(SourceRoute(order.Id, 0) + "?url=https%3A%2F%2Fexample.invalid%2Fx.png&path=..%2F..%2Fappsettings.json&key=" + SavedDesignStore.OrderFile(order.Id, 0));
        Assert.Equal(red, await withUrl.Content.ReadAsByteArrayAsync());
        foreach (var route in new[] { SourceRoute("..%2F..%2Fdesigns", 0), SourceRoute("%2E%2E", 0), SourceRoute(SavedDesignStore.OrderFile(order.Id, 0), 0), SourceRoute("https%3A%2F%2Fexample.invalid", 0) })
        {
            using var response = await f.Staff.GetAsync(route);
            Assert.True(response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest, route + " -> " + response.StatusCode);
            Assert.NotEqual(red, await response.Content.ReadAsByteArrayAsync());
        }
        Assert.Equal(HttpStatusCode.NotFound, (await f.Staff.GetAsync($"/api/v1/admin/orders/{order.Id}/lines/-1/source")).StatusCode);
    }

    [Fact]
    public async Task MissingChangedOrMismatchedSourceCopiesAreExplainedNotReplaced()
    {
        using var f = await Start("source-states@example.com");
        var photo = CanvasPhoto(SkiaSharp.SKColors.Green);
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, photo, Mask), 25, 35, 1, 0, 0);
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "source-states-1", await Configure(f, placement)))));
        var legacy = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "source-states-2", null))));
        var accounts = f.Factory.Services.GetRequiredService<IAccountStore>();
        var account = (await accounts.FindByAccessToken(f.Token))!;
        var files = f.Factory.Services.GetRequiredService<IFileStore>();

        // No placement, so nothing was masked: the reason is given.
        using (var none = await f.Staff.GetAsync(SourceRoute(legacy.Id, 0)))
        {
            Assert.Equal("order_source_not_recorded", await Code(none));
        }
        // The canvas the placement was saved on must match the photo's size.
        await accounts.ChangeOrder(account.Id, order.Id, stored => stored with { Lines = [stored.Lines[0] with { Personalization = stored.Lines[0].Personalization! with { Placement = placement with { SourceWidth = 200 } } }] });
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(SourceRoute(order.Id, 0))).StatusCode);
        await accounts.ChangeOrder(account.Id, order.Id, stored => stored with { Lines = [stored.Lines[0] with { Personalization = stored.Lines[0].Personalization! with { Placement = placement } }] });
        Assert.Equal(photo, await (await f.Staff.GetAsync(SourceRoute(order.Id, 0))).Content.ReadAsByteArrayAsync());
        // A changed copy is unavailable; a removed copy is missing; neither falls back to the catalogue.
        await files.Save(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0) + "-source", new MemoryStream(CanvasPhoto(SkiaSharp.SKColors.Black)), "image/png");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(SourceRoute(order.Id, 0))).StatusCode);
        await files.Delete(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0) + "-source");
        Assert.Equal("order_source_not_found", await Code(await f.Staff.GetAsync(SourceRoute(order.Id, 0))));
        // An order placed before copies were kept (no reference) is explained, with the placement still present.
        await accounts.ChangeOrder(account.Id, order.Id, stored => stored with { Lines = [stored.Lines[0] with { Personalization = stored.Lines[0].Personalization! with { Files = stored.Lines[0].Personalization!.Files! with { ProductSource = null } } }] });
        using var older = await f.Staff.GetAsync(SourceRoute(order.Id, 0));
        Assert.Equal("order_source_not_recorded", await Code(older));

        // Access: anonymous 401, the customer 403, staff without orders.read 403.
        Assert.Equal(HttpStatusCode.Unauthorized, (await f.Client.GetAsync(SourceRoute(order.Id, 0))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(f.Client, HttpMethod.Get, SourceRoute(order.Id, 0), f.Token)).StatusCode);
        using var restricted = f.Factory.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddTransient<IClaimsTransformation, WithoutOrdersRead>()));
        using var noRead = await TestStaff.Client(restricted);
        Assert.Equal(HttpStatusCode.Forbidden, (await noRead.GetAsync(SourceRoute(order.Id, 0))).StatusCode);
    }

    [Fact]
    public void FileReferencesSurviveTheSqlOrderLineJsonColumn()
    {
        // SqlAccountStore keeps a line's personalization as JSON with web defaults; this is the same round trip (not a SQL acceptance).
        var json = new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web);
        var value = new OrderPersonalization("design", "upload", "Desen", "image/png", Files: new(new(Sha(Pattern), "image/png", Pattern.Length), null, new(Sha(Composition), "image/jpeg", 4)));
        var text = System.Text.Json.JsonSerializer.Serialize(value, json);
        Assert.Contains("\"productSource\":null", text);
        Assert.Equal(value.Files, System.Text.Json.JsonSerializer.Deserialize<OrderPersonalization>(text, json)!.Files);
        Assert.Null(System.Text.Json.JsonSerializer.Deserialize<OrderPersonalization>("{\"designId\":\"d\",\"kind\":\"upload\",\"name\":\"n\",\"mime\":\"image/png\"}", json)!.Files);
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
