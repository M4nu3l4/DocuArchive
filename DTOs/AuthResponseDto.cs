namespace DocuArchive.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public DateTime Expiration { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Nome { get; set; } = string.Empty;

        public string Cognome { get; set; } = string.Empty;

        public List<string> Roles { get; set; } = new();

        public string PreferredLanguage { get; set; } = "it";

        public string PreferredTheme { get; set; } = "light";
    }
}