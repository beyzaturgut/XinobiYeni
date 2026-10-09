BEGIN TRANSACTION;
DROP TABLE [ops].[FeatureDocuments];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261009135019_FeatureDocuments';

COMMIT;
GO

