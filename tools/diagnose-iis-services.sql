-- Read-only. Run in SSMS against the same database as ConnectionStrings__Xinobi.
-- No user records, passwords, tokens or connection strings are returned.
SET NOCOUNT ON;
SELECT DB_NAME() AS CurrentDatabase;
SELECT expected.TableName,
       CASE WHEN OBJECT_ID(expected.TableName, 'U') IS NULL THEN 'MISSING' ELSE 'OK' END AS TableStatus
FROM (VALUES
    ('identity.Users'), ('identity.Roles'), ('identity.UserRoles'),
    ('identity.AccessSessions'), ('identity.RefreshSessions'),
    ('identity.CustomerAddresses'), ('identity.AdminInvitations'),
    ('identity.AdminMfaChallenges'), ('identity.AdminMfaGrants'),
    ('identity.AdminPasswordResets'), ('identity.Favorites'),
    ('ops.FeatureDocuments'), ('catalog.Products'), ('catalog.Variants'),
    ('sales.Orders'), ('sales.OrderLines')
) AS expected(TableName);
IF OBJECT_ID('dbo.__EFMigrationsHistory', 'U') IS NOT NULL
    SELECT MigrationId FROM dbo.__EFMigrationsHistory ORDER BY MigrationId;
ELSE
    SELECT 'Migration history is missing: verify the database selection.' AS Diagnostic;
