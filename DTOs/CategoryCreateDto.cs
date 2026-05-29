using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class CategoryCreateDto
    {
        [Required(ErrorMessage = "Il nome categoria è obbligatorio.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;
    }
}