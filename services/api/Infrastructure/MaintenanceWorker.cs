using Xinobi.Api.Identity;

namespace Xinobi.Api.Infrastructure;

/// <summary>
/// Hourly housekeeping that no request triggers: expired SQL sessions are removed. Idempotent, so it is safe on every API process;
/// it does nothing while accounts are still in the Development file (which prunes on every write).
/// </summary>
public sealed class MaintenanceWorker(IAccountStore accounts, ILogger<MaintenanceWorker> logger) : BackgroundService
{
    public static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (accounts is not SqlAccountStore sql) return;
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                var removed = await sql.PruneExpiredSessions();
                if (removed > 0) logger.LogInformation("Removed {Count} expired sessions.", removed);
            }
            catch (AccountUnavailableException) { logger.LogWarning("Session cleanup skipped: account store unavailable."); }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken).ConfigureAwait(false));
    }
}
