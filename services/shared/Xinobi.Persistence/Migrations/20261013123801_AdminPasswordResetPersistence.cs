using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Xinobi.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdminPasswordResetPersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminPasswordResets",
                schema: "identity",
                columns: table => new
                {
                    TokenHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequiredRole = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    CredentialStamp = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ConsumedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminPasswordResets", x => x.TokenHash);
                    table.CheckConstraint("CK_AdminPasswordResets_Expiry", "[ExpiresAt] > [CreatedAt]");
                    table.CheckConstraint("CK_AdminPasswordResets_Role", "[RequiredRole] IN ('admin','super_admin')");
                    table.ForeignKey(
                        name: "FK_AdminPasswordResets_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminPasswordResets_ExpiresAt",
                schema: "identity",
                table: "AdminPasswordResets",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_AdminPasswordResets_UserId_CreatedAt",
                schema: "identity",
                table: "AdminPasswordResets",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminPasswordResets",
                schema: "identity");
        }
    }
}
