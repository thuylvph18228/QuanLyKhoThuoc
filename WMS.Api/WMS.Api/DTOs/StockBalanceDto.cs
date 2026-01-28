namespace WMS.Api.DTOs
{
    public class StockBalanceDto
    {
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = null!;

        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string UnitName { get; set; } = null!;

        public decimal Quantity { get; set; }
        public decimal InPrice { get; set; }
    }
}
