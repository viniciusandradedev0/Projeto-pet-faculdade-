using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Data;
using PawsPlace.Api.DTOs.Usuarios;

namespace PawsPlace.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController(AppDbContext db) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> ObterPerfil()
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var usuario = await db.Usuarios.FindAsync(usuarioId);
        if (usuario is null)
            return NotFound(new { mensagem = "Usuário não encontrado." });

        return Ok(PerfilResponseDto.FromModel(usuario));
    }

    [HttpPut("me")]
    public async Task<IActionResult> AtualizarPerfil([FromBody] AtualizarPerfilDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome) || dto.Nome.Trim().Length < 3)
            return BadRequest(new { mensagem = "O nome deve ter pelo menos 3 caracteres." });

        var apenasDigitos = new string(dto.Telefone?.Where(char.IsDigit).ToArray() ?? []);
        if (apenasDigitos.Length < 10)
            return BadRequest(new { mensagem = "O telefone deve ter pelo menos 10 dígitos." });

        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var usuario = await db.Usuarios.FindAsync(usuarioId);
        if (usuario is null)
            return NotFound(new { mensagem = "Usuário não encontrado." });

        usuario.Nome = dto.Nome.Trim();
        usuario.Telefone = dto.Telefone.Trim();
        await db.SaveChangesAsync();

        return Ok(PerfilResponseDto.FromModel(usuario));
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeletarConta()
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var usuario = await db.Usuarios.FindAsync(usuarioId);
        if (usuario is null)
            return NotFound(new { mensagem = "Usuário não encontrado." });

        db.Usuarios.Remove(usuario);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
