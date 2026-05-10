using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PawsPlace.Api.Data;
using PawsPlace.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// BANCO DE DADOS — SQLite via Entity Framework Core
// ============================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ============================================================
// AUTENTICAÇÃO JWT
// ============================================================
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret não configurado.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ============================================================
// CORS — permite o front (GitHub Pages + localhost)
// ============================================================
var origensPermitidas = builder.Configuration
    .GetSection("Cors:OrigensPermitidas")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("PawsPlacePolicy", policy =>
    {
        policy.WithOrigins(origensPermitidas)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ============================================================
// SERVIÇOS DE APLICAÇÃO
// ============================================================
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();

// ============================================================
// CONTROLLERS
// ============================================================
builder.Services.AddControllers();

var app = builder.Build();

// ============================================================
// MIGRATIONS AUTOMÁTICAS ao iniciar (dev)
// ============================================================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Seed.PopularAnimais(db);
}

// ============================================================
// PIPELINE HTTP
// ============================================================
app.UseCors("PawsPlacePolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
