-- Run in SQL Server Management Studio with the DBA's authorized account.
-- This checks the backup; it does not restore, create or overwrite a database.
RESTORE VERIFYONLY
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\XinobiYeniDB_before_Catalog_20261009_8AED07EE7EA440AFBF3C9B6DA0DA1563.bak'
WITH CHECKSUM;
GO
