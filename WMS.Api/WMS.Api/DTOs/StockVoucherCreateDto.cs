using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs
{
    public class StockVoucherCreateDto
    {
        public string VoucherType { get; set; } = null!; // IN | OUT | MOVE
        public DateTime VoucherDate { get; set; }
        public int? FromWarehouseId { get; set; }
        public int? ToWarehouseId { get; set; }

        public string? Note { get; set; }
        public List<StockVoucherDetailDto> Details { get; set; } = new();
    }
}
