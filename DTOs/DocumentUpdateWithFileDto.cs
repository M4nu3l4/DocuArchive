using DocuArchive.Models;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class DocumentUpdateWithFileDto
    {
        [Required(ErrorMessage = "Il titolo è obbligatorio.")]
        [MaxLength(150, ErrorMessage = "Il titolo non può superare 150 caratteri.")]
        public string Titolo { get; set; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "La descrizione non può superare 1000 caratteri.")]
        public string? Descrizione { get; set; }

        [Required(ErrorMessage = "La categoria è obbligatoria.")]
        public int CategoriaId { get; set; }

        [Required(ErrorMessage = "Il cliente/azienda è obbligatorio.")]
        public int ClienteId { get; set; }

        [Required(ErrorMessage = "Lo stato è obbligatorio.")]
        public DocumentStatus Stato { get; set; }

        public IFormFile? File { get; set; }

        public bool RemoveFile { get; set; } = false;

        public int? WorkflowStatusId { get; set; }
    }
}