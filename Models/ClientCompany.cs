using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class ClientCompany
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string RagioneSociale { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        public bool Attivo { get; set; } = true;

        public List<Document> Documents { get; set; } = new();
    }
}