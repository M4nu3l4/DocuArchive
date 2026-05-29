using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class DocumentWorkflowStatusCreateDto
    {
        [Required(ErrorMessage = "Il nome dello stato è obbligatorio.")]
        [MaxLength(80)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Colore { get; set; } = "secondary";

        public int Ordine { get; set; } = 0;
    }
}