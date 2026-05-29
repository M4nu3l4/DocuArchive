using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class DocumentWorkflowStatusUpdateDto
    {
        [Required(ErrorMessage = "Il nome dello stato è obbligatorio.")]
        [MaxLength(80)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Colore { get; set; } = "secondary";

        public bool Attivo { get; set; } = true;

        public int Ordine { get; set; } = 0;
    }
}