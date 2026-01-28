using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs;
using WMS.Api.Models;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/stock-vouchers")]
    public class StockVouchersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StockVouchersController(AppDbContext db)
        {
            _db = db;
        }

        // ================= DANH SÁCH PHIẾU =================
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] string? type)
        {
            var query = _db.StockVouchers
                .Include(x => x.Details)
                .AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(x => x.VoucherType == type);

            var data = await query
                .OrderByDescending(x => x.Id)
                .Select(x => new
                {
                    x.Id,
                    x.VoucherCode,
                    x.VoucherType,
                    x.VoucherDate,
                    x.Status,
                    x.FromWarehouseId,
                    x.ToWarehouseId,
                    FromWarehouseName = _db.Warehouses
                        .Where(w => w.Id == x.FromWarehouseId)
                        .Select(w => w.Name)
                        .FirstOrDefault(),
                    ToWarehouseName = _db.Warehouses
                        .Where(w => w.Id == x.ToWarehouseId)
                        .Select(w => w.Name)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(data);
        }

        // ================= CREATE =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StockVoucherCreateDto dto)
        {
            // validate chung
            if (dto.Details == null || dto.Details.Count == 0)
                return BadRequest("Phiếu phải có chi tiết");

            // validate theo loại phiếu
            if (dto.VoucherType == "IN" && dto.ToWarehouseId == null)
                return BadRequest("Phiếu nhập phải chọn kho nhập");

            if (dto.VoucherType == "OUT" && dto.FromWarehouseId == null)
                return BadRequest("Phiếu xuất phải chọn kho xuất");

            if (dto.VoucherType == "MOVE" &&
                (dto.FromWarehouseId == null || dto.ToWarehouseId == null))
                return BadRequest("Phiếu luân chuyển phải chọn đủ kho");

            var voucher = new StockVoucher
            {
                VoucherCode = $"PX{DateTime.Now:yyyyMMddHHmmss}",
                VoucherType = dto.VoucherType,
                VoucherDate = dto.VoucherDate,
                FromWarehouseId = dto.FromWarehouseId,
                ToWarehouseId = dto.ToWarehouseId,
                Note = dto.Note,
                Status = "DRAFT",
                CreatedAt = DateTime.Now,
                Details = dto.Details.Select(d => new StockVoucherDetail
                {
                    ProductId = d.ProductId,
                    Quantity = d.Quantity,
                    Price = d.Price
                }).ToList()
            };

            _db.StockVouchers.Add(voucher);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                voucher.Id,
                voucher.VoucherCode,
                voucher.VoucherType,
                voucher.VoucherDate,
                voucher.FromWarehouseId,
                voucher.ToWarehouseId,
                voucher.Status
            });

        }

        // ================= APPROVE =================
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var voucher = await _db.StockVouchers
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (voucher == null)
                return NotFound();

            if (voucher.Status == "APPROVED")
                return BadRequest("Phiếu đã duyệt");

            using var tran = await _db.Database.BeginTransactionAsync();

            foreach (var d in voucher.Details)
            {
                if (voucher.VoucherType == "IN")
                    Increase(voucher.ToWarehouseId!.Value, d.ProductId, d.Quantity);

                if (voucher.VoucherType == "OUT")
                    Decrease(voucher.FromWarehouseId!.Value, d.ProductId, d.Quantity);

                if (voucher.VoucherType == "MOVE")
                {
                    Decrease(voucher.FromWarehouseId!.Value, d.ProductId, d.Quantity);
                    Increase(voucher.ToWarehouseId!.Value, d.ProductId, d.Quantity);
                }
            }

            voucher.Status = "APPROVED";
            await _db.SaveChangesAsync();
            await tran.CommitAsync();

            return Ok();
        }

        // ================= HELPER =================
        private void Increase(int whId, int productId, decimal qty)
        {
            var stock = _db.StockBalances
                .FirstOrDefault(x => x.WarehouseId == whId && x.ProductId == productId);

            if (stock == null)
            {
                _db.StockBalances.Add(new StockBalance
                {
                    WarehouseId = whId,
                    ProductId = productId,
                    Quantity = qty
                });
            }
            else
            {
                stock.Quantity += qty;
            }
        }

        private void Decrease(int whId, int productId, decimal qty)
        {
            var stock = _db.StockBalances
                .FirstOrDefault(x => x.WarehouseId == whId && x.ProductId == productId);

            if (stock == null || stock.Quantity < qty)
                throw new Exception("Không đủ tồn kho");

            stock.Quantity -= qty;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var voucher = await _db.StockVouchers
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (voucher == null)
                return NotFound();

            var dto = new StockVoucherViewDto
            {
                Id = voucher.Id,
                VoucherCode = voucher.VoucherCode,
                VoucherDate = voucher.VoucherDate,
                ToWarehouseId = voucher.ToWarehouseId,
                Status = voucher.Status,
                Note = voucher.Note,
                Details = voucher.Details.Select(d => new StockVoucherDetailDto
                {
                    ProductId = d.ProductId,
                    Quantity = d.Quantity,
                    Price = d.Price
                }).ToList()
            };

            return Ok(dto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, StockVoucherUpdateDto dto)
        {
            var voucher = await _db.StockVouchers
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (voucher == null)
                return NotFound();

            if (voucher.Status != "DRAFT")
                return BadRequest("Chỉ được sửa phiếu ở trạng thái DRAFT");

            voucher.VoucherDate = dto.VoucherDate;
            voucher.ToWarehouseId = dto.ToWarehouseId;
            voucher.Note = dto.Note;

            // Xóa chi tiết cũ
            _db.StockVoucherDetails.RemoveRange(voucher.Details);

            // Thêm chi tiết mới
            voucher.Details = dto.Details.Select(d => new StockVoucherDetail
            {
                ProductId = d.ProductId,
                Quantity = d.Quantity,
                Price = d.Price
            }).ToList();

            await _db.SaveChangesAsync();

            return Ok();
        }


        [HttpPost("{id}/cancel-approve")]
        public async Task<IActionResult> CancelApprove(int id)
        {
            var voucher = await _db.StockVouchers
                .FirstOrDefaultAsync(x => x.Id == id);

            if (voucher == null)
                return NotFound();

            if (voucher.Status != "APPROVED")
                return BadRequest("Phiếu chưa được duyệt");

            // ⚠ hiện tại chưa có dữ liệu để kiểm tra đã dùng tồn hay chưa
            // → chỉ cho phép hủy duyệt về DRAFT

            voucher.Status = "DRAFT";
            voucher.ApprovedAt = null;
            voucher.ApprovedBy = null;

            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("out")]
        public async Task<IActionResult> GetStockOuts()
        {
            var data = await _db.StockVouchers
                .Where(x => x.VoucherType == "OUT")
                .Include(x => x.Details)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new 
                {
                    x.Id,
                    x.VoucherCode,
                    x.VoucherDate,
                    x.FromWarehouseId, // ⚠️ dùng field này để FE hiển thị
                    FromWarehouseName = _db.Warehouses
                        .Where(w => w.Id == x.FromWarehouseId)
                        .Select(w => w.Name)
                        .FirstOrDefault(),
                    x.Status,
                    x.Note,
                    Details = x.Details.Select(d => new StockVoucherDetailDto
                    {
                        ProductId = d.ProductId,
                        Quantity = d.Quantity,
                        Price = d.Price
                    }).ToList()
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost("out")]
        public async Task<IActionResult> CreateStockOut([FromBody] StockVoucherCreateDto dto)
        {
            var voucher = new StockVoucher
            {
                VoucherCode = $"PX{DateTime.Now:yyyyMMddHHmmss}",
                VoucherType = "OUT",
                VoucherDate = dto.VoucherDate,
                FromWarehouseId = dto.ToWarehouseId, // ⚠️ dùng lại field
                Note = dto.Note,
                Status = "DRAFT"
            };

            foreach (var d in dto.Details)
            {
                voucher.Details.Add(new StockVoucherDetail
                {
                    ProductId = d.ProductId,
                    Quantity = d.Quantity,
                    Price = d.Price
                });
            }

            _db.StockVouchers.Add(voucher);
            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("{id}/approve-out")]
        public async Task<IActionResult> ApproveStockOut(int id)
        {
            var voucher = await _db.StockVouchers
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.VoucherType == "OUT");

            if (voucher == null) return NotFound();
            if (voucher.Status != "DRAFT")
                return BadRequest("Phiếu đã duyệt");

            foreach (var d in voucher.Details)
            {
                var balance = await _db.StockBalances.FirstOrDefaultAsync(x =>
                    x.ProductId == d.ProductId &&
                    x.WarehouseId == voucher.FromWarehouseId);

                if (balance == null || balance.Quantity < d.Quantity)
                    return BadRequest("Không đủ tồn kho");
            }

            // trừ tồn
            foreach (var d in voucher.Details)
            {
                var balance = await _db.StockBalances.FirstAsync(x =>
                    x.ProductId == d.ProductId &&
                    x.WarehouseId == voucher.FromWarehouseId);

                balance.Quantity -= d.Quantity;
            }

            voucher.Status = "APPROVED";
            voucher.ApprovedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Approved" });
        }

        [HttpPost("{id}/cancel-approve-out")]
        public async Task<IActionResult> CancelApproveStockOut(int id)
        {
            var voucher = await _db.StockVouchers
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x =>
                    x.Id == id && x.VoucherType == "OUT");

            if (voucher == null)
                return NotFound();

            if (voucher.Status != "APPROVED")
                return BadRequest("Phiếu chưa được duyệt");

            foreach (var d in voucher.Details)
            {
                var balance = await _db.StockBalances.FirstOrDefaultAsync(x =>
                    x.ProductId == d.ProductId &&
                    x.WarehouseId == voucher.FromWarehouseId);

                if (balance == null)
                    return BadRequest("Không tìm thấy tồn kho");

                balance.Quantity += d.Quantity;
            }

            voucher.Status = "DRAFT";
            voucher.ApprovedAt = null;
            voucher.ApprovedBy = null;

            await _db.SaveChangesAsync();
            return Ok();
        }


    }
}
