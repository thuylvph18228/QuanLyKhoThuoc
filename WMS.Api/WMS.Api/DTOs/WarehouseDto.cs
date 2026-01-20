using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs
{
    public class WarehouseDto
    {
        [Required]
        public string Code { get; set; } = null!;

        [Required]
        public string Name { get; set; } = null!;

        public string? Address { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
