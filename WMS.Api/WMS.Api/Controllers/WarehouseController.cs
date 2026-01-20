using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs;
using WMS.Api.Models;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/Warehouses")]
    public class WarehousesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public WarehousesController(AppDbContext db) => _db = db;

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _db.Warehouses
                .Select(w => new
                {
                    id = w.Id,
                    code = w.Code,
                    name = w.Name,
                    address = w.Address,
                    isActive = w.IsActive
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet]
        public async Task<IActionResult> Get()
            => Ok(await _db.Warehouses.Where(x => x.IsActive).ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(WarehouseDto dto)
        {
            var Warehouse = new Warehouse { 
                Code = dto.Code,
                Name = dto.Name,
                Address = dto.Address,
                IsActive = dto.IsActive
            };
            _db.Warehouses.Add(Warehouse);
            await _db.SaveChangesAsync();
            return Ok(Warehouse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, WarehouseDto dto)
        {
            var Warehouse = await _db.Warehouses.FindAsync(id);
            if (Warehouse == null) return NotFound();

            Warehouse.Code = dto.Code;
            Warehouse.Name = dto.Name;
            Warehouse.Address = dto.Address;
            Warehouse.IsActive = dto.IsActive;
            await _db.SaveChangesAsync();
            return Ok(Warehouse);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // 1️⃣ Kiểm tra đơn vị có tồn tại không
            var Warehouse = await _db.Warehouses.FindAsync(id);
            if (Warehouse == null)
                return NotFound("Đơn vị tính không tồn tại");

            // 3️⃣ OK thì cho xóa
            _db.Warehouses.Remove(Warehouse);
            await _db.SaveChangesAsync();

            return Ok();
        }

    }

}
