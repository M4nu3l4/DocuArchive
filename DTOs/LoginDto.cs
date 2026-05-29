using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email obbligatoria.")]
        [EmailAddress(ErrorMessage = "Email non valida.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password obbligatoria.")]
        public string Password { get; set; } = string.Empty;
    }
}