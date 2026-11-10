BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261110082212_CustomerAccountDeletion'
)
BEGIN
    ALTER TABLE [identity].[Users] DROP CONSTRAINT [CK_Users_Status];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261110082212_CustomerAccountDeletion'
)
BEGIN
    EXEC(N'ALTER TABLE [identity].[Users] ADD CONSTRAINT [CK_Users_Status] CHECK ([Status] IN (N''pending_verification'', N''active'', N''disabled'', N''deleted''))');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261110082212_CustomerAccountDeletion'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261110082212_CustomerAccountDeletion', N'10.0.12');
END;

COMMIT;
GO
