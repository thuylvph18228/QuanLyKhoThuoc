using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs;
using WMS.Api.Models;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProductsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _db.Products
        .Include(x => x.Unit)
        .Select(x => new
        {
            x.Id,
            x.Name,
            x.Price,
            UnitId = x.UnitId,
            UnitName = x.Unit.Name
        })
        .ToListAsync();

            return Ok(data);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        // POST: api/products
        [HttpPost]
        public async Task<IActionResult> Create(ProductCreateDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                UnitId = dto.UnitId,
                Price = dto.Price
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            return Ok(product);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductUpdateDto dto)
        {
            var entity = await _db.Products.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Name = dto.Name;
            entity.UnitId = dto.UnitId;
            entity.Price = dto.Price;

            await _db.SaveChangesAsync();
            return Ok(entity);
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.Products.FindAsync(id);
            if (entity == null) return NotFound();

            _db.Products.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
