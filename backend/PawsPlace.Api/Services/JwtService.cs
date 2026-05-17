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
        var expiracaoHoras = int.TryParse(configuration["Jwt:ExpiracaoHoras"], out var h) ? h : 8;

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("sub",   usuario.Id.ToString()),
            new Claim("email", usuario.Email),
            new Claim("name",  usuario.Nome)
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
