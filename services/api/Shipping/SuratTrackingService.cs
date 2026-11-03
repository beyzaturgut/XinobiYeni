using Microsoft.Extensions.Options;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

public sealed record SuratTrackingSnapshot(string Result, DateTimeOffset? LastAttempt, DateTimeOffset? LastSuccess,
    DateTimeOffset NextAttempt, int Failures, SuratTrackingDocument[] Documents);
public sealed record SuratTrackingLease(string Token, DateTimeOffset Until);
public sealed record SuratTrackingItem(string? TrackingNumber, int? StatusCode, string State, string? ProviderText,
    string? LastMovementRaw, string? DeliveredDateRaw);
public sealed record SuratTrackingView(string Reference, string RegistrationState, string Environment, string Result,
    DateTimeOffset? LastAttempt, DateTimeOffset? LastSuccess, SuratTrackingItem[] Items)
{
    public static SuratTrackingView From(SuratStoredShipment row) => new(row.Reference, row.State, row.Environment,
        row.Tracking?.Result ?? "not_checked", row.Tracking?.LastAttempt, row.Tracking?.LastSuccess,
        row.Tracking?.Documents.Select(d => new SuratTrackingItem(d.TrackingNumber, d.StatusCode, d.NormalizedState,
            d.StatusText, d.LastMovementRaw, d.DeliveredDateRaw)).ToArray() ?? []);
}

public sealed class SuratTrackingService(SuratShipmentStore store, ISuratKargoClient client,
    IOptions<SuratKargoOptions> options, TimeProvider clock)
{
    public async Task<SuratTrackingView> Refresh(string orderId, CancellationToken token)
    {
        var config = options.Value;
        SuratAccount account;
        try { account = config.Resolve().Account; }
        catch (SuratConfigurationException) { throw ProblemException.Unavailable("Sürat Kargo bağlantısı"); }
        var claim = await store.ClaimTracking(orderId, config.Mode, account.Username, clock.GetUtcNow());
        if (claim.Lease is null) return SuratTrackingView.From(claim.Row);
        var result = await client.TrackAsync(claim.Row.Reference, token);
        var row = await store.CompleteTracking(claim.Row, claim.Lease, result, clock.GetUtcNow(),
            Math.Clamp(config.PollIntervalSeconds, 30, 86400), Math.Clamp(config.TerminalPollIntervalSeconds, 30, 86400));
        return SuratTrackingView.From(row);
    }
}

public sealed class SuratTrackingWorker(IServiceScopeFactory scopes, IOptions<SuratKargoOptions> options,
    SuratShipmentStore store, TimeProvider clock, ILogger<SuratTrackingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                var c = options.Value;
                if (!c.Enabled || !c.PollingEnabled) continue;
                try
                {
                    var account = c.Resolve().Account;
                    foreach (var row in await store.DueTracking(c.Mode, clock.GetUtcNow(), account.Username))
                    {
                        using var scope = scopes.CreateScope();
                        await scope.ServiceProvider.GetRequiredService<SuratTrackingService>().Refresh(row.OrderId, stoppingToken);
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
                catch { logger.LogWarning("Surat tracking cycle incomplete; retained data and scheduled retry."); }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }
}
