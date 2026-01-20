namespace WMS.Api.DTOs
{
    public class StockVoucherUpdateDto
    {
        public DateTime VoucherDate { get; set; }
        public int? ToWarehouseId { get; set; }
        public string? Note { get; set; }

        public List<StockVoucherDetailDto> Details { get; set; } = new();
    }
}
