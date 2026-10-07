BEGIN TRANSACTION;
DROP TABLE [media].[Assets];

DROP TABLE [ops].[AuditLogs];

DROP TABLE [ops].[ExternalMappings];

DROP TABLE [ops].[InboxEvents];

DROP TABLE [ops].[OutboxEvents];

DROP TABLE [identity].[RolePermissions];

DROP TABLE [ops].[SyncAttempts];

DROP TABLE [identity].[UserRoles];

DROP TABLE [identity].[Permissions];

DROP TABLE [ops].[SyncJobs];

DROP TABLE [identity].[Roles];

DROP TABLE [identity].[Users];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261007090524_InitialCore';

COMMIT;
GO

