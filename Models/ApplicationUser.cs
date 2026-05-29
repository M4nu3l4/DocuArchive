using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(80)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Cognome { get; set; } = string.Empty;

        public bool Attivo { get; set; } = true;

     

        [MaxLength(10)]
        public string PreferredLanguage { get; set; } = "it";

        [MaxLength(20)]
        public string PreferredTheme { get; set; } = "light";
    }
}