using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Xinobi.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdminInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminInvitations",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    TokenHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    InvitedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AcceptedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AcceptedUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CancelledAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CancelledByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminInvitations", x => x.Id);
                    table.CheckConstraint("CK_AdminInvitations_AcceptedUser", "([AcceptedAt] IS NULL AND [AcceptedUserId] IS NULL) OR ([AcceptedAt] IS NOT NULL AND [AcceptedUserId] IS NOT NULL)");
                    table.CheckConstraint("CK_AdminInvitations_CancelledBy", "([CancelledAt] IS NULL AND [CancelledByUserId] IS NULL) OR ([CancelledAt] IS NOT NULL AND [CancelledByUserId] IS NOT NULL)");
                    table.CheckConstraint("CK_AdminInvitations_Expiry", "[ExpiresAt] > [CreatedAt]");
                    table.CheckConstraint("CK_AdminInvitations_Outcome", "NOT ([AcceptedAt] IS NOT NULL AND [CancelledAt] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_AdminInvitations_Users_AcceptedUserId",
                        column: x => x.AcceptedUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AdminInvitations_Users_CancelledByUserId",
                        column: x => x.CancelledByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AdminInvitations_Users_InvitedByUserId",
                        column: x => x.InvitedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminInvitations_AcceptedUserId",
                schema: "identity",
                table: "AdminInvitations",
                column: "AcceptedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminInvitations_CancelledByUserId",
                schema: "identity",
                table: "AdminInvitations",
                column: "CancelledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminInvitations_InvitedByUserId",
                schema: "identity",
                table: "AdminInvitations",
                column: "InvitedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminInvitations_NormalizedEmail_ExpiresAt",
                schema: "identity",
                table: "AdminInvitations",
                columns: new[] { "NormalizedEmail", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdminInvitations_TokenHash",
                schema: "identity",
                table: "AdminInvitations",
                column: "TokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminInvitations",
                schema: "identity");
        }
    }
}
