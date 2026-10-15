BEGIN TRANSACTION;
DROP TABLE [identity].[AdminMfaChallenges];

DROP TABLE [identity].[AdminMfaGrants];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261013122941_AdminMfaPersistence';

COMMIT;
GO
