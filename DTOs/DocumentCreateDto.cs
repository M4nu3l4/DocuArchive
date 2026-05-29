using DocuArchive.Models;
using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class DocumentCreateDto
    {
        [Required(ErrorMessage = "Il titolo è obbligatorio.")]
        [MaxLength(150)]
        public string Titolo { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Descrizione { get; set; }

        [Required(ErrorMessage = "La categoria è obbligatoria.")]
        public int CategoriaId { get; set; }

        [Required(ErrorMessage = "Il cliente/azienda è obbligatorio.")]
        public int ClienteId { get; set; }

        [MaxLength(255)]
        public string? NomeFile { get; set; }

        [MaxLength(500)]
        public string? PercorsoFile { get; set; }

        [Required]
        public DocumentStatus Stato { get; set; } = DocumentStatus.Bozza;

        public int? WorkflowStatusId { get; set; }
    }
}