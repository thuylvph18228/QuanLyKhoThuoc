namespace WMS.Api.DTOs
{
    public class StockVoucherViewDto
    {
        public int Id { get; set; }
        public string VoucherCode { get; set; } = null!;
        public DateTime VoucherDate { get; set; }
        public int? ToWarehouseId { get; set; }
        public int? FromWarehouseId { get; set; }
        public string Status { get; set; } = null!;
        public string? Note { get; set; }

        public List<StockVoucherDetailDto> Details { get; set; } = new();
    }
}
