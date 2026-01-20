using System.Text.Json.Serialization;
using WMS.Api.Models;

public class StockVoucherDetail
{
    public int Id { get; set; }

    public int StockVoucherId { get; set; }

    [JsonIgnore] // 🔥 BẮT BUỘC
    public StockVoucher StockVoucher { get; set; } = null!;

    public int ProductId { get; set; }
    public int UnitId { get; set; }

    public decimal Quantity { get; set; }
    public decimal Price { get; set; }

    public decimal Amount => Quantity * Price;
}
