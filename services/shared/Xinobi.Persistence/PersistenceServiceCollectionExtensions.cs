using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.DependencyInjection;

namespace Xinobi.Persistence;

public static class PersistenceServiceCollectionExtensions
{
    /// <summary>
    /// Registers <see cref="XinobiDbContext"/>. No connection is opened at startup and migrations are never applied
    /// automatically; schema changes go through the reviewed script in <c>infra/db/migrations</c>.
    /// </summary>
    public static IServiceCollection AddXinobiPersistence(this IServiceCollection services, string? connectionString) =>
        // Connection retry is decided with the outbox transaction pattern in 03.07; a retrying strategy rejects user transactions.
        services.AddDbContext<XinobiDbContext>(options => options.UseSqlServer(
            string.IsNullOrWhiteSpace(connectionString) ? NotConfigured : connectionString));

    // Lets the app start without SQL Server (e.g. local commerce demo); any query fails fast instead.
    internal const string NotConfigured = "Server=sql-not-configured;Database=xinobi;Connect Timeout=1";
}

/// <summary>Used only by <c>dotnet ef</c>. Reads <c>XINOBI_SQL</c> when a real database is needed; generating migrations and scripts needs none.</summary>
public sealed class XinobiDbContextDesignTimeFactory : IDesignTimeDbContextFactory<XinobiDbContext>
{
    public XinobiDbContext CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<XinobiDbContext>()
            .UseSqlServer(Environment.GetEnvironmentVariable("XINOBI_SQL") ?? PersistenceServiceCollectionExtensions.NotConfigured)
            .Options);
}
