using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class DocumentWorkflowStatus
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Colore { get; set; } = "secondary";

        public bool Attivo { get; set; } = true;

        public int Ordine { get; set; } = 0;

        public List<Document> Documents { get; set; } = new();
    }
}