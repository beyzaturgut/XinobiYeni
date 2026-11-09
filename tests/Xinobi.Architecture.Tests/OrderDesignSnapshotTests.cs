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
using Xinobi.Api.Orders;

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
    private static readonly byte[] Composition = SingleSourceOrderFilesTests.Jpeg(), NewComposition = SingleSourceOrderFilesTests.Jpeg(true);
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-order-snapshot-test-" + Guid.NewGuid());
    private readonly RecordingFileStore recorder;
    private readonly MovableClock clock = new();

    /// <summary>Real time plus an offset, so a test can let access tokens expire.</summary>
    private sealed class MovableClock : TimeProvider
    {
        public TimeSpan Offset;
        public override DateTimeOffset GetUtcNow() => base.GetUtcNow() + Offset;
    }

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
            services.RemoveAll<TimeProvider>(); services.AddSingleton<TimeProvider>(clock);
            services.RemoveAll<IVerificationEmailSender>(); services.AddSingleton<IVerificationEmailSender>(new PreviewSender());
        });
    });

    /// <summary>Tracks the order copies that exist and can fail one save, to prove a half-copied order leaves nothing behind.</summary>
    private sealed class RecordingFileStore(IFileStore inner) : IFileStore
    {
        public readonly HashSet<string> OrderKeys = [];
        public string? FailSuffix;
        public bool FailOrderReads;
        public async Task Save(string area, string key, Stream content, string contentType, CancellationToken cancellationToken = default)
        {
            if (FailSuffix is not null && key.StartsWith("order-", StringComparison.Ordinal) && key.EndsWith(FailSuffix, StringComparison.Ordinal))
                throw new IOException("Synthetic storage failure");
            await inner.Save(area, key, content, contentType, cancellationToken);
            if (key.StartsWith("order-", StringComparison.Ordinal)) lock (OrderKeys) OrderKeys.Add(key);
        }
        public Task<StoredFile?> Open(string area, string key, CancellationToken cancellationToken = default) =>
            FailOrderReads && key.StartsWith("order-", StringComparison.Ordinal) ? throw ProblemException.Unavailable("Dosya deposu") : inner.Open(area, key, cancellationToken);
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

    private async Task<MyDesignConfiguration> Configure(Fixture f, DesignPlacement placement, string? id = null, int? revision = null, byte[]? preview = null, bool withPreview = true)
    {
        var saved = await Read<MyDesignConfiguration>(await Send(f.Client, HttpMethod.Post, $"/api/v1/me/designs/{f.Design.Id}/configurations", f.Token,
            JsonContent.Create(new SaveDesignConfiguration(f.VariantId, placement, id, revision))));
        if (!withPreview) return saved;
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

    private static string CompositionRoute(string orderId, int line) => $"/api/v1/admin/orders/{orderId}/lines/{line}/composition";

    [Fact]
    public async Task CompositionIsTheOrderedRevisionAfterPatternDeletionAndLaterEdits()
    {
        using var f = await Start("composition@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, CanvasPhoto(SkiaSharp.SKColors.Red), Mask), 25, 35, 1, 0, 0);
        var first = await Configure(f, placement);
        await Configure(f, placement with { X = 60 }, first.Id, 1, NewComposition);
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "composition-request-1", first))));
        var line = order.Lines[0].Personalization!;
        Assert.Equal((1, Sha(Composition)), (line.ConfigurationRevision, line.Files!.Composition!.Sha256));

        // After the order: revision 1's editable thumbnail is replaced and the design (pattern) is deleted.
        using (var replace = new MultipartFormDataContent { { new ByteArrayContent(NewComposition), "file", "preview.jpg" } })
            (await Send(f.Client, HttpMethod.Put, $"/api/v1/me/design-configurations/{first.Id}/revisions/1/preview", f.Token, replace)).EnsureSuccessStatusCode();
        (await Send(f.Client, HttpMethod.Delete, $"/api/v1/me/designs/{f.Design.Id}", f.Token)).EnsureSuccessStatusCode();

        var number = System.Text.RegularExpressions.Regex.Replace(order.Number, "[^A-Za-z0-9-]+", "-").Trim('-');
        for (var attempt = 0; attempt < 2; attempt++)
        {
            using var download = await f.Staff.GetAsync(CompositionRoute(order.Id, 0));
            Assert.Equal(HttpStatusCode.OK, download.StatusCode);
            var bytes = await download.Content.ReadAsByteArrayAsync();
            Assert.Equal(Composition, bytes);
            Assert.NotEqual(Pattern, bytes);
            Assert.Equal(line.Files.Composition.Sha256, Sha(bytes));
            Assert.Equal("image/jpeg", download.Content.Headers.ContentType?.MediaType);
            Assert.Equal("attachment", download.Content.Headers.ContentDisposition?.DispositionType);
            Assert.Equal($"xinobi-{number}-satir-1-giydirilmis-onizleme-rev1.jpg", FileName(download));
            Assert.Equal("nosniff", download.Headers.GetValues("X-Content-Type-Options").Single());
        }
        // The customer's order preview is the same file.
        Assert.Equal(Composition, await (await Send(f.Client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}/lines/0/preview", f.Token)).Content.ReadAsByteArrayAsync());
    }

    [Fact]
    public async Task MissingOrChangedCompositionsAreExplainedAndNeverReplacedByThePattern()
    {
        using var f = await Start("composition-states@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, CanvasPhoto(SkiaSharp.SKColors.Green), Mask), 25, 35, 1, 0, 0);
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "composition-states-1", await Configure(f, placement)))));
        var noPreview = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token,
            JsonContent.Create(Order(f, "composition-states-2", await Configure(f, placement with { X = 40 }, withPreview: false)))));
        var legacy = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "composition-states-3", null))));
        Assert.Null(noPreview.Lines[0].Personalization!.Files!.Composition);

        async Task<string> Reason(string id) { using var response = await f.Staff.GetAsync(CompositionRoute(id, 0)); Assert.Equal("order_composition_not_recorded", await Code(response)); return await response.Content.ReadAsStringAsync(); }
        Assert.Contains("yerleşim olmadığı", await Reason(legacy.Id));
        Assert.Contains("yüklenmemişti", await Reason(noPreview.Id));
        var accounts = f.Factory.Services.GetRequiredService<IAccountStore>();
        var account = (await accounts.FindByAccessToken(f.Token))!;
        var files = f.Factory.Services.GetRequiredService<IFileStore>();
        var key = SavedDesignStore.OrderFile(order.Id, 0) + "-preview";

        await files.Save(FileAreas.Designs, key, new MemoryStream([255, 216, 255, 0, 217]), "image/jpeg");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(CompositionRoute(order.Id, 0))).StatusCode);
        // The raw pattern under the composition's name is refused as well.
        await files.Save(FileAreas.Designs, key, new MemoryStream(Pattern), "image/jpeg");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(CompositionRoute(order.Id, 0))).StatusCode);
        await files.Delete(FileAreas.Designs, key);
        Assert.Equal("order_composition_not_found", await Code(await f.Staff.GetAsync(CompositionRoute(order.Id, 0))));
        await accounts.ChangeOrder(account.Id, order.Id, stored => stored with { Lines = [stored.Lines[0] with { Personalization = stored.Lines[0].Personalization! with { Files = null } }] });
        Assert.Contains("saklanmadan önce", await Reason(order.Id));

        Assert.Equal(HttpStatusCode.Unauthorized, (await f.Client.GetAsync(CompositionRoute(noPreview.Id, 0))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(f.Client, HttpMethod.Get, CompositionRoute(noPreview.Id, 0), f.Token)).StatusCode);
        using var restricted = f.Factory.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddTransient<IClaimsTransformation, WithoutOrdersRead>()));
        using var noRead = await TestStaff.Client(restricted);
        Assert.Equal(HttpStatusCode.Forbidden, (await noRead.GetAsync(CompositionRoute(noPreview.Id, 0))).StatusCode);
    }

    private static async Task<HttpClient> StaffClient(WebApplicationFactory<Program> factory, bool mfa)
    {
        var accounts = factory.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Synthetic staff", $"staff-{Guid.NewGuid():N}@example.invalid", "synthetic-test-password");
        await accounts.AssignRole(account.Email, Roles.Admin);
        var tokens = await accounts.IssueTokens(account.Id);
        if (mfa) await factory.Services.GetRequiredService<AdminMfa>().Grant(account.Id, tokens);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        return client;
    }

    [Fact]
    public async Task EveryOrderDesignFileIsGuardedOnTheServerForEachCallerAndOrderLine()
    {
        using var f = await Start("access-owner@example.com");
        var photo = CanvasPhoto(SkiaSharp.SKColors.Purple);
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, photo, Mask), 25, 35, 1, 0, 0);
        var configuration = await Configure(f, placement);
        var request = new PlaceOrder(f.Address.Id, [new(f.ProductId, f.VariantId, 1, f.Design.Id, configuration.Id, configuration.Revision), new(f.ProductId, f.VariantId, 1)], "access-request-1");
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(request)));
        // A second order of the same shopper with another composition: ids decide which copy is returned, never a client path.
        var other = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token,
            JsonContent.Create(Order(f, "access-request-2", await Configure(f, placement with { X = 70 }, configuration.Id, 1, NewComposition)))));
        var expected = new Dictionary<string, byte[]> { ["pattern"] = Pattern, ["source"] = photo, ["composition"] = Composition };
        string Route(string id, string kind, int line = 0) => $"/api/v1/admin/orders/{id}/lines/{line}/{kind}";

        var challenge = await Read<AccountEmailVerification>(await f.Client.PostAsJsonAsync("/api/v1/auth/email-verification", new StartAccountEmailVerification("access-other@example.com")));
        var otherCustomer = (await Read<AuthSession>(await f.Client.PostAsJsonAsync("/api/v1/auth/register",
            new RegisterAccount("Başka Müşteri", "access-other@example.com", "guclu-parola-1", challenge.VerificationId, challenge.PreviewCode!)))).AccessToken;
        using var noMfa = await StaffClient(f.Factory, mfa: false);
        using var staff = await StaffClient(f.Factory, mfa: true);
        using var restricted = f.Factory.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddTransient<IClaimsTransformation, WithoutOrdersRead>()));
        using var noRead = await TestStaff.Client(restricted);

        foreach (var (kind, bytes) in expected)
        {
            var route = Route(order.Id, kind);
            Assert.Equal(HttpStatusCode.Unauthorized, (await f.Client.GetAsync(route)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Send(f.Client, HttpMethod.Get, route, f.Token)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Send(f.Client, HttpMethod.Get, route, otherCustomer)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await noRead.GetAsync(route)).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await noMfa.GetAsync(route)).StatusCode);
            using var allowed = await staff.GetAsync(route);
            Assert.Equal(bytes, await allowed.Content.ReadAsByteArrayAsync());
            Assert.Contains("no-store", allowed.Headers.CacheControl?.ToString());
            // The other order's id returns that order's own copy; a plain line and unknown lines/orders are 404 with safe bodies.
            if (kind == "composition") Assert.Equal(NewComposition, await (await staff.GetAsync(Route(other.Id, kind))).Content.ReadAsByteArrayAsync());
            foreach (var missing in new[] { Route(order.Id, kind, 1), Route(order.Id, kind, 7), Route("unknown-order", kind) })
            {
                using var response = await staff.GetAsync(missing);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
                var body = await response.Content.ReadAsStringAsync();
                Assert.DoesNotContain("order-", body); Assert.DoesNotContain(directory, body); Assert.DoesNotContain("designs/files", body);
            }
        }
        // The customer's own routes stay owner-only.
        foreach (var kind in new[] { "design", "preview" })
        {
            var route = $"/api/v1/me/orders/{order.Id}/lines/0/{kind}";
            Assert.Equal(HttpStatusCode.OK, (await Send(f.Client, HttpMethod.Get, route, f.Token)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await Send(f.Client, HttpMethod.Get, route, otherCustomer)).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await f.Client.GetAsync(route)).StatusCode);
        }
        // The public catalogue media route never reaches order copies.
        foreach (var name in new[] { SavedDesignStore.OrderFile(order.Id, 0), SavedDesignStore.OrderFile(order.Id, 0) + "-source", order.Id + ".png" })
            Assert.Equal(HttpStatusCode.NotFound, (await f.Client.GetAsync("/api/v1/local-commerce/media/" + name)).StatusCode);

        // Storage outage: 503 with the shared problem code, never a fallback file.
        recorder.FailOrderReads = true;
        foreach (var kind in expected.Keys)
        {
            using var response = await staff.GetAsync(Route(order.Id, kind));
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
            Assert.Equal("feature_unavailable", await Code(response));
        }
        recorder.FailOrderReads = false;

        // An expired staff session is refused for every file.
        clock.Offset = AccountRules.AccessTokenLifetime + TimeSpan.FromMinutes(1);
        try { foreach (var kind in expected.Keys) Assert.Equal(HttpStatusCode.Unauthorized, (await staff.GetAsync(Route(order.Id, kind))).StatusCode); }
        finally { clock.Offset = TimeSpan.Zero; }
    }

    private static async Task<CustomerOrder> MakeLegacy(Fixture f, CustomerOrder order, bool keepComposition = true)
    {
        // An order placed before SIP-TAS-02: no file references and no product photo copy; the composition copy may exist.
        var accounts = f.Factory.Services.GetRequiredService<IAccountStore>();
        var account = (await accounts.FindByAccessToken(f.Token))!;
        var files = f.Factory.Services.GetRequiredService<IFileStore>();
        await files.Delete(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0) + "-source");
        if (!keepComposition) await files.Delete(FileAreas.Designs, SavedDesignStore.OrderFile(order.Id, 0) + "-preview");
        return (await accounts.ChangeOrder(account.Id, order.Id, stored => stored with { Lines = [stored.Lines[0] with { Personalization = stored.Lines[0].Personalization! with { Files = null } }] })).Order;
    }

    [Fact]
    public async Task OlderOrdersKeepTheirOwnCopiesReachableAndSayWhatWasNeverKept()
    {
        using var f = await Start("legacy-files@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, CanvasPhoto(SkiaSharp.SKColors.Teal), Mask), 25, 35, 1, 0, 0);
        var configuration = await Configure(f, placement);
        var withCopy = await MakeLegacy(f, await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "legacy-files-1", configuration)))));
        var without = await MakeLegacy(f, await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "legacy-files-2", configuration)))), keepComposition: false);
        var current = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "legacy-files-3", configuration))));
        string Route(string id, string kind) => $"/api/v1/admin/orders/{id}/lines/0/{kind}";

        // Each file is judged on its own: the older order's pattern and composition copies stay available, marked unverified.
        using (var pattern = await f.Staff.GetAsync(Route(withCopy.Id, "pattern")))
        {
            Assert.Equal(Pattern, await pattern.Content.ReadAsByteArrayAsync());
            Assert.Equal("unrecorded", pattern.Headers.GetValues("X-Xinobi-File-Check").Single());
        }
        using (var composition = await f.Staff.GetAsync(Route(withCopy.Id, "composition")))
        {
            Assert.Equal(Composition, await composition.Content.ReadAsByteArrayAsync());
            Assert.Equal("unrecorded", composition.Headers.GetValues("X-Xinobi-File-Check").Single());
        }
        // Never kept: explained, and no live catalogue photo or re-composition is served instead.
        using (var source = await f.Staff.GetAsync(Route(withCopy.Id, "source")))
        {
            Assert.Equal("order_source_not_recorded", await Code(source));
            Assert.Contains("saklanmadan önce", await source.Content.ReadAsStringAsync());
        }
        using (var none = await f.Staff.GetAsync(Route(without.Id, "composition")))
        {
            Assert.Equal("order_composition_not_recorded", await Code(none));
            Assert.Contains("kopya oluşmamış", await none.Content.ReadAsStringAsync());
        }
        // Current orders report a verified copy.
        foreach (var kind in new[] { "pattern", "source", "composition" })
            Assert.Equal("sha256", (await f.Staff.GetAsync(Route(current.Id, kind))).Headers.GetValues("X-Xinobi-File-Check").Single());
        // A storage outage is a 503, not "never kept".
        recorder.FailOrderReads = true;
        try { foreach (var kind in new[] { "pattern", "composition" }) Assert.Equal(HttpStatusCode.ServiceUnavailable, (await f.Staff.GetAsync(Route(withCopy.Id, kind))).StatusCode); }
        finally { recorder.FailOrderReads = false; }
    }

    [Fact]
    public async Task DryRunInventoriesOldRecordsProposesOnlyProvenBackfillsAndWritesNothing()
    {
        using var f = await Start("dry-run@example.com");
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, CanvasPhoto(SkiaSharp.SKColors.Orange), Mask), 25, 35, 1, 0, 0);
        var configuration = await Configure(f, placement);
        var full = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "dry-run-full", configuration))));
        var legacy = await MakeLegacy(f, await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "dry-run-legacy", configuration)))));
        var patternOnly = await MakeLegacy(f, await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "dry-run-pattern-only", null)))));
        var noPreview = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token,
            JsonContent.Create(Order(f, "dry-run-no-preview", await Configure(f, placement with { X = 50 }, withPreview: false)))));
        var changed = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(Order(f, "dry-run-changed", configuration))));
        var files = f.Factory.Services.GetRequiredService<IFileStore>();
        await files.Save(FileAreas.Designs, SavedDesignStore.OrderFile(changed.Id, 0), new MemoryStream([.. Pattern[..^1], 0]), "image/png");

        var accounts = f.Factory.Services.GetRequiredService<IAccountStore>();
        var ordersBefore = System.Text.Json.JsonSerializer.Serialize(await accounts.AllOrders());
        var keysBefore = recorder.OrderKeys.Order().ToArray();
        var report = await OrderDesignFilesDryRun.Plan(accounts, f.Factory.Services.GetRequiredService<SavedDesignStore>(), TimeProvider.System);
        Assert.Equal(ordersBefore, System.Text.Json.JsonSerializer.Serialize(await accounts.AllOrders()));
        Assert.Equal(keysBefore, recorder.OrderKeys.Order().ToArray());

        OrderDesignLineFinding Line(CustomerOrder order) => report.Lines.Single(item => item.OrderId == order.Id);
        Assert.Equal(("verified", "verified", "verified"), (Line(full).Pattern.Status, Line(full).ProductSource.Status, Line(full).Composition.Status));
        Assert.Equal(("provable", "record-pattern-reference"), (Line(legacy).Pattern.Status, Line(legacy).Pattern.Proposal));
        Assert.Equal(("not-kept-for-this-order", (string?)null), (Line(legacy).ProductSource.Status, Line(legacy).ProductSource.Proposal));
        Assert.Equal(("order-copy-unverified", "decide-unverified-composition"), (Line(legacy).Composition.Status, Line(legacy).Composition.Proposal));
        Assert.Equal(("unprovable-no-recorded-checksum", "no-placement", "no-placement"), (Line(patternOnly).Pattern.Status, Line(patternOnly).ProductSource.Status, Line(patternOnly).Composition.Status));
        Assert.Null(Line(patternOnly).Pattern.Proposal);
        Assert.Equal("not-uploaded-for-revision", Line(noPreview).Composition.Status);
        Assert.Equal("checksum-mismatch", Line(changed).Pattern.Status);
        Assert.Equal(1, report.Proposals["record-pattern-reference"]);
        Assert.Equal(5, report.PersonalisedLines);
        // The report carries ids and statuses only, never customer details or storage paths.
        var json = System.Text.Json.JsonSerializer.Serialize(report);
        Assert.DoesNotContain("dry-run@example.com", json); Assert.DoesNotContain("Test Kullanıcı", json); Assert.DoesNotContain(directory, json); Assert.DoesNotContain(SavedDesignStore.OrderFile(full.Id, 0), json);

        // An unreadable store prints no report at all rather than an empty "nothing to do".
        recorder.FailOrderReads = true;
        using var output = new StringWriter(); using var error = new StringWriter();
        try { Assert.Equal(2, await OrderDesignFilesDryRun.Run(f.Factory.Services, output, error)); }
        finally { recorder.FailOrderReads = false; }
        Assert.Equal("", output.ToString());
        Assert.Equal(0, await OrderDesignFilesDryRun.Run(f.Factory.Services, output, error));
        Assert.Contains("\"personalisedLines\": 5", output.ToString());
    }

    [Fact]
    public async Task AcceptanceBindsLineIdentityPlacementAndAllThreeFilesAcrossEditsAndRestart()
    {
        using var f = await Start("acceptance@example.com");
        var photo = CanvasPhoto(SkiaSharp.SKColors.Navy);
        var placement = new DesignPlacement(100, 100, await Publish(f.ProductId, f.VariantId, f.SourceImage, photo, Mask), 30, 40, 1.1, 5, .2,
            new() { ["upper-body"] = new(1, 2, .9, 3) }, "artwork", true);
        var first = await Configure(f, placement);
        var state = (await f.Staff.GetFromJsonAsync<Xinobi.Api.LocalCommerce.CommerceState>("/api/v1/local-commerce/state"))!;
        var variant = state.Products.Single(p => p.Id == f.ProductId).Variants.Single(v => v.Id == f.VariantId);
        // Revision 2 exists before ordering; revision 1 is the one ordered.
        await Configure(f, placement with { X = 70, Rotation = 0 }, first.Id, 1, NewComposition);
        var request = new PlaceOrder(f.Address.Id, [new(f.ProductId, f.VariantId, 2, f.Design.Id, first.Id, 1)], "acceptance-request-1");
        var order = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Post, "/api/v1/me/orders", f.Token, JsonContent.Create(request)));

        async Task Verify(HttpClient staff, CustomerOrder placed)
        {
            var line = placed.Lines[0]; var design = line.Personalization!;
            Assert.Equal((f.ProductId, f.VariantId, variant.Color, variant.Sku, 2), (line.ProductId, line.VariantId, line.Color, design.Sku, line.Quantity));
            Assert.Equal((f.Design.Id, first.Id, 1, first.SchemaVersion, first.SourceSha256), (design.DesignId, design.ConfigurationId, design.ConfigurationRevision, design.SchemaVersion, design.SourceSha256));
            Assert.Equal(first.Placement with { BodyAdjustments = null }, design.Placement! with { BodyAdjustments = null });
            Assert.Equal(first.Placement.BodyAdjustments!["upper-body"], design.Placement!.BodyAdjustments!["upper-body"]);
            Assert.Equal(design.SourceSha256, design.Files!.Pattern.Sha256);
            foreach (var (kind, reference, bytes) in new[] { ("pattern", design.Files.Pattern, Pattern), ("source", design.Files.ProductSource!, photo), ("composition", design.Files.Composition!, Composition) })
            {
                using var response = await staff.GetAsync($"/api/v1/admin/orders/{placed.Id}/lines/0/{kind}");
                var content = await response.Content.ReadAsByteArrayAsync();
                Assert.Equal(bytes, content);
                Assert.Equal((reference.Sha256, reference.Mime, reference.Bytes), (Sha(content), response.Content.Headers.ContentType?.MediaType, (long)content.Length));
                Assert.Equal("sha256", response.Headers.GetValues("X-Xinobi-File-Check").Single());
                Assert.EndsWith(kind == "pattern" ? "-desen-rev1.png" : kind == "source" ? ".png" : "-giydirilmis-onizleme-rev1.jpg", FileName(response));
            }
            // Staff and customer views carry the same binding.
            var panel = (await staff.GetFromJsonAsync<StaffOrder[]>("/api/v1/local-commerce/orders"))!.Single(item => item.Order.Id == placed.Id).Order.Lines[0].Personalization!;
            Assert.Equal((design.Files, design.ConfigurationRevision, design.Sku), (panel.Files, panel.ConfigurationRevision, panel.Sku));
        }
        await Verify(f.Staff, order);

        // Later edits: rename, revision 3, new catalogue photo and mask, colour image change, design deleted.
        (await Send(f.Client, HttpMethod.Patch, $"/api/v1/me/designs/{f.Design.Id}", f.Token, JsonContent.Create(new RenameDesign("Yeniden adlandırıldı")))).EnsureSuccessStatusCode();
        await Configure(f, placement with { X = 10 }, first.Id, 2, NewComposition);
        await Publish(f.ProductId, f.VariantId, f.SourceImage, CanvasPhoto(SkiaSharp.SKColors.Yellow), NewMask);
        var product = state.Products.Single(p => p.Id == f.ProductId);
        (await f.Staff.PutAsJsonAsync("/api/v1/local-commerce/products/" + product.Id, product with
            { Variants = [.. product.Variants.Select(v => v.Id == f.VariantId ? v with { Image = "/assets/acceptance-new-photo.webp" } : v)] })).EnsureSuccessStatusCode();
        (await Send(f.Client, HttpMethod.Delete, $"/api/v1/me/designs/{f.Design.Id}", f.Token)).EnsureSuccessStatusCode();
        var after = await Read<CustomerOrder>(await Send(f.Client, HttpMethod.Get, $"/api/v1/me/orders/{order.Id}", f.Token));
        Assert.Equal(order.Lines[0].Personalization!.Name, after.Lines[0].Personalization!.Name);
        await Verify(f.Staff, after);

        // A fresh host on the same isolated data folder (file store restart, not SQL) reads the same order and files.
        using var restarted = Factory();
        using var restartedStaff = await TestStaff.Client(restarted);
        var reloaded = (await restartedStaff.GetFromJsonAsync<StaffOrder[]>("/api/v1/local-commerce/orders"))!.Single(item => item.Order.Id == order.Id).Order;
        await Verify(restartedStaff, reloaded);
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
