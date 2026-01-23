using Microsoft.EntityFrameworkCore;
using WMS.Api.Models;

namespace WMS.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Unit> Units => Set<Unit>();
        public DbSet<Warehouse> Warehouses => Set<Warehouse>();
        public DbSet<StockVoucher> StockVouchers { get; set; }
        public DbSet<StockVoucherDetail> StockVoucherDetails { get; set; }
        public DbSet<StockBalance> StockBalances { get; set; }
        public DbSet<User> Users => Set<User>();


    }
}
