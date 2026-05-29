using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        public bool Attiva { get; set; } = true;

        public List<Document> Documents { get; set; } = new();
    }
}