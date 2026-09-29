namespace Xinobi.Api.Contracts;

public sealed record ReadinessResponse(
    string Service,
    string Status,
    DateTimeOffset TimestampUtc,
    string RequestId,
    IReadOnlyList<DependencyHealth> Checks);

public sealed record DependencyHealth(
    string Name,
    bool IsReady,
    string Code);
