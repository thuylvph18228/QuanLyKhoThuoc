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
                    select new
                    {
                        s,
                        w,
                        p,
                        u,
                        InPrice = _db.StockVoucherDetails
                            .Where(d =>
                                d.ProductId == s.ProductId &&
                                d.StockVoucher.VoucherType == "IN" &&
                                d.StockVoucher.Status == "APPROVED" &&
                                d.StockVoucher.ToWarehouseId == s.WarehouseId
                            )
                            .OrderByDescending(d => d.StockVoucher.VoucherDate)
                            .Select(d => d.Price)
                            .FirstOrDefault()
                    };

                if (warehouseId.HasValue)
                    query = query.Where(x => x.s.WarehouseId == warehouseId.Value);

                if (productId.HasValue)
                    query = query.Where(x => x.s.ProductId == productId.Value);

                var data = await query
                    .Where(x => x.s.Quantity > 0)
                    .OrderBy(x => x.w.Name)
                    .ThenBy(x => x.p.Name)
                    .Select(x => new StockBalanceDto
                    {
                        WarehouseId = x.w.Id,
                        WarehouseName = x.w.Name,
                        ProductId = x.p.Id,
                        ProductName = x.p.Name,
                        UnitName = x.u.Name,
                        Quantity = x.s.Quantity,
                        InPrice = x.InPrice
                    })
                    .ToListAsync();

                return Ok(data);
            }

    }
}
