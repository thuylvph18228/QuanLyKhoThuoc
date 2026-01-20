using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/stock-balances")]
    public class StockBalancesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StockBalancesController(AppDbContext db)
        {
            _db = db;
        }

        // ================= TỒN KHO =================
        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] int? warehouseId,
            [FromQuery] int? productId)
        {
            var query =
                from s in _db.StockBalances
                join w in _db.Warehouses on s.WarehouseId equals w.Id
                join p in _db.Products on s.ProductId equals p.Id
                join u in _db.Units on p.UnitId equals u.Id
                select new StockBalanceDto
                {
                    WarehouseId = w.Id,
                    WarehouseName = w.Name,
                    ProductId = p.Id,
                    ProductName = p.Name,
                    UnitName = u.Name,
                    Quantity = s.Quantity
                };

            if (warehouseId.HasValue)
                query = query.Where(x => x.WarehouseId == warehouseId.Value);

            if (productId.HasValue)
                query = query.Where(x => x.ProductId == productId.Value);

            var data = await query
                .OrderBy(x => x.WarehouseName)
                .ThenBy(x => x.ProductName)
                .ToListAsync();

            return Ok(data);
        }
    }
}
