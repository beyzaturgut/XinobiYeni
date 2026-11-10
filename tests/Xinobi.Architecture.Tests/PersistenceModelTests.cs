using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

/// <summary>Faz03 03.05 schema checks; none of these open a database connection.</summary>
public sealed class PersistenceModelTests
{
    private static XinobiDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer("Server=unused;Database=xinobi").Options);

    [Fact]
    public void ModelHasNoChangesMissingFromMigrations()
    {
        using var context = CreateContext();
        Assert.False(context.Database.HasPendingModelChanges(), "Run `dotnet ef migrations add` and regenerate infra/db/migrations.");
    }

    [Theory]
    [InlineData(typeof(User), new[] { nameof(User.NormalizedEmail) })]
    [InlineData(typeof(AdminInvitation), new[] { nameof(AdminInvitation.TokenHash) })]
    [InlineData(typeof(AdminMfaChallengeRecord), new[] { nameof(AdminMfaChallengeRecord.TokenHash) })]
    [InlineData(typeof(AdminMfaGrant), new[] { nameof(AdminMfaGrant.TokenHash) })]
    [InlineData(typeof(AdminPasswordReset), new[] { nameof(AdminPasswordReset.TokenHash) })]
    [InlineData(typeof(CustomerFavorite), new[] { nameof(CustomerFavorite.UserId), nameof(CustomerFavorite.ProductId) })]
    [InlineData(typeof(Role), new[] { nameof(Role.Code) })]
    [InlineData(typeof(Permission), new[] { nameof(Permission.Resource), nameof(Permission.Action) })]
    [InlineData(typeof(SyncJob), new[] { nameof(SyncJob.System), nameof(SyncJob.IdempotencyKey) })]
    [InlineData(typeof(SyncAttempt), new[] { nameof(SyncAttempt.SyncJobId), nameof(SyncAttempt.AttemptNumber) })]
    [InlineData(typeof(ExternalMapping), new[] { nameof(ExternalMapping.System), nameof(ExternalMapping.EntityType), nameof(ExternalMapping.LocalId) })]
    [InlineData(typeof(ExternalMapping), new[] { nameof(ExternalMapping.System), nameof(ExternalMapping.EntityType), nameof(ExternalMapping.ExternalId) })]
    [InlineData(typeof(Asset), new[] { nameof(Asset.StorageKey) })]
    [InlineData(typeof(CatalogCategory), new[] { nameof(CatalogCategory.NormalizedName) })]
    [InlineData(typeof(CatalogVariant), new[] { nameof(CatalogVariant.NormalizedSku) })]
    [InlineData(typeof(SalesOrder), new[] { nameof(SalesOrder.UserId), nameof(SalesOrder.ClientRequestId) })]
    public void IntegrityKeysAreUnique(Type entity, string[] columns)
    {
        using var context = CreateContext();
        var type = context.Model.FindEntityType(entity)!;
        var keys = type.GetIndexes().Where(index => index.IsUnique).Select(index => (IReadOnlyList<IReadOnlyProperty>)index.Properties)
            .Concat(type.GetKeys().Select(key => (IReadOnlyList<IReadOnlyProperty>)key.Properties));
        Assert.Contains(keys, properties => properties.Select(property => property.Name).SequenceEqual(columns));
    }

    [Fact]
    public void InboxDeduplicatesByProviderAndExternalEventId()
    {
        using var context = CreateContext();
        var key = context.Model.FindEntityType(typeof(InboxEvent))!.FindPrimaryKey()!;
        Assert.Equal([nameof(InboxEvent.Provider), nameof(InboxEvent.ExternalEventId)], key.Properties.Select(property => property.Name));
    }

    [Fact]
    public void UsersUseOptimisticConcurrency()
    {
        using var context = CreateContext();
        var rowVersion = context.Model.FindEntityType(typeof(User))!.FindProperty(nameof(User.RowVersion))!;
        Assert.True(rowVersion.IsConcurrencyToken);
    }

    [Fact]
    public void ReviewedIdempotentScriptMatchesMigrations()
    {
        using var context = CreateContext();
        var generated = context.GetService<IMigrator>().GenerateScript("0", "20261013072705_CustomerFavorites", MigrationsSqlGenerationOptions.Idempotent);
        var committed = File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations/0007_CustomerFavorites.idempotent.sql"));
        Assert.Equal(Normalize(committed), Normalize(generated));
    }

    private static string Normalize(string sql) => sql.Trim('﻿').ReplaceLineEndings("\n").Trim();

    [Fact]
    public void ReviewedMfaScriptsMatchTheIncrementalMigrationRange()
    {
        using var context = CreateContext();
        var migrator = context.GetService<IMigrator>();
        const string previous = "20261013072705_CustomerFavorites";
        const string current = "20261013122941_AdminMfaPersistence";
        Assert.Contains(current, context.Database.GetMigrations());
        var deployed = migrator.GenerateScript(previous, current, MigrationsSqlGenerationOptions.Idempotent);
        Assert.Equal(Normalize(File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations/0008_AdminMfaPersistence.idempotent.sql"))), Normalize(deployed));
        var rollback = migrator.GenerateScript(current, previous);
        Assert.Equal(Normalize(File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations/0008_AdminMfaPersistence.rollback.sql"))), Normalize(rollback));
    }

    [Fact]
    public void ReviewedRecoveryScriptsMatchTheIncrementalMigrationRange()
    {
        using var context = CreateContext();
        var migrator = context.GetService<IMigrator>();
        const string previous = "20261013122941_AdminMfaPersistence";
        const string current = "20261013123801_AdminPasswordResetPersistence";
        Assert.Equal(new[]
        {
            "20261007090524_InitialCore",
            "20261009120332_CatalogCommerce",
            "20261009132316_CustomerIdentityOrders",
            "20261009135019_FeatureDocuments",
            "20261009141900_OrderLinePersonalization",
            "20261012115009_AdminInvitations",
            "20261013072705_CustomerFavorites",
            previous,
            current,
            "20261110082212_CustomerAccountDeletion"
        }, context.Database.GetMigrations());
        var deployed = migrator.GenerateScript(previous, current, MigrationsSqlGenerationOptions.Idempotent);
        Assert.Equal(Normalize(File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations/0009_AdminPasswordResetPersistence.idempotent.sql"))), Normalize(deployed));
        var rollback = migrator.GenerateScript(current, previous);
        Assert.Equal(Normalize(File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations/0009_AdminPasswordResetPersistence.rollback.sql"))), Normalize(rollback));
    }

    [Theory]
    [InlineData("0", "20261013072705_CustomerFavorites", "0007_CustomerFavorites.idempotent.sql")]
    [InlineData("20261013072705_CustomerFavorites", "20261013122941_AdminMfaPersistence", "0008_AdminMfaPersistence.idempotent.sql")]
    [InlineData("20261013122941_AdminMfaPersistence", "20261013123801_AdminPasswordResetPersistence", "0009_AdminPasswordResetPersistence.idempotent.sql")]
    [InlineData("20261013123801_AdminPasswordResetPersistence", "20261110082212_CustomerAccountDeletion", "0010_CustomerAccountDeletion.idempotent.sql")]
    public void ReviewedDeploymentRangeMatchesMigrations(string from, string to, string file)
    {
        using var context = CreateContext();
        var generated = context.GetService<IMigrator>().GenerateScript(from, to, MigrationsSqlGenerationOptions.Idempotent);
        var committed = File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations", file));
        Assert.Equal(Normalize(committed), Normalize(generated));
    }

    [Fact]
    public void ReviewedDeploymentRangesCoverTheEntireOrderedMigrationHistory()
    {
        using var context = CreateContext();
        // 0007 is cumulative; 0008 and 0009 are incremental. New migrations
        // must explicitly extend reviewed deployment coverage.
        Assert.Equal(new[]
        {
            "20261007090524_InitialCore",
            "20261009120332_CatalogCommerce",
            "20261009132316_CustomerIdentityOrders",
            "20261009135019_FeatureDocuments",
            "20261009141900_OrderLinePersonalization",
            "20261012115009_AdminInvitations",
            "20261013072705_CustomerFavorites",
            "20261013122941_AdminMfaPersistence",
            "20261013123801_AdminPasswordResetPersistence",
            "20261110082212_CustomerAccountDeletion"
        }, context.Database.GetMigrations());
    }

    private static string RepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "XinobiYeni.slnx"))) directory = directory.Parent;
        return directory?.FullName ?? throw new InvalidOperationException("Repository root not found.");
    }
}
