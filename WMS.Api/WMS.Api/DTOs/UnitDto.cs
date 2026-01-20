using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs
{
    public class UnitDto
    {
        [Required]
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; } = true;
    }
}
