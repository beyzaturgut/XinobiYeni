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
    [InlineData(typeof(Role), new[] { nameof(Role.Code) })]
    [InlineData(typeof(Permission), new[] { nameof(Permission.Resource), nameof(Permission.Action) })]
    [InlineData(typeof(SyncJob), new[] { nameof(SyncJob.System), nameof(SyncJob.IdempotencyKey) })]
    [InlineData(typeof(SyncAttempt), new[] { nameof(SyncAttempt.SyncJobId), nameof(SyncAttempt.AttemptNumber) })]
    [InlineData(typeof(ExternalMapping), new[] { nameof(ExternalMapping.System), nameof(ExternalMapping.EntityType), nameof(ExternalMapping.LocalId) })]
    [InlineData(typeof(ExternalMapping), new[] { nameof(ExternalMapping.System), nameof(ExternalMapping.EntityType), nameof(ExternalMapping.ExternalId) })]
    [InlineData(typeof(Asset), new[] { nameof(Asset.StorageKey) })]
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
        var generated = context.GetService<IMigrator>().GenerateScript(options: MigrationsSqlGenerationOptions.Idempotent);
        var committed = File.ReadAllText(Path.Combine(RepositoryRoot(), "infra/db/migrations/0001_InitialCore.idempotent.sql"));
        Assert.Equal(Normalize(committed), Normalize(generated));
    }

    private static string Normalize(string sql) => sql.Trim('﻿').ReplaceLineEndings("\n").Trim();

    private static string RepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "XinobiYeni.slnx"))) directory = directory.Parent;
        return directory?.FullName ?? throw new InvalidOperationException("Repository root not found.");
    }
}
