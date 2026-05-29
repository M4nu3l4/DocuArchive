using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocuArchive.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkflowStatusId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DocumentWorkflowStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Colore = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Attivo = table.Column<bool>(type: "bit", nullable: false),
                    Ordine = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentWorkflowStatuses", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "DocumentWorkflowStatuses",
                columns: new[] { "Id", "Attivo", "Colore", "Nome", "Ordine" },
                values: new object[,]
                {
                    { 1, true, "secondary", "Acquisita", 1 },
                    { 2, true, "warning", "In pending", 2 },
                    { 3, true, "primary", "In lavorazione", 3 },
                    { 4, true, "success", "Attiva", 4 },
                    { 5, true, "danger", "Dismessa", 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_WorkflowStatusId",
                table: "Documents",
                column: "WorkflowStatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_DocumentWorkflowStatuses_WorkflowStatusId",
                table: "Documents",
                column: "WorkflowStatusId",
                principalTable: "DocumentWorkflowStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_DocumentWorkflowStatuses_WorkflowStatusId",
                table: "Documents");

            migrationBuilder.DropTable(
                name: "DocumentWorkflowStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Documents_WorkflowStatusId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "WorkflowStatusId",
                table: "Documents");
        }
    }
}
