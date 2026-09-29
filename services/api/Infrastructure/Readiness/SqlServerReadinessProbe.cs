using Microsoft.Data.SqlClient;

namespace Xinobi.Api.Infrastructure.Readiness;

public sealed class SqlServerReadinessProbe(
    IConfiguration configuration,
    ILogger<SqlServerReadinessProbe> logger) : ISqlServerReadinessProbe
{
    private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(3);

    public async Task<ReadinessCheckResult> CheckAsync(CancellationToken cancellationToken)
    {
        var connectionString = configuration.GetConnectionString("Xinobi");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return new ReadinessCheckResult(false, "sql_not_configured");
        }

        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(ProbeTimeout);

        try
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync(timeout.Token);
            return new ReadinessCheckResult(true, "ok");
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("SQL Server readiness probe timed out.");
            return new ReadinessCheckResult(false, "sql_timeout");
        }
        catch (SqlException)
        {
            logger.LogWarning("SQL Server readiness probe could not open a connection.");
            return new ReadinessCheckResult(false, "sql_unavailable");
        }
        catch (ArgumentException)
        {
            logger.LogWarning("SQL Server readiness configuration is invalid.");
            return new ReadinessCheckResult(false, "sql_invalid_configuration");
        }
    }
}
