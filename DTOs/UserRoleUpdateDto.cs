using System.ComponentModel.DataAnnotations;

namespace DocuArchive.DTOs
{
    public class UserRoleUpdateDto
    {
        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
