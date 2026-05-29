using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocuArchive.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentLock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LockedAt",
                table: "Documents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LockedByUserId",
                table: "Documents",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_LockedByUserId",
                table: "Documents",
                column: "LockedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_LockedByUserId",
                table: "Documents",
                column: "LockedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_LockedByUserId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_LockedByUserId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "LockedAt",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "LockedByUserId",
                table: "Documents");
        }
    }
}
