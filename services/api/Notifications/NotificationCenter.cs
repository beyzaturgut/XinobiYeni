using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Notifications;

public static class NotificationChannels
{
    public const string InApp = "inapp";
    public const string Email = "email";
    public const string Sms = "sms";
    public const string Push = "push";
}

public static class NotificationStatuses
{
    public const string Pending = "pending";
    public const string Sent = "sent";
    /// <summary>Development preview delivery: recorded, not sent anywhere.</summary>
    public const string Previewed = "previewed";
    public const string Failed = "failed";
    /// <summary>The channel is not configured or the customer has no address for it.</summary>
    public const string Skipped = "skipped";
}

/// <summary>One message on one channel. In-app items are the customer's inbox; the others are an outbox the worker delivers.</summary>
public record NotificationItem(string Id, string AccountId, string Channel, string Recipient, string Kind, string Title, string Body, string? Link,
    DateTimeOffset CreatedAt, string Status, int Attempts = 0, string? LastError = null, DateTimeOffset? SentAt = null, DateTimeOffset? ReadAt = null,
    DateTimeOffset? NextAttemptAt = null);

public record DeviceRegistration(string AccountId, string Token, string Platform, DateTimeOffset UpdatedAt);

/// <summary>What the customer sees in the app or on the web.</summary>
public record InboxItem(string Id, string Kind, string Title, string Body, string? Link, DateTimeOffset CreatedAt, bool Read);
public record Inbox(InboxItem[] Items, int Unread);
public record MarkNotificationsRead(string[]? Ids);
public record RegisterDevice(string Token, string Platform);

/// <summary>
/// Transactional notifications (order placed, shipped, delivered, cancelled, request decisions). Every event lands in the customer's
/// in-app inbox; e-mail, SMS and push are queued and delivered by <see cref="NotificationWorker"/> with retries, so a delivery failure
/// never undoes the order change that caused it (Analiz §6.1). Development file store (ADR-003); 503 elsewhere until SQL Server.
/// </summary>
public sealed class NotificationCenter(FeatureDocuments documents, IConfiguration configuration, TimeProvider clock, IEnumerable<INotificationChannelSender> senders)
{
    public const int MaxAttempts = 5;
    private sealed record State(List<NotificationItem> Items, List<DeviceRegistration> Devices);
    private readonly DocumentStore<State> store = documents.Open<State>(Path.Combine("notifications", "notifications.json"), () => new([], []), "Bildirimler");
    private readonly Dictionary<string, INotificationChannelSender> byChannel = senders.ToDictionary(sender => sender.Channel);

    public string WebBaseUrl => (configuration["Web:BaseUrl"] ?? "http://localhost:3000").TrimEnd('/');

    public bool Configured(string channel) => byChannel.TryGetValue(channel, out var sender) && sender.IsConfigured;

    /// <summary>Queues <paramref name="title"/>/<paramref name="body"/> for the account on every channel it can be reached on.</summary>
    public Task Notify(AccountRecord account, string kind, string title, string body, string? link) => store.Update(state =>
    {
        var now = clock.GetUtcNow();
        NotificationItem Item(string channel, string recipient, string status, string? error = null) =>
            new(Guid.NewGuid().ToString("N"), account.Id, channel, recipient, kind, title, body, link, now, status, LastError: error, NextAttemptAt: status == NotificationStatuses.Pending ? now : null);
        state.Items.Add(Item(NotificationChannels.InApp, account.Id, NotificationStatuses.Sent) with { SentAt = now });
        state.Items.Add(ReservedAddress(account.Email) ? Item(NotificationChannels.Email, account.Email, NotificationStatuses.Skipped, "Ayrılmış test alan adı; gönderilmez.")
            : Configured(NotificationChannels.Email) ? Item(NotificationChannels.Email, account.Email, NotificationStatuses.Pending)
            : Item(NotificationChannels.Email, account.Email, NotificationStatuses.Skipped, "E-posta gönderimi yapılandırılmadı."));
        if (account.Phone is { Length: > 0 } phone)
            state.Items.Add(Configured(NotificationChannels.Sms) ? Item(NotificationChannels.Sms, phone, NotificationStatuses.Pending)
                : Item(NotificationChannels.Sms, phone, NotificationStatuses.Skipped, "SMS sağlayıcısı yapılandırılmadı."));
        if (state.Devices.Any(device => device.AccountId == account.Id))
            state.Items.Add(Configured(NotificationChannels.Push) ? Item(NotificationChannels.Push, account.Id, NotificationStatuses.Pending)
                : Item(NotificationChannels.Push, account.Id, NotificationStatuses.Skipped, "Push bildirimi (Firebase) yapılandırılmadı."));
        // The dev store keeps the newest 5000 items.
        if (state.Items.Count > 5000) state.Items.RemoveRange(0, state.Items.Count - 5000);
        return true;
    });

    /// <summary>E-mail to someone without an account (e.g. a corporate quote contact); nothing goes to an inbox.</summary>
    public Task NotifyGuest(string email, string kind, string title, string body, string? link) => store.Update(state =>
    {
        var now = clock.GetUtcNow();
        var status = ReservedAddress(email) ? NotificationStatuses.Skipped : Configured(NotificationChannels.Email) ? NotificationStatuses.Pending : NotificationStatuses.Skipped;
        state.Items.Add(new NotificationItem(Guid.NewGuid().ToString("N"), "guest", NotificationChannels.Email, email, kind, title, body, link, now, status,
            LastError: status == NotificationStatuses.Skipped ? (ReservedAddress(email) ? "Ayrılmış test alan adı; gönderilmez." : "E-posta gönderimi yapılandırılmadı.") : null,
            NextAttemptAt: status == NotificationStatuses.Pending ? now : null));
        return true;
    });

    /// <summary>
    /// RFC 2606 / 6761 names (example.com, *.test, *.invalid…) are never mailed. Tests use them and load the developer's real SMTP
    /// settings; a real mail to someone else's inbox from a test run happened once (TST-098) and must not happen again.
    /// </summary>
    public static bool ReservedAddress(string email)
    {
        var domain = email[(email.LastIndexOf('@') + 1)..].ToLowerInvariant();
        return domain is "example.com" or "example.org" or "example.net" or "localhost"
            || domain.EndsWith(".example", StringComparison.Ordinal) || domain.EndsWith(".test", StringComparison.Ordinal)
            || domain.EndsWith(".invalid", StringComparison.Ordinal) || domain.EndsWith(".localhost", StringComparison.Ordinal);
    }

    public async Task<Inbox> Inbox(string accountId)
    {
        var items = (await store.Read()).Items.Where(item => item.AccountId == accountId && item.Channel == NotificationChannels.InApp)
            .OrderByDescending(item => item.CreatedAt).Take(50).Select(item => new InboxItem(item.Id, item.Kind, item.Title, item.Body, item.Link, item.CreatedAt, item.ReadAt is not null)).ToArray();
        return new Inbox(items, items.Count(item => !item.Read));
    }

    /// <summary>Marks the given inbox items read, or all of them when <paramref name="ids"/> is null.</summary>
    public Task MarkRead(string accountId, string[]? ids) => store.Update(state =>
    {
        var now = clock.GetUtcNow();
        for (var i = 0; i < state.Items.Count; i++)
        {
            var item = state.Items[i];
            if (item.AccountId == accountId && item.Channel == NotificationChannels.InApp && item.ReadAt is null && (ids is null || ids.Contains(item.Id)))
                state.Items[i] = item with { ReadAt = now };
        }
        return true;
    });

    public Task RegisterDevice(string accountId, RegisterDevice device)
    {
        var token = device.Token?.Trim() ?? "";
        if (token.Length is < 20 or > 4096 || token.Any(char.IsWhiteSpace)) throw new ProblemException("invalid_token", "Cihaz bildirim anahtarı geçersiz.");
        if (device.Platform is not ("android" or "ios")) throw new ProblemException("invalid_platform", "Platform android veya ios olmalı.");
        return store.Update(state =>
        {
            // A token belongs to one device; signing in with another account moves it.
            state.Devices.RemoveAll(item => item.Token == token);
            if (state.Devices.Count(item => item.AccountId == accountId) >= 10) state.Devices.Remove(state.Devices.First(item => item.AccountId == accountId));
            state.Devices.Add(new DeviceRegistration(accountId, token, device.Platform, clock.GetUtcNow()));
            return true;
        });
    }

    public Task RemoveDevice(string accountId, string token) => store.Update(state => state.Devices.RemoveAll(item => item.AccountId == accountId && item.Token == token));

    public Task ForgetAccount(string accountId) => store.Update(state =>
    {
        state.Items.RemoveAll(item => item.AccountId == accountId);
        state.Devices.RemoveAll(item => item.AccountId == accountId);
        return true;
    });

    /// <summary>The newest items for the panel, optionally one channel or status.</summary>
    public async Task<NotificationItem[]> Recent(string? channel, string? status) =>
        (await store.Read()).Items.Where(item => (channel is null || item.Channel == channel) && (status is null || item.Status == status))
            .OrderByDescending(item => item.CreatedAt).Take(300).ToArray();

    public Task<NotificationItem> Retry(string id) => store.Update(state =>
    {
        var index = state.Items.FindIndex(item => item.Id == id);
        if (index < 0) throw ProblemException.NotFound("notification_not_found", "Bildirim bulunamadı.");
        var item = state.Items[index];
        if (item.Status != NotificationStatuses.Failed) throw new ProblemException("not_failed", "Yalnız başarısız bildirim yeniden gönderilebilir.", StatusCodes.Status409Conflict);
        return state.Items[index] = item with { Status = NotificationStatuses.Pending, Attempts = 0, NextAttemptAt = clock.GetUtcNow() };
    });

    /// <summary>Delivers due outbox items once; returns how many were attempted.</summary>
    public async Task<int> DeliverDue(CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var state = await store.Read();
        var due = state.Items.Where(item => item.Status == NotificationStatuses.Pending && item.NextAttemptAt <= now).Take(20).ToArray();
        foreach (var item in due)
        {
            var tokens = state.Devices.Where(device => device.AccountId == item.AccountId).Select(device => device.Token).ToArray();
            NotificationResult result;
            try
            {
                result = byChannel.TryGetValue(item.Channel, out var sender) && sender.IsConfigured
                    ? await sender.Send(item, tokens, cancellationToken)
                    : NotificationResult.Skip("Kanal yapılandırılmadı.");
            }
            catch (Exception error) when (error is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
            {
                result = NotificationResult.Fail(error is OperationCanceledException ? "Zaman aşımı." : error.GetType().Name);
            }
            await store.Update(current =>
            {
                var index = current.Items.FindIndex(entry => entry.Id == item.Id);
                if (index < 0) return false;
                var attempts = item.Attempts + 1;
                var after = clock.GetUtcNow();
                current.Items[index] = result.Status switch
                {
                    NotificationStatuses.Failed when attempts < MaxAttempts => current.Items[index] with { Attempts = attempts, LastError = result.Error, NextAttemptAt = after.AddSeconds(30 * Math.Pow(2, attempts - 1)) },
                    NotificationStatuses.Failed => current.Items[index] with { Status = NotificationStatuses.Failed, Attempts = attempts, LastError = result.Error, NextAttemptAt = null },
                    _ => current.Items[index] with { Status = result.Status, Attempts = attempts, LastError = result.Error, SentAt = after, NextAttemptAt = null },
                };
                // Push tokens the provider no longer knows are dropped.
                if (result.InvalidTokens is { Length: > 0 } invalid) current.Devices.RemoveAll(device => invalid.Contains(device.Token));
                return true;
            });
        }
        return due.Length;
    }
}

public sealed class NotificationWorker(NotificationCenter center, ILogger<NotificationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await center.DeliverDue(stoppingToken); }
            catch (Exception error) when (error is not OperationCanceledException) { logger.LogWarning(error, "Notification delivery round failed."); }
            try { await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken); }
            catch (OperationCanceledException) { return; }
        }
    }
}
