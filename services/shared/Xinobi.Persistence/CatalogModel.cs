using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence.Entities;

namespace Xinobi.Persistence;

internal static class CatalogModel
{
    private const string Exact = "Latin1_General_100_BIN2";

    public static void Configure(ModelBuilder model)
    {
        model.Entity<CatalogCategory>(category =>
        {
            category.ToTable("Categories", "catalog");
            category.HasKey(x => x.Name);
            category.Property(x => x.Name).HasMaxLength(80).UseCollation(Exact);
            category.Property(x => x.NormalizedName).HasMaxLength(80).UseCollation(Exact);
            category.HasIndex(x => x.NormalizedName).IsUnique();
        });
        model.Entity<CatalogProduct>(product =>
        {
            product.ToTable("Products", "catalog", table =>
            {
                table.HasCheckConstraint("CK_Products_GalleryJson", "[GalleryJson] IS NULL OR ISJSON([GalleryJson]) = 1");
                table.HasCheckConstraint("CK_Products_SpecsJson", "[SpecsJson] IS NULL OR ISJSON([SpecsJson]) = 1");
            });
            product.HasKey(x => x.Id);
            product.Property(x => x.Id).HasMaxLength(128).UseCollation(Exact);
            product.Property(x => x.Name).HasMaxLength(120);
            product.Property(x => x.CategoryName).HasMaxLength(80).UseCollation(Exact);
            product.HasOne<CatalogCategory>().WithMany().HasForeignKey(x => x.CategoryName).OnDelete(DeleteBehavior.Restrict);
            product.HasIndex(x => new { x.Active, x.CategoryName });
        });
        model.Entity<CatalogVariant>(variant =>
        {
            variant.ToTable("Variants", "catalog", table => table.HasCheckConstraint("CK_Variants_Stock", "[Stock] >= 0"));
            variant.HasKey(x => x.Id);
            variant.Property(x => x.Id).HasMaxLength(128).UseCollation(Exact);
            variant.Property(x => x.ProductId).HasMaxLength(128).UseCollation(Exact);
            variant.Property(x => x.Sku).HasMaxLength(256);
            variant.Property(x => x.NormalizedSku).HasMaxLength(256).UseCollation(Exact);
            variant.Property(x => x.Hex).HasMaxLength(7);
            variant.HasIndex(x => x.NormalizedSku).IsUnique();
            variant.HasOne<CatalogProduct>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<CatalogVariantPrice>(price =>
        {
            price.ToTable("VariantPrices", "catalog", table => table.HasCheckConstraint("CK_VariantPrices_Cents", "[Cents] > 0 AND [Cents] <= 999999999"));
            price.HasKey(x => x.VariantId);
            price.Property(x => x.VariantId).HasMaxLength(128).UseCollation(Exact);
            price.HasOne<CatalogVariant>().WithOne().HasForeignKey<CatalogVariantPrice>(x => x.VariantId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<CatalogContent>(content =>
        {
            content.ToTable("Content", "catalog", table =>
            {
                table.HasCheckConstraint("CK_Content_Singleton", "[Id] = 1");
                table.HasCheckConstraint("CK_Content_HomeJson", "ISJSON([HomeJson]) = 1");
            });
            content.Property(x => x.Id).ValueGeneratedNever();
        });
        model.Entity<CatalogAnnouncement>(announcement =>
        {
            announcement.ToTable("Announcements", "catalog");
            announcement.Property(x => x.Id).HasMaxLength(128).UseCollation(Exact);
            announcement.Property(x => x.Title).HasMaxLength(120);
            announcement.Property(x => x.Body).HasMaxLength(4000);
            announcement.Property(x => x.Kind).HasMaxLength(16);
        });
    }
}
