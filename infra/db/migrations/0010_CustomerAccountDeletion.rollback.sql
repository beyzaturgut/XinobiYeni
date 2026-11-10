BEGIN TRANSACTION;
IF EXISTS (SELECT 1 FROM [identity].[Users] WHERE [Status] = N'deleted') THROW 51000, 'Deleted accounts exist; restore a verified backup or use a forward migration. Accounts will not be reactivated.', 1;

ALTER TABLE [identity].[Users] DROP CONSTRAINT [CK_Users_Status];

ALTER TABLE [identity].[Users] ADD CONSTRAINT [CK_Users_Status] CHECK ([Status] IN (N'pending_verification', N'active', N'disabled'));

DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261110082212_CustomerAccountDeletion';

COMMIT;
GO
