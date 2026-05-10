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
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(databaseUrl))
{
    // Produção: Railway fornece DATABASE_URL no formato postgresql://...
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(databaseUrl, o => o.EnableRetryOnFailure(3)));
}
else if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("Host="))
{
    // Produção via ConnectionStrings__DefaultConnection (Npgsql format)
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString, o => o.EnableRetryOnFailure(3)));
}
else
{
    // Desenvolvimento local: SQLite
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(connectionString));
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
// Dev: aceita qualquer localhost (qualquer porta do Live Server / npx serve)
// Prod: lê CORS_ORIGINS (env var) ou appsettings.json
// ============================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("PawsPlacePolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Desenvolvimento: qualquer localhost passa (sem restrição de porta)
            policy.SetIsOriginAllowed(origin =>
                      new Uri(origin).Host is "localhost" or "127.0.0.1")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // Produção: origens explícitas via env var ou appsettings
            var corsOrigensEnv = Environment.GetEnvironmentVariable("CORS_ORIGINS");
            var origensPermitidas = !string.IsNullOrEmpty(corsOrigensEnv)
                ? corsOrigensEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                : builder.Configuration.GetSection("Cors:OrigensPermitidas").Get<string[]>() ?? Array.Empty<string>();

            policy.WithOrigins(origensPermitidas)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
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
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        Seed.PopularAnimais(db);
        logger.LogInformation("Banco de dados migrado com sucesso.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao migrar banco de dados: {Message}", ex.Message);
    }
}

// ============================================================
// PIPELINE HTTP
// ============================================================
app.UseCors("PawsPlacePolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
