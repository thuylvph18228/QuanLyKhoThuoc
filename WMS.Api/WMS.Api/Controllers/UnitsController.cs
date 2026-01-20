using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs;
using WMS.Api.Models;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/units")]
    public class UnitsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UnitsController(AppDbContext db) => _db = db;

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _db.Units
                .Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    isActive = u.IsActive
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet]
        public async Task<IActionResult> Get()
            => Ok(await _db.Units.Where(x => x.IsActive).ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(UnitDto dto)
        {
            var unit = new Unit { Name = dto.Name };
            _db.Units.Add(unit);
            await _db.SaveChangesAsync();
            return Ok(unit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UnitDto dto)
        {
            var unit = await _db.Units.FindAsync(id);
            if (unit == null) return NotFound();

            unit.Name = dto.Name;
            unit.IsActive = dto.IsActive;
            await _db.SaveChangesAsync();
            return Ok(unit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // 1️⃣ Kiểm tra đơn vị có tồn tại không
            var unit = await _db.Units.FindAsync(id);
            if (unit == null)
                return NotFound("Đơn vị tính không tồn tại");

            // 2️⃣ Kiểm tra đã được sử dụng chưa
            bool isUsed = await _db.Products
                .AnyAsync(p => p.UnitId == id);

            if (isUsed)
            {
                return BadRequest("Đơn vị tính đã được sử dụng, không được phép xóa. Vui lòng ngưng sử dụng!");
            }

            // 3️⃣ OK thì cho xóa
            _db.Units.Remove(unit);
            await _db.SaveChangesAsync();

            return Ok();
        }

    }

}
