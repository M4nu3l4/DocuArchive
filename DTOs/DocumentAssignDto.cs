using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class DocumentAssignDto
    {
        [Required]
        public string AssignedToUserId { get; set; } = string.Empty;
    }
}