namespace DocuArchive.DTOs
{
    public class NotificationReadDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public int? DocumentId { get; set; }

        public string? DocumentTitle { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}