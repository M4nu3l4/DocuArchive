using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocuArchive.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "Documents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedByUserId",
                table: "Documents",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedToUserId",
                table: "Documents",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_AssignedByUserId",
                table: "Documents",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_AssignedToUserId",
                table: "Documents",
                column: "AssignedToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_AssignedByUserId",
                table: "Documents",
                column: "AssignedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_AssignedToUserId",
                table: "Documents",
                column: "AssignedToUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_AssignedByUserId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_AssignedToUserId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_AssignedByUserId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_AssignedToUserId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "AssignedByUserId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "Documents");
        }
    }
}
