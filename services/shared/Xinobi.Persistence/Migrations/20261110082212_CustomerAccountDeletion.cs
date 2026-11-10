using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Xinobi.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CustomerAccountDeletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_Status",
                schema: "identity",
                table: "Users");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_Status",
                schema: "identity",
                table: "Users",
                sql: "[Status] IN (N'pending_verification', N'active', N'disabled', N'deleted')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF EXISTS (SELECT 1 FROM [identity].[Users] WHERE [Status] = N'deleted') THROW 51000, 'Deleted accounts exist; restore a verified backup or use a forward migration. Accounts will not be reactivated.', 1;");
            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_Status",
                schema: "identity",
                table: "Users");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_Status",
                schema: "identity",
                table: "Users",
                sql: "[Status] IN (N'pending_verification', N'active', N'disabled')");
        }
    }
}
