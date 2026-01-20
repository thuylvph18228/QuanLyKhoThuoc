using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs
{
    public class ProductUpdateDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public int UnitId { get; set; }

        [Range(1, double.MaxValue)]
        public decimal Price { get; set; }
    }
}
