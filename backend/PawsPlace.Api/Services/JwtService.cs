using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PawsPlace.Api.Models;

namespace PawsPlace.Api.Services;

public class JwtService(IConfiguration configuration)
{
    public string GerarToken(Usuario usuario)
    {
        var secret      = configuration["Jwt:Secret"]        ?? throw new InvalidOperationException("JWT Secret não configurado.");
        var issuer      = configuration["Jwt:Issuer"]        ?? throw new InvalidOperationException("JWT Issuer não configurado.");
        var audience    = configuration["Jwt:Audience"]      ?? throw new InvalidOperationException("JWT Audience não configurado.");
        var expiracaoHoras = int.Parse(configuration["Jwt:ExpiracaoHoras"] ?? "8");

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email,          usuario.Email),
            new Claim(ClaimTypes.Name,           usuario.Nome)
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(expiracaoHoras),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
