using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class Document
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Titolo { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Descrizione { get; set; }

        [Required]
        public int CategoriaId { get; set; }

        public Category? Categoria { get; set; }

        [Required]
        public int ClienteId { get; set; }

        public ClientCompany? Cliente { get; set; }

        [MaxLength(255)]
        public string? NomeFile { get; set; }

        [MaxLength(500)]
        public string? PercorsoFile { get; set; }

        [Required]
        public DocumentStatus Stato { get; set; } = DocumentStatus.Bozza;

        public int? WorkflowStatusId { get; set; }

        public DocumentWorkflowStatus? WorkflowStatus { get; set; }

        public DateTime DataCreazione { get; set; } = DateTime.Now;

        public DateTime? DataUltimaModifica { get; set; }

        public string? AssignedToUserId { get; set; }

        public ApplicationUser? AssignedToUser { get; set; }

        public DateTime? AssignedAt { get; set; }

        public string? AssignedByUserId { get; set; }

        public ApplicationUser? AssignedByUser { get; set; }

        public string? LockedByUserId { get; set; }

        public ApplicationUser? LockedByUser { get; set; }

        public DateTime? LockedAt { get; set; }
    }
}