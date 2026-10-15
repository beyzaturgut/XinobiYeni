BEGIN TRANSACTION;

DROP TABLE [identity].[Favorites];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261013072705_CustomerFavorites';

COMMIT;
GO
