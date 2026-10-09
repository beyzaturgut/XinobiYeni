using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence.Entities;

namespace Xinobi.Persistence;

internal static class CustomerCommerceModel
{
    public static void Configure(ModelBuilder model)
    {
        model.Entity<User>().Property(x => x.DisplayName).HasMaxLength(80);
        model.Entity<User>().Property(x => x.Phone).HasMaxLength(24);
        model.Entity<AccessSession>(session =>
        {
            session.ToTable("AccessSessions", "identity");
            session.HasKey(x => x.TokenHash);
            session.Property(x => x.TokenHash).HasColumnType("char(64)").UseCollation("Latin1_General_100_BIN2");
            session.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            session.HasIndex(x => new { x.UserId, x.ExpiresAt });
            session.HasIndex(x => x.ExpiresAt);
        });
        model.Entity<RefreshSession>(session =>
        {
            session.ToTable("RefreshSessions", "identity");
            session.HasKey(x => x.TokenHash);
            session.Property(x => x.TokenHash).HasColumnType("char(64)").UseCollation("Latin1_General_100_BIN2");
            session.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            session.HasIndex(x => x.FamilyId);
            session.HasIndex(x => new { x.UserId, x.ExpiresAt });
            session.HasIndex(x => x.ExpiresAt);
        });
        model.Entity<CustomerDeliveryAddress>(address =>
        {
            address.ToTable("CustomerAddresses", "identity");
            address.Property(x => x.Id).ValueGeneratedNever();
            address.Property(x => x.Title).HasMaxLength(40);
            address.Property(x => x.FullName).HasMaxLength(80);
            address.Property(x => x.Phone).HasMaxLength(24);
            address.Property(x => x.City).HasMaxLength(40);
            address.Property(x => x.District).HasMaxLength(60);
            address.Property(x => x.Line).HasMaxLength(250);
            address.Property(x => x.PostalCode).HasMaxLength(5);
            address.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            address.HasIndex(x => x.UserId).IsUnique().HasFilter("[IsDefault] = 1");
        });
        model.Entity<SalesOrder>(order =>
        {
            order.ToTable("Orders", "sales", table =>
            {
                table.HasCheckConstraint("CK_Orders_Total", "[TotalCents] >= 0");
                table.HasCheckConstraint("CK_Orders_AddressSnapshot", "ISJSON([AddressSnapshotJson]) = 1");
                table.HasCheckConstraint("CK_Orders_Shipment", "[ShipmentJson] IS NULL OR ISJSON([ShipmentJson]) = 1");
                table.HasCheckConstraint("CK_Orders_History", "[HistoryJson] IS NULL OR ISJSON([HistoryJson]) = 1");
                table.HasCheckConstraint("CK_Orders_Requests", "[RequestsJson] IS NULL OR ISJSON([RequestsJson]) = 1");
            });
            order.Property(x => x.Id).ValueGeneratedNever();
            order.Property(x => x.ClientRequestId).HasMaxLength(80).UseCollation("Latin1_General_100_BIN2");
            order.Property(x => x.Number).HasMaxLength(64);
            order.Property(x => x.Status).HasMaxLength(32);
            order.Property(x => x.Currency).HasColumnType("char(3)");
            order.Property(x => x.RowVersion).IsRowVersion();
            // Retention/deletion is D10: deleting a user must never silently cascade into historical orders.
            order.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            order.HasIndex(x => new { x.UserId, x.ClientRequestId }).IsUnique();
            order.HasIndex(x => new { x.UserId, x.CreatedAt });
            order.HasIndex(x => new { x.Status, x.CreatedAt });
            // Current demo numbers are random and may collide; do not make historical imports fail on that field.
            order.HasIndex(x => x.Number);
        });
        model.Entity<SalesOrderLine>(line =>
        {
            line.ToTable("OrderLines", "sales", table =>
            {
                table.HasCheckConstraint("CK_OrderLines_Position", "[Position] >= 0");
                table.HasCheckConstraint("CK_OrderLines_Quantity", "[Quantity] >= 1 AND [Quantity] <= 99");
                table.HasCheckConstraint("CK_OrderLines_Amounts", "[UnitPriceCents] > 0 AND [LineTotalCents] = [UnitPriceCents] * CONVERT(bigint, [Quantity])");
                table.HasCheckConstraint("CK_OrderLines_Personalization", "[PersonalizationJson] IS NULL OR ISJSON([PersonalizationJson]) = 1");
            });
            line.HasKey(x => new { x.OrderId, x.Position });
            line.Property(x => x.ProductReference).HasMaxLength(128);
            line.Property(x => x.VariantReference).HasMaxLength(128);
            line.Property(x => x.Name).HasMaxLength(120);
            line.Property(x => x.Currency).HasColumnType("char(3)");
            line.HasOne<SalesOrder>().WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            // No FK to current products/variants: historical snapshots survive catalog edits and removals.
        });
    }
}
