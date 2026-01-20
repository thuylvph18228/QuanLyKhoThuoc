using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WMS.Api.Migrations
{
    public partial class RenameUnitIdToWarehouseId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FromUnitId",
                table: "StockVouchers",
                newName: "FromWarehouseId");

            migrationBuilder.RenameColumn(
                name: "ToUnitId",
                table: "StockVouchers",
                newName: "ToWarehouseId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FromWarehouseId",
                table: "StockVouchers",
                newName: "FromUnitId");

            migrationBuilder.RenameColumn(
                name: "ToWarehouseId",
                table: "StockVouchers",
                newName: "ToUnitId");
        }
    }
}
