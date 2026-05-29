using System.ComponentModel.DataAnnotations;

namespace DocuArchive.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public ApplicationUser? User { get; set; }

        [MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public int? DocumentId { get; set; }

        public Document? Document { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}