BEGIN TRANSACTION;
DROP TABLE [catalog].[Announcements];

DROP TABLE [catalog].[Content];

DROP TABLE [catalog].[VariantPrices];

DROP TABLE [catalog].[Variants];

DROP TABLE [catalog].[Products];

DROP TABLE [catalog].[Categories];

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261009120332_CatalogCommerce';

COMMIT;
GO
