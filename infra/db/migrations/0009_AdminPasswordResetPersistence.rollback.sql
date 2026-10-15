BEGIN TRANSACTION;
DROP TABLE [identity].[AdminPasswordResets];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261013123801_AdminPasswordResetPersistence';

COMMIT;
GO
