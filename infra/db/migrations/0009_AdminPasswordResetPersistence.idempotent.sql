BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013123801_AdminPasswordResetPersistence'
)
BEGIN
    CREATE TABLE [identity].[AdminPasswordResets] (
        [TokenHash] varchar(64) NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [RequiredRole] varchar(64) NOT NULL,
        [CredentialStamp] varchar(64) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [ConsumedAt] datetimeoffset NULL,
        CONSTRAINT [PK_AdminPasswordResets] PRIMARY KEY ([TokenHash]),
        CONSTRAINT [CK_AdminPasswordResets_Expiry] CHECK ([ExpiresAt] > [CreatedAt]),
        CONSTRAINT [CK_AdminPasswordResets_Role] CHECK ([RequiredRole] IN ('admin','super_admin')),
        CONSTRAINT [FK_AdminPasswordResets_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013123801_AdminPasswordResetPersistence'
)
BEGIN
    CREATE INDEX [IX_AdminPasswordResets_ExpiresAt] ON [identity].[AdminPasswordResets] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013123801_AdminPasswordResetPersistence'
)
BEGIN
    CREATE INDEX [IX_AdminPasswordResets_UserId_CreatedAt] ON [identity].[AdminPasswordResets] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013123801_AdminPasswordResetPersistence'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013123801_AdminPasswordResetPersistence', N'10.0.12');
END;

COMMIT;
GO
