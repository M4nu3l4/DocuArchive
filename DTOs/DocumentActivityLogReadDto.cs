namespace DocuArchive.DTOs
{
    public class DocumentActivityLogReadDto
    {
        public int Id { get; set; }

        public int DocumentId { get; set; }

        public string DocumentTitle { get; set; } = string.Empty;

        public string? UserId { get; set; }

        public string UserFullName { get; set; } = string.Empty;

        public string Action { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}