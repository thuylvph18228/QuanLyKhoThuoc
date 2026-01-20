using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        public int UnitId { get; set; }
        public Unit Unit { get; set; } = null!;

        public decimal Price { get; set; }
    }

}
