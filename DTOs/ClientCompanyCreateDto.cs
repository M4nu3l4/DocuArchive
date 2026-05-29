using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class ClientCompanyCreateDto
    {
        [Required(ErrorMessage = "La ragione sociale è obbligatoria.")]
        [MaxLength(150)]
        public string RagioneSociale { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email non valida.")]
        [MaxLength(150)]
        public string? Email { get; set; }
    }
}