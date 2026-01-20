using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Models
{
    public class Unit
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = null!;

        public bool IsActive { get; set; } = true;
    }
}
