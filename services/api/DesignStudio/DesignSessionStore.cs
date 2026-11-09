using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Channels;
using Xinobi.Api.Catalog;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.DesignStudio;

/// <summary>Without VariantId use the explicitly approved product source; never select the first colour.</summary>
public record CreateDesignSession(string ProductId, string? VariantId, string BrowserId);
public record GenerateDesignRequest(DesignAnswer[] Answers);
public record DesignSession(string Id, string BrowserId, DateTimeOffset CreatedAt, DateTimeOffset ExpiresAt, CommerceProduct Product, CommerceVariant? Variant, string BankVersion, SessionQuestion[] Questions)
{
    public string? ProductSurfaceId { get; set; }
    public string Status { get; set; } = "questionnaire";
    public DesignAnswer[] Answers { get; set; } = [];
    public string? GenerationPrompt { get; set; }
    public string? GenerationPromptVersion { get; set; }
    public string? RequestHash { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? AssetFile { get; set; }
    public string? AssetMime { get; set; }
    public string? AssetSha256 { get; set; }
    public string? ProviderModel { get; set; }
    public string? ProviderRequestId { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
public record BrowserQuestionHistory(string[] Questions, Dictionary<string, string> Labels);
public record DesignDiskState(Dictionary<string, DesignSession> Sessions, Dictionary<string, BrowserQuestionHistory> History);
public record SessionView(string Id, string Status, DateTimeOffset ExpiresAt, CommerceProduct Product, CommerceVariant? Variant, string BankVersion, SessionQuestion[] Questions, DesignAnswer[] Answers, string? ImageUrl, string? ErrorCode, string? ErrorMessage);

/// <summary>
/// Products come from the active catalogue source (the local store in Development, the published snapshot on the test server).
/// Sessions and images live in <c>DesignStudio:DataDirectory</c>, by default <c>design-studio</c> under the local commerce data directory.
/// </summary>
public sealed class DesignSessionStore(ICatalogSource catalog, QuestionBank bank, IImageGenerationProvider provider, IConfiguration configuration, IWebHostEnvironment environment, Features.ProductSurfaces.PersonalizationSourceStore sources)
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private string DirectoryPath => configuration["DesignStudio:DataDirectory"]
        ?? Path.Combine(configuration["LocalCommerce:DataDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "local-commerce"), "design-studio");
    private string StatePath => Path.Combine(DirectoryPath, "sessions.json");
    public string AssetDirectory => Path.Combine(DirectoryPath, "assets");
    public Channel<string> Queue { get; } = Channel.CreateUnbounded<string>(new UnboundedChannelOptions { SingleReader = true });
    public static bool Eligible(CommerceProduct product) => product.Active && Xinobi.Api.Catalog.CatalogProjection.IsPersonalizable(product);
    private async Task<DesignDiskState> ReadCore() => File.Exists(StatePath) ? JsonSerializer.Deserialize<DesignDiskState>(await File.ReadAllTextAsync(StatePath), JsonOptions)! : new(new(), new());
    private async Task SaveCore(DesignDiskState state)
    {
        Directory.CreateDirectory(DirectoryPath);
        var temp = StatePath + ".tmp";
        await File.WriteAllTextAsync(temp, JsonSerializer.Serialize(state, JsonOptions));
        File.Move(temp, StatePath, true);
    }
    private static SessionView View(DesignSession s) => new(s.Id, s.Status, s.ExpiresAt, s.Product, s.Variant, s.BankVersion, s.Questions, s.Answers,
        s.Status == "ready" ? $"/api/v1/design-studio/sessions/{s.Id}/image" : null, s.ErrorCode, s.ErrorMessage);
    public async Task<SessionView> Create(CreateDesignSession request)
    {
        if (!Guid.TryParse(request.BrowserId, out _)) throw new ArgumentException("Geçerli bir tarayıcı oturumu gerekli.");
        var products = await catalog.ReadAsync();
        var product = products.Products.SingleOrDefault(p => p.Id == request.ProductId && Eligible(p)) ?? throw new ArgumentException("Bu ürün kişiselleştirmeye açık değil.");
        CommerceVariant? variant = null;
        string? surfaceId = null;
        if (string.IsNullOrWhiteSpace(request.VariantId))
        {
            try { surfaceId = (await sources.RenderingInputs(product.Id)).SurfaceId; }
            catch (Infrastructure.ProblemException) { throw new ArgumentException("Bu ürünün onaylı tek kaynağı hazır değil."); }
        }
        else variant = product.Variants.SingleOrDefault(v => v.Id == request.VariantId && !string.IsNullOrWhiteSpace(v.Image))
            ?? throw new ArgumentException("Bu ürün için geçerli bir ürün görseli yok.");
        await gate.WaitAsync();
        try
        {
            var state = await ReadCore();
            var now = DateTimeOffset.UtcNow;
            foreach (var key in state.Sessions.Where(pair => pair.Value.ExpiresAt < now.AddDays(-1)).Select(pair => pair.Key).ToArray()) state.Sessions.Remove(key);
            if (state.Sessions.Values.Count(s => s.BrowserId == request.BrowserId && s.CreatedAt > now.AddHours(-1)) >= 30) throw new DesignProviderException("session_limit", "Çok fazla yeni anket açıldı. Bir süre sonra tekrar deneyin.");
            // Bound local history and session files; no personal identity or free-form text is collected.
            if (state.Sessions.Count >= 3000 || state.History.Count >= 3000 && !state.History.ContainsKey(request.BrowserId)) throw new DesignProviderException("session_limit", "Anket kapasitesine ulaşıldı.");
            var history = state.History.GetValueOrDefault(request.BrowserId) ?? new BrowserQuestionHistory([], new());
            var questions = bank.Draw(history.Questions, history.Labels);
            var all = history.Questions.Concat(questions.Select(q => q.Id)).Distinct().ToArray();
            foreach (var axis in bank.Data.Axes)
                if (all.Count(id => bank.Data.Questions.Any(q => q.Id == id && q.Axis == axis.Id)) >= 100) all = all.Where(id => !bank.Data.Questions.Any(q => q.Id == id && q.Axis == axis.Id)).Concat(questions.Where(q => q.Axis == axis.Id).Select(q => q.Id)).Distinct().ToArray();
            state.History[request.BrowserId] = history with { Questions = all };
            var session = new DesignSession(Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant(), request.BrowserId, now, now.AddHours(24), product, variant, bank.Data.Version, questions);
            session.ProductSurfaceId = surfaceId;
            state.Sessions[session.Id] = session;
            await SaveCore(state);
            return View(session);
        }
        finally { gate.Release(); }
    }
    public async Task<SessionView?> Get(string id)
    {
        await gate.WaitAsync();
        try { var state = await ReadCore(); return state.Sessions.TryGetValue(id, out var session) && session.ExpiresAt > DateTimeOffset.UtcNow ? View(session) : null; }
        finally { gate.Release(); }
    }
    /// <summary>Finished generations for the AI usage report.</summary>
    public async Task<(DateTimeOffset At, string Model, bool Success, string? Error)[]> Generations()
    {
        await gate.WaitAsync();
        try
        {
            return [.. (await ReadCore()).Sessions.Values.Where(session => session.CompletedAt is not null)
                .Select(session => (session.CompletedAt!.Value, session.ProviderModel ?? "@cf/black-forest-labs/flux-1-schnell", session.Status == "ready", session.ErrorCode))];
        }
        finally { gate.Release(); }
    }

    public async Task<(string Path, string Mime)?> Asset(string id)
    {
        await gate.WaitAsync();
        try
        {
            var state = await ReadCore();
            if (!state.Sessions.TryGetValue(id, out var session) || session.ExpiresAt < DateTimeOffset.UtcNow || session.Status != "ready" || session.AssetFile is null) return null;
            return (Path.Combine(AssetDirectory, session.AssetFile), session.AssetMime!);
        }
        finally { gate.Release(); }
    }
    public async Task<SessionView> Generate(string id, GenerateDesignRequest request)
    {
        if (request.Answers is null) throw new ArgumentException("Beş yanıt gerekli.");
        var current = await catalog.ReadAsync();
        await gate.WaitAsync();
        try
        {
            var state = await ReadCore();
            if (!state.Sessions.TryGetValue(id, out var session) || session.ExpiresAt < DateTimeOffset.UtcNow) throw new KeyNotFoundException();
            var prompt = bank.BuildPrompt(session.Questions, request.Answers);
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(request.Answers.OrderBy(a => a.QuestionId), JsonOptions))));
            if (session.Status != "questionnaire")
            {
                if (hash != session.RequestHash) throw new DesignProviderException("answers_locked", "Bu üretimin yanıtları değiştirilemez. Yeni bir anket başlatın.");
                return View(session); // Network retries never trigger another provider request.
            }
            if (session.BankVersion != bank.Data.Version) throw new DesignProviderException("questionnaire_updated", "Soru havuzu güncellendi. Yeni bir anket başlatın.");
            if (!provider.IsConfigured) throw new DesignProviderException("provider_not_configured", "Cloudflare bağlantısı henüz yapılandırılmadı. Yanıtlarınız korunuyor.");
            if (!current.Products.Any(p => p.Id == session.Product.Id && Eligible(p) && (session.Variant is null || p.Variants.Any(v => v.Id == session.Variant.Id)))) throw new ArgumentException("Seçilen ürün artık kişiselleştirmeye açık değil.");
            var limit = Math.Clamp(configuration.GetValue("DesignStudio:DailyGenerationLimit", 30), 1, 100);
            if (!(environment.IsDevelopment() && configuration.GetValue<bool>("DesignStudio:DisableGenerationLimit")) && state.Sessions.Values.Count(s => s.StartedAt?.UtcDateTime.Date == DateTime.UtcNow.Date || s.Status == "queued") >= limit)
                throw new DesignProviderException("daily_limit", "Bugünkü görsel üretim sınırına ulaşıldı.");
            session.GenerationPrompt = prompt;
            session.GenerationPromptVersion = DesignArtDirection.Version;
            if (session.ProductSurfaceId is { } selectedSurface)
            {
                try { if ((await sources.RenderingInputs(session.Product.Id)).SurfaceId != selectedSurface) throw new ArgumentException("Ürün kaynağı değişti; yeni bir oturum açın."); }
                catch (Infrastructure.ProblemException) { throw new ArgumentException("Ürün kaynağı değişti; yeni bir oturum açın."); }
            }
            session.Answers = request.Answers; session.RequestHash = hash; session.Status = "queued";
            await SaveCore(state);
            await Queue.Writer.WriteAsync(id);
            return View(session);
        }
        finally { gate.Release(); }
    }
    public async Task Recover()
    {
        await gate.WaitAsync();
        try
        {
            var state = await ReadCore();
            foreach (var session in state.Sessions.Values.Where(s => s.Status == "running"))
            { session.Status = "failed"; session.ErrorCode = "interrupted"; session.ErrorMessage = "Üretim sırasında bağlantı kesildi. Aynı istek otomatik tekrarlanmadı."; }
            await SaveCore(state);
            foreach (var session in state.Sessions.Values.Where(s => s.Status == "queued" && s.ExpiresAt > DateTimeOffset.UtcNow)) await Queue.Writer.WriteAsync(session.Id);
        }
        finally { gate.Release(); }
    }
    public async Task Run(string id, CancellationToken token)
    {
        DesignSession session;
        await gate.WaitAsync(token);
        try
        {
            var state = await ReadCore();
            if (!state.Sessions.TryGetValue(id, out session!) || session.Status != "queued") return;
            session.Status = "running"; session.StartedAt = DateTimeOffset.UtcNow;
            await SaveCore(state);
        }
        finally { gate.Release(); }
        GeneratedImage? image = null; string? errorCode = null, errorMessage = null;
        try { image = await provider.GenerateAsync(session.GenerationPrompt ?? bank.BuildPrompt(session.Questions, session.Answers), token); }
        catch (DesignProviderException error) { errorCode = error.Code; errorMessage = error.Message; }
        catch (OperationCanceledException) { errorCode = "provider_timeout"; errorMessage = "Üretim süresi doldu. İstek otomatik tekrarlanmadı."; }
        catch (Exception) { errorCode = "provider_unavailable"; errorMessage = "Görsel üretimi tamamlanamadı. Yanıtlarınız korunuyor."; }
        await gate.WaitAsync(CancellationToken.None);
        try
        {
            var state = await ReadCore(); var saved = state.Sessions[id];
            if (image is not null)
            {
                Directory.CreateDirectory(AssetDirectory);
                var filename = id + (image.Mime == "image/png" ? ".png" : ".jpg");
                await File.WriteAllBytesAsync(Path.Combine(AssetDirectory, filename), image.Bytes);
                saved.AssetFile = filename; saved.AssetMime = image.Mime; saved.AssetSha256 = Convert.ToHexString(SHA256.HashData(image.Bytes));
                saved.ProviderModel = image.Model; saved.ProviderRequestId = image.ProviderRequestId; saved.Status = "ready";
            }
            else { saved.Status = "failed"; saved.ErrorCode = errorCode; saved.ErrorMessage = errorMessage; }
            saved.CompletedAt = DateTimeOffset.UtcNow;
            await SaveCore(state);
        }
        finally { gate.Release(); }
    }
}
public sealed class DesignGenerationWorker(DesignSessionStore sessions, ILogger<DesignGenerationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await sessions.Recover();
        await foreach (var id in sessions.Queue.Reader.ReadAllAsync(stoppingToken))
        {
            try { using var timeout = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken); timeout.CancelAfter(TimeSpan.FromSeconds(120)); await sessions.Run(id, timeout.Token); }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception error) { logger.LogError("Design job persistence failed ({ExceptionType}).", error.GetType().Name); }
        }
    }
}
