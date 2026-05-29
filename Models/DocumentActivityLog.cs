using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class DocumentActivityLog
    {
        public int Id { get; set; }

        public int DocumentId { get; set; }

        public Document? Document { get; set; }

        public string? UserId { get; set; }

        [MaxLength(180)]
        public string UserFullName { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}