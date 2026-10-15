namespace Xinobi.Persistence.Entities;

public sealed class AdminMfaChallengeRecord
{
    public required string TokenHash { get; set; }
    public Guid UserId { get; set; }
    public required string CodeHash { get; set; }
    public required string CredentialStamp { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
}
public sealed class AdminMfaGrant
{
    public required string TokenHash { get; set; }
    public Guid UserId { get; set; }
    public string? CredentialStamp { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}
