namespace Xinobi.Api.Infrastructure.Readiness;

public interface ISqlServerReadinessProbe
{
    Task<ReadinessCheckResult> CheckAsync(CancellationToken cancellationToken);
}

public sealed record ReadinessCheckResult(bool IsReady, string Code);
