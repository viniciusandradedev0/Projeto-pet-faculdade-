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

static string BuildNpgsqlFromUri(string uri)
{
    var parsed = new Uri(uri);
    var userInfo = parsed.UserInfo.Split(':', 2);
    var user = Uri.UnescapeDataString(userInfo[0]);
    var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var database = parsed.AbsolutePath.TrimStart('/');
    var port = parsed.Port > 0 ? parsed.Port : 5432;
    return $"Host={parsed.Host};Port={port};Username={user};Password={pass};" +
           $"Database={database};SSL Mode=Require;Trust Server Certificate=true";
}

if (!string.IsNullOrEmpty(databaseUrl))
{
    // Produção: Railway injeta DATABASE_URL no formato postgresql://user:pass@host:port/db
    var pgConn = databaseUrl.StartsWith("postgres://") || databaseUrl.StartsWith("postgresql://")
        ? BuildNpgsqlFromUri(databaseUrl)
        : databaseUrl;
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(pgConn, o => o.EnableRetryOnFailure(3)));
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
// SCHEMA + SEED ao iniciar
// EnsureCreated gera o schema correto por provider em runtime
// (SQLite em dev, PostgreSQL em prod) sem depender de migrations.
// ============================================================
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var criado = db.Database.EnsureCreated();
        Seed.PopularAnimais(db);
        logger.LogInformation("Banco pronto. Schema novo criado: {Criado}", criado);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao preparar banco de dados: {Message}", ex.Message);
        throw;
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
