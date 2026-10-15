using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Xinobi.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdminMfaPersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminMfaChallenges",
                schema: "identity",
                columns: table => new
                {
                    TokenHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodeHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    CredentialStamp = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Attempts = table.Column<int>(type: "int", nullable: false),
                    ConsumedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminMfaChallenges", x => x.TokenHash);
                    table.CheckConstraint("CK_AdminMfaChallenges_Attempts", "[Attempts] >= 0 AND [Attempts] <= 5");
                    table.CheckConstraint("CK_AdminMfaChallenges_Expiry", "[ExpiresAt] > [CreatedAt]");
                    table.ForeignKey(
                        name: "FK_AdminMfaChallenges_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdminMfaGrants",
                schema: "identity",
                columns: table => new
                {
                    TokenHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CredentialStamp = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: true),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminMfaGrants", x => x.TokenHash);
                    table.ForeignKey(
                        name: "FK_AdminMfaGrants_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminMfaChallenges_ExpiresAt",
                schema: "identity",
                table: "AdminMfaChallenges",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_AdminMfaChallenges_UserId_CreatedAt",
                schema: "identity",
                table: "AdminMfaChallenges",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdminMfaGrants_ExpiresAt",
                schema: "identity",
                table: "AdminMfaGrants",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_AdminMfaGrants_UserId",
                schema: "identity",
                table: "AdminMfaGrants",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminMfaChallenges",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "AdminMfaGrants",
                schema: "identity");
        }
    }
}
