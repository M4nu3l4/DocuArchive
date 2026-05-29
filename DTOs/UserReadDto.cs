namespace DocuArchive.DTOs
{
    public class UserReadDto
    {
        public string Id { get; set; } = string.Empty;

        public string Nome { get; set; } = string.Empty;

        public string Cognome { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public bool Attivo { get; set; }

        public string PreferredLanguage { get; set; } = "it";

        public string PreferredTheme { get; set; } = "light";

        public List<string> Roles { get; set; } = new();
    }
}