using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PawsPlace.Api.Data;
using PawsPlace.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// BANCO DE DADOS
// PostgreSQL em produção (DATABASE_URL), SQLite em desenvolvimento
// ============================================================
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(databaseUrl))
{
    // Produção: Railway fornece DATABASE_URL no formato postgresql://...
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(databaseUrl));
}
else
{
    // Desenvolvimento local: SQLite
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}

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
// CORS
// Em produção: lê CORS_ORIGINS (env var, vírgula separada)
// Em dev: lê appsettings.json
// ============================================================
var corsOrigensEnv = Environment.GetEnvironmentVariable("CORS_ORIGINS");
var origensPermitidas = !string.IsNullOrEmpty(corsOrigensEnv)
    ? corsOrigensEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    : builder.Configuration.GetSection("Cors:OrigensPermitidas").Get<string[]>() ?? [];

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
// MIGRATIONS + SEED ao iniciar
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
