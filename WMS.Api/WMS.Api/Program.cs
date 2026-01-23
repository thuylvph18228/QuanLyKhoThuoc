using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WMS.Api.Data;
using WMS.Api.Models;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // ================= DB =================
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        // ================= CORS =================
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod());
        });

        // ================= JWT =================
        builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                    )
                };
            });

        builder.Services.AddAuthorization();

        // ================= MVC & Swagger =================
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // ================= BUILD =================
        var app = builder.Build();

        app.UseCors("AllowAll");

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthentication(); // ⚠️ phải trước Authorization
        app.UseAuthorization();

        app.MapControllers();
        app.Run();
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (!db.Users.Any())
            {
                db.Users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    FullName = "Administrator",
                    Role = "ADMIN"
                });
                db.SaveChanges();
            }
        }
    }
}
