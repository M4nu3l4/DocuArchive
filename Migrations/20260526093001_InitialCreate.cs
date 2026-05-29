using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocuArchive.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Attiva = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClientCompanies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RagioneSociale = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Attivo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCompanies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titolo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Descrizione = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: false),
                    NomeFile = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PercorsoFile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Stato = table.Column<int>(type: "int", nullable: false),
                    DataCreazione = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaModifica = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Categories_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_ClientCompanies_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "ClientCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Attiva", "Nome" },
                values: new object[,]
                {
                    { 1, true, "Contratti" },
                    { 2, true, "Fatture" },
                    { 3, true, "Documenti Interni" }
                });

            migrationBuilder.InsertData(
                table: "ClientCompanies",
                columns: new[] { "Id", "Attivo", "Email", "RagioneSociale" },
                values: new object[,]
                {
                    { 1, true, "info@techsolutions.it", "Tech Solutions SRL" },
                    { 2, true, "contatti@greenenergy.it", "Green Energy SPA" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CategoriaId",
                table: "Documents",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ClienteId",
                table: "Documents",
                column: "ClienteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "ClientCompanies");
        }
    }
}
