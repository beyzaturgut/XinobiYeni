using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Xinobi.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OrderLinePersonalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PersonalizationJson",
                schema: "sales",
                table: "OrderLines",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderLines_Personalization",
                schema: "sales",
                table: "OrderLines",
                sql: "[PersonalizationJson] IS NULL OR ISJSON([PersonalizationJson]) = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderLines_Personalization",
                schema: "sales",
                table: "OrderLines");

            migrationBuilder.DropColumn(
                name: "PersonalizationJson",
                schema: "sales",
                table: "OrderLines");
        }
    }
}
