BEGIN TRANSACTION;

DROP TABLE [identity].[AdminInvitations];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261012115009_AdminInvitations';

COMMIT;
GO
