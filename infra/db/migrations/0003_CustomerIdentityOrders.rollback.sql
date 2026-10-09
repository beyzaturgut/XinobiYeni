BEGIN TRANSACTION;
DROP TABLE [identity].[AccessSessions];

DROP TABLE [identity].[CustomerAddresses];

DROP TABLE [sales].[OrderLines];

DROP TABLE [identity].[RefreshSessions];

DROP TABLE [sales].[Orders];

DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[identity].[Users]') AND [c].[name] = N'DisplayName');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [identity].[Users] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [identity].[Users] DROP COLUMN [DisplayName];

DECLARE @var1 nvarchar(max);
SELECT @var1 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[identity].[Users]') AND [c].[name] = N'Phone');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [identity].[Users] DROP CONSTRAINT ' + @var1 + ';');
ALTER TABLE [identity].[Users] DROP COLUMN [Phone];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders';

COMMIT;
GO
