namespace WMS.Api.Models
{
    public class StockBalance
    {
        public int Id { get; set; }

        public int WarehouseId { get; set; }
        public int ProductId { get; set; }

        public decimal Quantity { get; set; }
    }

}
