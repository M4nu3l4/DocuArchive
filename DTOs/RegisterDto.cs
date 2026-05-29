using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Nome obbligatorio.")]
        [MaxLength(80)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Cognome obbligatorio.")]
        [MaxLength(80)]
        public string Cognome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email obbligatoria.")]
        [EmailAddress(ErrorMessage = "Email non valida.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password obbligatoria.")]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "Operatore";
    }
}