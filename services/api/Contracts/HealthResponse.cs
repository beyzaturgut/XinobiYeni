namespace Xinobi.Api.Contracts;

public sealed record HealthResponse(
    string Service,
    string Status,
    DateTimeOffset TimestampUtc,
    string RequestId);
