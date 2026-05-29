using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class UserPreferencesUpdateDto
    {
        [Required]
        public string PreferredLanguage { get; set; } = "it";

        [Required]
        public string PreferredTheme { get; set; } = "light";
    }
}