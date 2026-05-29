using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class CategoryUpdateDto
    {
        [Required(ErrorMessage = "Il nome categoria è obbligatorio.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        public bool Attiva { get; set; } = true;
    }
}