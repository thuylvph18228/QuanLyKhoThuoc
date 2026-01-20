namespace WMS.Api.Models
{
    public class StockVoucher
    {
        public int Id { get; set; }

        public string VoucherCode { get; set; } = null!;
        public string VoucherType { get; set; } = null!; // IN | OUT | MOVE

        public DateTime VoucherDate { get; set; }

        public int? FromWarehouseId { get; set; }   // Kho xuất
        public int? ToWarehouseId { get; set; }     // Kho nhập

        public string? Note { get; set; }

        public string Status { get; set; } = "DRAFT";

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string? CreatedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }
        public string? ApprovedBy { get; set; }

        public ICollection<StockVoucherDetail> Details { get; set; }
            = new List<StockVoucherDetail>();
    }
}
