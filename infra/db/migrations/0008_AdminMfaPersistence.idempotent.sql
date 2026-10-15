BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    CREATE TABLE [identity].[AdminMfaChallenges] (
        [TokenHash] varchar(64) NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [CodeHash] varchar(64) NOT NULL,
        [CredentialStamp] varchar(64) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [Attempts] int NOT NULL,
        [ConsumedAt] datetimeoffset NULL,
        CONSTRAINT [PK_AdminMfaChallenges] PRIMARY KEY ([TokenHash]),
        CONSTRAINT [CK_AdminMfaChallenges_Attempts] CHECK ([Attempts] >= 0 AND [Attempts] <= 5),
        CONSTRAINT [CK_AdminMfaChallenges_Expiry] CHECK ([ExpiresAt] > [CreatedAt]),
        CONSTRAINT [FK_AdminMfaChallenges_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    CREATE TABLE [identity].[AdminMfaGrants] (
        [TokenHash] varchar(64) NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [CredentialStamp] varchar(64) NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_AdminMfaGrants] PRIMARY KEY ([TokenHash]),
        CONSTRAINT [FK_AdminMfaGrants_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    CREATE INDEX [IX_AdminMfaChallenges_ExpiresAt] ON [identity].[AdminMfaChallenges] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    CREATE INDEX [IX_AdminMfaChallenges_UserId_CreatedAt] ON [identity].[AdminMfaChallenges] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    CREATE INDEX [IX_AdminMfaGrants_ExpiresAt] ON [identity].[AdminMfaGrants] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    CREATE INDEX [IX_AdminMfaGrants_UserId] ON [identity].[AdminMfaGrants] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013122941_AdminMfaPersistence', N'10.0.12');
END;

COMMIT;
GO
