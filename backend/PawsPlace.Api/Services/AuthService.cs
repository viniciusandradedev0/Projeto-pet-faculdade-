using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Data;
using PawsPlace.Api.DTOs.Auth;
using PawsPlace.Api.Models;

namespace PawsPlace.Api.Services;

public class AuthService(AppDbContext db, JwtService jwtService)
{
    private static readonly Regex EmailRegex =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public async Task<TokenResponseDto> CadastrarAsync(CadastroDto dto)
    {
        // Validações
        if (string.IsNullOrWhiteSpace(dto.Nome) || dto.Nome.Trim().Length < 3)
            throw new InvalidOperationException("O nome deve ter pelo menos 3 caracteres.");

        if (string.IsNullOrWhiteSpace(dto.Email) || !EmailRegex.IsMatch(dto.Email))
            throw new InvalidOperationException("E-mail inválido.");

        if (string.IsNullOrWhiteSpace(dto.Senha) || dto.Senha.Length < 8)
            throw new InvalidOperationException("A senha deve ter pelo menos 8 caracteres.");

        var telefoneSomenteDigitos = Regex.Replace(dto.Telefone ?? string.Empty, @"\D", "");
        if (telefoneSomenteDigitos.Length < 10)
            throw new InvalidOperationException("O telefone deve ter pelo menos 10 dígitos.");

        var emailNormalizado = dto.Email.Trim().ToLowerInvariant();

        // Verifica duplicidade de e-mail
        var emailExistente = await db.Usuarios
            .AnyAsync(u => u.Email == emailNormalizado);

        if (emailExistente)
            throw new InvalidOperationException("E-mail já cadastrado.");

        var usuario = new Usuario
        {
            Nome       = dto.Nome.Trim(),
            Email      = emailNormalizado,
            SenhaHash  = BCrypt.Net.BCrypt.HashPassword(dto.Senha, 12),
            Telefone   = (dto.Telefone ?? string.Empty).Trim(),
            DataCadastro = DateTime.UtcNow
        };

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        var token = jwtService.GerarToken(usuario);
        return new TokenResponseDto(token, usuario.Nome, usuario.Email);
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        var emailNormalizado = (dto.Email ?? string.Empty).Trim().ToLowerInvariant();

        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(u => u.Email == emailNormalizado)
            ?? throw new UnauthorizedAccessException("E-mail ou senha incorretos.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            throw new UnauthorizedAccessException("E-mail ou senha incorretos.");

        var token = jwtService.GerarToken(usuario);
        return new TokenResponseDto(token, usuario.Nome, usuario.Email);
    }
}
