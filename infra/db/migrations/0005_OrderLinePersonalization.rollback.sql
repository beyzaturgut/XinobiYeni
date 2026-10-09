BEGIN TRANSACTION;
ALTER TABLE [sales].[OrderLines] DROP CONSTRAINT [CK_OrderLines_Personalization];

DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[sales].[OrderLines]') AND [c].[name] = N'PersonalizationJson');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [sales].[OrderLines] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [sales].[OrderLines] DROP COLUMN [PersonalizationJson];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261009141900_OrderLinePersonalization';

COMMIT;
GO

