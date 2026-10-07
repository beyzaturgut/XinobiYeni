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

