using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Models
{
    public class Warehouse
    {
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string Code { get; set; } = null!;

        [Required, MaxLength(200)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Address { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
