using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Xinobi.Persistence.Entities;

namespace Xinobi.Persistence;

/// <summary>
/// Faz03 03.05 core schema: identity/roles, audit, outbox/inbox, sync jobs, external mappings and asset metadata.
/// Business modules (catalog, orders, design…) add their own migrations in later phases; these tables are not recreated.
/// </summary>
public sealed class XinobiDbContext(DbContextOptions<XinobiDbContext> options) : DbContext(options)
{
    public const string IdentitySchema = "identity";
    public const string OpsSchema = "ops";
    public const string MediaSchema = "media";

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OutboxEvent> OutboxEvents => Set<OutboxEvent>();
    public DbSet<InboxEvent> InboxEvents => Set<InboxEvent>();
    public DbSet<SyncJob> SyncJobs => Set<SyncJob>();
    public DbSet<SyncAttempt> SyncAttempts => Set<SyncAttempt>();
    public DbSet<ExternalMapping> ExternalMappings => Set<ExternalMapping>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<CatalogCategory> CatalogCategories => Set<CatalogCategory>();
    public DbSet<CatalogProduct> CatalogProducts => Set<CatalogProduct>();
    public DbSet<CatalogVariant> CatalogVariants => Set<CatalogVariant>();
    public DbSet<CatalogVariantPrice> CatalogPrices => Set<CatalogVariantPrice>();
    public DbSet<CatalogContent> CatalogContent => Set<CatalogContent>();
    public DbSet<CatalogAnnouncement> CatalogAnnouncements => Set<CatalogAnnouncement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        CatalogModel.Configure(modelBuilder);
        modelBuilder.Entity<User>(user =>
        {
            user.ToTable("Users", IdentitySchema, table =>
            {
                table.HasCheckConstraint("CK_Users_Kind", In("Kind", UserKinds.Customer, UserKinds.Staff));
                table.HasCheckConstraint("CK_Users_Status", In("Status", UserStatuses.PendingVerification, UserStatuses.Active, UserStatuses.Disabled));
            });
            user.Property(x => x.Email).HasMaxLength(320);
            user.Property(x => x.NormalizedEmail).HasMaxLength(320);
            user.Property(x => x.PasswordHash).HasMaxLength(512);
            user.Property(x => x.Kind).HasMaxLength(16);
            user.Property(x => x.Status).HasMaxLength(32);
            user.Property(x => x.RowVersion).IsRowVersion();
            user.HasIndex(x => x.NormalizedEmail).IsUnique();
            user.HasMany(x => x.Roles).WithOne().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Role>(role =>
        {
            role.ToTable("Roles", IdentitySchema);
            role.Property(x => x.Code).HasMaxLength(64);
            role.Property(x => x.Name).HasMaxLength(128);
            role.HasIndex(x => x.Code).IsUnique();
            role.HasMany(x => x.Permissions).WithOne().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(permission =>
        {
            permission.ToTable("Permissions", IdentitySchema);
            permission.Property(x => x.Resource).HasMaxLength(64);
            permission.Property(x => x.Action).HasMaxLength(64);
            permission.HasIndex(x => new { x.Resource, x.Action }).IsUnique();
        });

        modelBuilder.Entity<UserRole>(userRole =>
        {
            userRole.ToTable("UserRoles", IdentitySchema);
            userRole.HasKey(x => new { x.UserId, x.RoleId });
            userRole.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Restrict);
            userRole.HasIndex(x => x.RoleId);
        });

        modelBuilder.Entity<RolePermission>(rolePermission =>
        {
            rolePermission.ToTable("RolePermissions", IdentitySchema);
            rolePermission.HasKey(x => new { x.RoleId, x.PermissionId });
            rolePermission.HasOne(x => x.Permission).WithMany().HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Restrict);
            rolePermission.HasIndex(x => x.PermissionId);
        });

        modelBuilder.Entity<AuditLog>(audit =>
        {
            audit.ToTable("AuditLogs", OpsSchema);
            audit.Property(x => x.Action).HasMaxLength(128);
            audit.Property(x => x.EntityType).HasMaxLength(128);
            audit.Property(x => x.EntityId).HasMaxLength(128);
            audit.Property(x => x.TraceId).HasMaxLength(128);
            audit.HasIndex(x => new { x.EntityType, x.EntityId, x.OccurredAt });
            audit.HasIndex(x => x.OccurredAt);
            audit.HasIndex(x => x.ActorUserId);
        });

        modelBuilder.Entity<OutboxEvent>(outbox =>
        {
            outbox.ToTable("OutboxEvents", OpsSchema, table => table.HasCheckConstraint("CK_OutboxEvents_State", In("State", MessageStates.All)));
            outbox.Property(x => x.EventType).HasMaxLength(128);
            outbox.Property(x => x.AggregateType).HasMaxLength(128);
            outbox.Property(x => x.AggregateId).HasMaxLength(128);
            outbox.Property(x => x.State).HasMaxLength(32);
            outbox.Property(x => x.LeaseOwner).HasMaxLength(128);
            outbox.Property(x => x.LastErrorCode).HasMaxLength(64);
            // Worker claim query: next due rows by state.
            outbox.HasIndex(x => new { x.State, x.NextAttemptAt });
            // Per-aggregate ordering when a consumer needs it.
            outbox.HasIndex(x => new { x.AggregateType, x.AggregateId, x.CreatedAt });
        });

        modelBuilder.Entity<InboxEvent>(inbox =>
        {
            inbox.ToTable("InboxEvents", OpsSchema, table => table.HasCheckConstraint("CK_InboxEvents_State", In("State", MessageStates.All)));
            inbox.HasKey(x => new { x.Provider, x.ExternalEventId });
            inbox.Property(x => x.Provider).HasMaxLength(64);
            inbox.Property(x => x.ExternalEventId).HasMaxLength(256);
            inbox.Property(x => x.EventType).HasMaxLength(128);
            inbox.Property(x => x.PayloadHash).HasMaxLength(64).IsFixedLength();
            inbox.Property(x => x.State).HasMaxLength(32);
            inbox.HasIndex(x => new { x.State, x.ReceivedAt });
        });

        modelBuilder.Entity<SyncJob>(job =>
        {
            job.ToTable("SyncJobs", OpsSchema, table => table.HasCheckConstraint("CK_SyncJobs_State", In("State", SyncJobStates.All)));
            job.Property(x => x.System).HasMaxLength(32);
            job.Property(x => x.Direction).HasMaxLength(16);
            job.Property(x => x.ObjectType).HasMaxLength(64);
            job.Property(x => x.ObjectId).HasMaxLength(128);
            job.Property(x => x.IdempotencyKey).HasMaxLength(256);
            job.Property(x => x.State).HasMaxLength(32);
            job.Property(x => x.LastErrorCode).HasMaxLength(64);
            job.Property(x => x.CorrelationId).HasMaxLength(128);
            job.HasIndex(x => new { x.System, x.IdempotencyKey }).IsUnique();
            job.HasIndex(x => new { x.System, x.State, x.NextAttemptAt });
            job.HasMany(x => x.AttemptHistory).WithOne().HasForeignKey(x => x.SyncJobId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SyncAttempt>(attempt =>
        {
            attempt.ToTable("SyncAttempts", OpsSchema);
            attempt.Property(x => x.Outcome).HasMaxLength(32);
            attempt.Property(x => x.ErrorCode).HasMaxLength(64);
            attempt.Property(x => x.ProviderReference).HasMaxLength(256);
            attempt.HasIndex(x => new { x.SyncJobId, x.AttemptNumber }).IsUnique();
        });

        modelBuilder.Entity<ExternalMapping>(mapping =>
        {
            mapping.ToTable("ExternalMappings", OpsSchema);
            mapping.Property(x => x.System).HasMaxLength(32);
            mapping.Property(x => x.EntityType).HasMaxLength(64);
            mapping.Property(x => x.LocalId).HasMaxLength(128);
            mapping.Property(x => x.ExternalId).HasMaxLength(256);
            mapping.HasIndex(x => new { x.System, x.EntityType, x.LocalId }).IsUnique();
            mapping.HasIndex(x => new { x.System, x.EntityType, x.ExternalId }).IsUnique();
        });

        modelBuilder.Entity<Asset>(asset =>
        {
            asset.ToTable("Assets", MediaSchema, table =>
            {
                table.HasCheckConstraint("CK_Assets_Status", In("Status", AssetStatuses.All));
                table.HasCheckConstraint("CK_Assets_Bytes", "[Bytes] >= 0");
            });
            asset.Property(x => x.OwnerType).HasMaxLength(64);
            asset.Property(x => x.OwnerId).HasMaxLength(128);
            asset.Property(x => x.StorageKey).HasMaxLength(512);
            asset.Property(x => x.Mime).HasMaxLength(128);
            asset.Property(x => x.Sha256).HasMaxLength(64).IsFixedLength();
            asset.Property(x => x.Status).HasMaxLength(32);
            asset.HasIndex(x => x.StorageKey).IsUnique();
            asset.HasIndex(x => new { x.OwnerType, x.OwnerId });
        });
    }

    private static string In(string column, params string[] values) =>
        $"[{column}] IN ({string.Join(", ", values.Select(value => $"N'{value}'"))})";
}
