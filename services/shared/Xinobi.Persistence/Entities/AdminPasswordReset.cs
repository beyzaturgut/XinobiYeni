namespace Xinobi.Persistence.Entities;

public sealed class AdminPasswordReset
{
    public required string TokenHash { get; set; }
    public Guid UserId { get; set; }
    public required string RequiredRole { get; set; }
    public required string CredentialStamp { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
}
