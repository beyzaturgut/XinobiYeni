SET NOCOUNT ON;

SELECT
    CAST(SERVERPROPERTY(N'ProductVersion') AS nvarchar(128)) AS product_version,
    CAST(SERVERPROPERTY(N'Edition') AS nvarchar(128)) AS edition,
    CAST(SERVERPROPERTY(N'EngineEdition') AS int) AS engine_edition;

SELECT
    name,
    state_desc,
    recovery_model_desc,
    compatibility_level,
    collation_name
FROM sys.databases
WHERE name = DB_NAME();

SELECT COUNT(*) AS user_table_count
FROM sys.tables
WHERE is_ms_shipped = 0;

SELECT COUNT(*) AS ef_history_count
FROM sys.tables
WHERE name = N'__EFMigrationsHistory'
  AND schema_id = SCHEMA_ID(N'dbo');

SELECT
    IS_ROLEMEMBER(N'db_owner') AS is_db_owner,
    HAS_PERMS_BY_NAME(DB_NAME(), N'DATABASE', N'CREATE TABLE') AS can_create_table,
    HAS_PERMS_BY_NAME(DB_NAME(), N'DATABASE', N'VIEW DEFINITION') AS can_view_definition;

SELECT TOP (50)
    schemas.name AS schema_name,
    tables.name AS table_name
FROM sys.tables AS tables
INNER JOIN sys.schemas AS schemas
    ON schemas.schema_id = tables.schema_id
WHERE tables.is_ms_shipped = 0
ORDER BY schemas.name, tables.name;
