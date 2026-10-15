IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    IF SCHEMA_ID(N'media') IS NULL EXEC(N'CREATE SCHEMA [media];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    IF SCHEMA_ID(N'ops') IS NULL EXEC(N'CREATE SCHEMA [ops];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    IF SCHEMA_ID(N'identity') IS NULL EXEC(N'CREATE SCHEMA [identity];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [media].[Assets] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerType] nvarchar(64) NOT NULL,
        [OwnerId] nvarchar(128) NOT NULL,
        [StorageKey] nvarchar(512) NOT NULL,
        [Mime] nvarchar(128) NOT NULL,
        [Bytes] bigint NOT NULL,
        [Sha256] nchar(64) NOT NULL,
        [Status] nvarchar(32) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Assets] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Assets_Bytes] CHECK ([Bytes] >= 0),
        CONSTRAINT [CK_Assets_Status] CHECK ([Status] IN (N'uploading', N'ready', N'rejected', N'archived'))
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [ops].[AuditLogs] (
        [Id] bigint NOT NULL IDENTITY,
        [ActorUserId] uniqueidentifier NULL,
        [Action] nvarchar(128) NOT NULL,
        [EntityType] nvarchar(128) NOT NULL,
        [EntityId] nvarchar(128) NOT NULL,
        [SafeDiff] nvarchar(max) NULL,
        [TraceId] nvarchar(128) NULL,
        [OccurredAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [ops].[ExternalMappings] (
        [Id] bigint NOT NULL IDENTITY,
        [System] nvarchar(32) NOT NULL,
        [EntityType] nvarchar(64) NOT NULL,
        [LocalId] nvarchar(128) NOT NULL,
        [ExternalId] nvarchar(256) NOT NULL,
        [MappingVersion] int NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_ExternalMappings] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [ops].[InboxEvents] (
        [Provider] nvarchar(64) NOT NULL,
        [ExternalEventId] nvarchar(256) NOT NULL,
        [EventType] nvarchar(128) NOT NULL,
        [PayloadHash] nchar(64) NOT NULL,
        [State] nvarchar(32) NOT NULL,
        [ReceivedAt] datetimeoffset NOT NULL,
        [ProcessedAt] datetimeoffset NULL,
        CONSTRAINT [PK_InboxEvents] PRIMARY KEY ([Provider], [ExternalEventId]),
        CONSTRAINT [CK_InboxEvents_State] CHECK ([State] IN (N'pending', N'processing', N'succeeded', N'retry_wait', N'dead_letter'))
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [ops].[OutboxEvents] (
        [Id] uniqueidentifier NOT NULL,
        [EventType] nvarchar(128) NOT NULL,
        [AggregateType] nvarchar(128) NOT NULL,
        [AggregateId] nvarchar(128) NOT NULL,
        [PayloadVersion] int NOT NULL,
        [Payload] nvarchar(max) NOT NULL,
        [State] nvarchar(32) NOT NULL,
        [Attempts] int NOT NULL,
        [NextAttemptAt] datetimeoffset NOT NULL,
        [LeaseUntil] datetimeoffset NULL,
        [LeaseOwner] nvarchar(128) NULL,
        [LastErrorCode] nvarchar(64) NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [ProcessedAt] datetimeoffset NULL,
        CONSTRAINT [PK_OutboxEvents] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_OutboxEvents_State] CHECK ([State] IN (N'pending', N'processing', N'succeeded', N'retry_wait', N'dead_letter'))
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [identity].[Permissions] (
        [Id] uniqueidentifier NOT NULL,
        [Resource] nvarchar(64) NOT NULL,
        [Action] nvarchar(64) NOT NULL,
        CONSTRAINT [PK_Permissions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [identity].[Roles] (
        [Id] uniqueidentifier NOT NULL,
        [Code] nvarchar(64) NOT NULL,
        [Name] nvarchar(128) NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [ops].[SyncJobs] (
        [Id] uniqueidentifier NOT NULL,
        [System] nvarchar(32) NOT NULL,
        [Direction] nvarchar(16) NOT NULL,
        [ObjectType] nvarchar(64) NOT NULL,
        [ObjectId] nvarchar(128) NOT NULL,
        [IdempotencyKey] nvarchar(256) NOT NULL,
        [State] nvarchar(32) NOT NULL,
        [Attempts] int NOT NULL,
        [NextAttemptAt] datetimeoffset NOT NULL,
        [LastErrorCode] nvarchar(64) NULL,
        [CorrelationId] nvarchar(128) NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_SyncJobs] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_SyncJobs_State] CHECK ([State] IN (N'pending', N'running', N'succeeded', N'retry_wait', N'action_required', N'unknown_outcome'))
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [identity].[Users] (
        [Id] uniqueidentifier NOT NULL,
        [Email] nvarchar(320) NOT NULL,
        [NormalizedEmail] nvarchar(320) NOT NULL,
        [PasswordHash] nvarchar(512) NULL,
        [Kind] nvarchar(16) NOT NULL,
        [Status] nvarchar(32) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Users_Kind] CHECK ([Kind] IN (N'customer', N'staff')),
        CONSTRAINT [CK_Users_Status] CHECK ([Status] IN (N'pending_verification', N'active', N'disabled'))
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [identity].[RolePermissions] (
        [RoleId] uniqueidentifier NOT NULL,
        [PermissionId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([RoleId], [PermissionId]),
        CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [identity].[Permissions] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RolePermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [identity].[Roles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [ops].[SyncAttempts] (
        [Id] bigint NOT NULL IDENTITY,
        [SyncJobId] uniqueidentifier NOT NULL,
        [AttemptNumber] int NOT NULL,
        [StartedAt] datetimeoffset NOT NULL,
        [FinishedAt] datetimeoffset NULL,
        [Outcome] nvarchar(32) NULL,
        [ErrorCode] nvarchar(64) NULL,
        [ProviderReference] nvarchar(256) NULL,
        CONSTRAINT [PK_SyncAttempts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SyncAttempts_SyncJobs_SyncJobId] FOREIGN KEY ([SyncJobId]) REFERENCES [ops].[SyncJobs] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE TABLE [identity].[UserRoles] (
        [UserId] uniqueidentifier NOT NULL,
        [RoleId] uniqueidentifier NOT NULL,
        [AssignedAt] datetimeoffset NOT NULL,
        [AssignedByUserId] uniqueidentifier NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [identity].[Roles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_Assets_OwnerType_OwnerId] ON [media].[Assets] ([OwnerType], [OwnerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Assets_StorageKey] ON [media].[Assets] ([StorageKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_ActorUserId] ON [ops].[AuditLogs] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_EntityType_EntityId_OccurredAt] ON [ops].[AuditLogs] ([EntityType], [EntityId], [OccurredAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_OccurredAt] ON [ops].[AuditLogs] ([OccurredAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ExternalMappings_System_EntityType_ExternalId] ON [ops].[ExternalMappings] ([System], [EntityType], [ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ExternalMappings_System_EntityType_LocalId] ON [ops].[ExternalMappings] ([System], [EntityType], [LocalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_InboxEvents_State_ReceivedAt] ON [ops].[InboxEvents] ([State], [ReceivedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_OutboxEvents_AggregateType_AggregateId_CreatedAt] ON [ops].[OutboxEvents] ([AggregateType], [AggregateId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_OutboxEvents_State_NextAttemptAt] ON [ops].[OutboxEvents] ([State], [NextAttemptAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Permissions_Resource_Action] ON [identity].[Permissions] ([Resource], [Action]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_RolePermissions_PermissionId] ON [identity].[RolePermissions] ([PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_Code] ON [identity].[Roles] ([Code]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SyncAttempts_SyncJobId_AttemptNumber] ON [ops].[SyncAttempts] ([SyncJobId], [AttemptNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SyncJobs_System_IdempotencyKey] ON [ops].[SyncJobs] ([System], [IdempotencyKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_SyncJobs_System_State_NextAttemptAt] ON [ops].[SyncJobs] ([System], [State], [NextAttemptAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE INDEX [IX_UserRoles_RoleId] ON [identity].[UserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_NormalizedEmail] ON [identity].[Users] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007090524_InitialCore'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261007090524_InitialCore', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    IF SCHEMA_ID(N'catalog') IS NULL EXEC(N'CREATE SCHEMA [catalog];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE TABLE [catalog].[Announcements] (
        [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Title] nvarchar(120) NOT NULL,
        [Body] nvarchar(4000) NOT NULL,
        [Kind] nvarchar(16) NOT NULL,
        [PublishedAt] datetimeoffset NOT NULL,
        [Position] int NOT NULL,
        CONSTRAINT [PK_Announcements] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE TABLE [catalog].[Categories] (
        [Name] nvarchar(80) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [NormalizedName] nvarchar(80) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Position] int NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Name])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE TABLE [catalog].[Content] (
        [Id] int NOT NULL,
        [HomeJson] nvarchar(max) NOT NULL,
        [AnnouncementsDefined] bit NOT NULL,
        CONSTRAINT [PK_Content] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Content_HomeJson] CHECK (ISJSON([HomeJson]) = 1),
        CONSTRAINT [CK_Content_Singleton] CHECK ([Id] = 1)
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE TABLE [catalog].[Products] (
        [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Name] nvarchar(120) NOT NULL,
        [CategoryName] nvarchar(80) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Active] bit NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [SeoTitle] nvarchar(max) NOT NULL,
        [Personalizable] bit NULL,
        [OriginalImage] nvarchar(max) NULL,
        [GalleryJson] nvarchar(max) NULL,
        [SpecsJson] nvarchar(max) NULL,
        [Position] int NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Products_GalleryJson] CHECK ([GalleryJson] IS NULL OR ISJSON([GalleryJson]) = 1),
        CONSTRAINT [CK_Products_SpecsJson] CHECK ([SpecsJson] IS NULL OR ISJSON([SpecsJson]) = 1),
        CONSTRAINT [FK_Products_Categories_CategoryName] FOREIGN KEY ([CategoryName]) REFERENCES [catalog].[Categories] ([Name]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE TABLE [catalog].[Variants] (
        [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [ProductId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Sku] nvarchar(256) NOT NULL,
        [NormalizedSku] nvarchar(256) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Color] nvarchar(max) NOT NULL,
        [Stock] int NOT NULL,
        [Image] nvarchar(max) NOT NULL,
        [Hex] nvarchar(7) NULL,
        [SurfaceMask] nvarchar(max) NULL,
        [SurfaceImage] nvarchar(max) NULL,
        [Position] int NOT NULL,
        CONSTRAINT [PK_Variants] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Variants_Stock] CHECK ([Stock] >= 0),
        CONSTRAINT [FK_Variants_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE TABLE [catalog].[VariantPrices] (
        [VariantId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Cents] bigint NOT NULL,
        CONSTRAINT [PK_VariantPrices] PRIMARY KEY ([VariantId]),
        CONSTRAINT [CK_VariantPrices_Cents] CHECK ([Cents] > 0 AND [Cents] <= 999999999),
        CONSTRAINT [FK_VariantPrices_Variants_VariantId] FOREIGN KEY ([VariantId]) REFERENCES [catalog].[Variants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_NormalizedName] ON [catalog].[Categories] ([NormalizedName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE INDEX [IX_Products_Active_CategoryName] ON [catalog].[Products] ([Active], [CategoryName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryName] ON [catalog].[Products] ([CategoryName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Variants_NormalizedSku] ON [catalog].[Variants] ([NormalizedSku]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    CREATE INDEX [IX_Variants_ProductId] ON [catalog].[Variants] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009120332_CatalogCommerce'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261009120332_CatalogCommerce', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    IF SCHEMA_ID(N'sales') IS NULL EXEC(N'CREATE SCHEMA [sales];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    ALTER TABLE [identity].[Users] ADD [DisplayName] nvarchar(80) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    ALTER TABLE [identity].[Users] ADD [Phone] nvarchar(24) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE TABLE [identity].[AccessSessions] (
        [TokenHash] char(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_AccessSessions] PRIMARY KEY ([TokenHash]),
        CONSTRAINT [FK_AccessSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE TABLE [identity].[CustomerAddresses] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Title] nvarchar(40) NOT NULL,
        [FullName] nvarchar(80) NOT NULL,
        [Phone] nvarchar(24) NOT NULL,
        [City] nvarchar(40) NOT NULL,
        [District] nvarchar(60) NOT NULL,
        [Line] nvarchar(250) NOT NULL,
        [PostalCode] nvarchar(5) NULL,
        [IsDefault] bit NOT NULL,
        [Position] int NOT NULL,
        CONSTRAINT [PK_CustomerAddresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CustomerAddresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE TABLE [sales].[Orders] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [ClientRequestId] nvarchar(80) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Number] nvarchar(64) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [Status] nvarchar(32) NOT NULL,
        [AddressSnapshotJson] nvarchar(max) NOT NULL,
        [TotalCents] bigint NOT NULL,
        [Currency] char(3) NOT NULL,
        [ShipmentJson] nvarchar(max) NULL,
        [HistoryJson] nvarchar(max) NULL,
        [RequestsJson] nvarchar(max) NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Orders_AddressSnapshot] CHECK (ISJSON([AddressSnapshotJson]) = 1),
        CONSTRAINT [CK_Orders_History] CHECK ([HistoryJson] IS NULL OR ISJSON([HistoryJson]) = 1),
        CONSTRAINT [CK_Orders_Requests] CHECK ([RequestsJson] IS NULL OR ISJSON([RequestsJson]) = 1),
        CONSTRAINT [CK_Orders_Shipment] CHECK ([ShipmentJson] IS NULL OR ISJSON([ShipmentJson]) = 1),
        CONSTRAINT [CK_Orders_Total] CHECK ([TotalCents] >= 0),
        CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE TABLE [identity].[RefreshSessions] (
        [TokenHash] char(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [FamilyId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [UsedAt] datetimeoffset NULL,
        [RevokedAt] datetimeoffset NULL,
        CONSTRAINT [PK_RefreshSessions] PRIMARY KEY ([TokenHash]),
        CONSTRAINT [FK_RefreshSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE TABLE [sales].[OrderLines] (
        [OrderId] uniqueidentifier NOT NULL,
        [Position] int NOT NULL,
        [ProductReference] nvarchar(128) NOT NULL,
        [VariantReference] nvarchar(128) NOT NULL,
        [Name] nvarchar(120) NOT NULL,
        [Color] nvarchar(max) NOT NULL,
        [ImageUrl] nvarchar(max) NULL,
        [UnitPriceCents] bigint NOT NULL,
        [Quantity] int NOT NULL,
        [LineTotalCents] bigint NOT NULL,
        [Currency] char(3) NOT NULL,
        CONSTRAINT [PK_OrderLines] PRIMARY KEY ([OrderId], [Position]),
        CONSTRAINT [CK_OrderLines_Amounts] CHECK ([UnitPriceCents] > 0 AND [LineTotalCents] = [UnitPriceCents] * CONVERT(bigint, [Quantity])),
        CONSTRAINT [CK_OrderLines_Position] CHECK ([Position] >= 0),
        CONSTRAINT [CK_OrderLines_Quantity] CHECK ([Quantity] >= 1 AND [Quantity] <= 99),
        CONSTRAINT [FK_OrderLines_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [sales].[Orders] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_AccessSessions_ExpiresAt] ON [identity].[AccessSessions] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_AccessSessions_UserId_ExpiresAt] ON [identity].[AccessSessions] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_CustomerAddresses_UserId] ON [identity].[CustomerAddresses] ([UserId]) WHERE [IsDefault] = 1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_Orders_Number] ON [sales].[Orders] ([Number]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_Orders_Status_CreatedAt] ON [sales].[Orders] ([Status], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_UserId_ClientRequestId] ON [sales].[Orders] ([UserId], [ClientRequestId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_Orders_UserId_CreatedAt] ON [sales].[Orders] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_RefreshSessions_ExpiresAt] ON [identity].[RefreshSessions] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_RefreshSessions_FamilyId] ON [identity].[RefreshSessions] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    CREATE INDEX [IX_RefreshSessions_UserId_ExpiresAt] ON [identity].[RefreshSessions] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009132316_CustomerIdentityOrders'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261009132316_CustomerIdentityOrders', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009135019_FeatureDocuments'
)
BEGIN
    CREATE TABLE [ops].[FeatureDocuments] (
        [Name] nvarchar(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Json] nvarchar(max) NOT NULL,
        [UpdatedAt] datetimeoffset NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_FeatureDocuments] PRIMARY KEY ([Name]),
        CONSTRAINT [CK_FeatureDocuments_Json] CHECK (ISJSON([Json]) = 1)
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009135019_FeatureDocuments'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261009135019_FeatureDocuments', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009141900_OrderLinePersonalization'
)
BEGIN
    ALTER TABLE [sales].[OrderLines] ADD [PersonalizationJson] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009141900_OrderLinePersonalization'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[OrderLines] ADD CONSTRAINT [CK_OrderLines_Personalization] CHECK ([PersonalizationJson] IS NULL OR ISJSON([PersonalizationJson]) = 1)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009141900_OrderLinePersonalization'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261009141900_OrderLinePersonalization', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    CREATE TABLE [identity].[AdminInvitations] (
        [Id] uniqueidentifier NOT NULL,
        [Email] nvarchar(320) NOT NULL,
        [NormalizedEmail] nvarchar(320) NOT NULL,
        [TokenHash] varchar(64) NOT NULL,
        [InvitedByUserId] uniqueidentifier NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [ExpiresAt] datetimeoffset NOT NULL,
        [AcceptedAt] datetimeoffset NULL,
        [AcceptedUserId] uniqueidentifier NULL,
        [CancelledAt] datetimeoffset NULL,
        [CancelledByUserId] uniqueidentifier NULL,
        CONSTRAINT [PK_AdminInvitations] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_AdminInvitations_AcceptedUser] CHECK (([AcceptedAt] IS NULL AND [AcceptedUserId] IS NULL) OR ([AcceptedAt] IS NOT NULL AND [AcceptedUserId] IS NOT NULL)),
        CONSTRAINT [CK_AdminInvitations_CancelledBy] CHECK (([CancelledAt] IS NULL AND [CancelledByUserId] IS NULL) OR ([CancelledAt] IS NOT NULL AND [CancelledByUserId] IS NOT NULL)),
        CONSTRAINT [CK_AdminInvitations_Expiry] CHECK ([ExpiresAt] > [CreatedAt]),
        CONSTRAINT [CK_AdminInvitations_Outcome] CHECK (NOT ([AcceptedAt] IS NOT NULL AND [CancelledAt] IS NOT NULL)),
        CONSTRAINT [FK_AdminInvitations_Users_AcceptedUserId] FOREIGN KEY ([AcceptedUserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AdminInvitations_Users_CancelledByUserId] FOREIGN KEY ([CancelledByUserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AdminInvitations_Users_InvitedByUserId] FOREIGN KEY ([InvitedByUserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    CREATE INDEX [IX_AdminInvitations_AcceptedUserId] ON [identity].[AdminInvitations] ([AcceptedUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    CREATE INDEX [IX_AdminInvitations_CancelledByUserId] ON [identity].[AdminInvitations] ([CancelledByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    CREATE INDEX [IX_AdminInvitations_InvitedByUserId] ON [identity].[AdminInvitations] ([InvitedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    CREATE INDEX [IX_AdminInvitations_NormalizedEmail_ExpiresAt] ON [identity].[AdminInvitations] ([NormalizedEmail], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AdminInvitations_TokenHash] ON [identity].[AdminInvitations] ([TokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012115009_AdminInvitations'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261012115009_AdminInvitations', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013072705_CustomerFavorites'
)
BEGIN
    CREATE TABLE [identity].[Favorites] (
        [UserId] uniqueidentifier NOT NULL,
        [ProductId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Favorites] PRIMARY KEY ([UserId], [ProductId]),
        CONSTRAINT [FK_Favorites_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013072705_CustomerFavorites'
)
BEGIN
    CREATE INDEX [IX_Favorites_UserId_CreatedAt] ON [identity].[Favorites] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013072705_CustomerFavorites'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013072705_CustomerFavorites', N'10.0.12');
END;

COMMIT;
GO
