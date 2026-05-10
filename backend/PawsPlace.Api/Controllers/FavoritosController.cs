using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Data;
using PawsPlace.Api.DTOs.Favoritos;
using PawsPlace.Api.Models;

namespace PawsPlace.Api.Controllers;

[ApiController]
[Route("api/favoritos")]
[Authorize]
public class FavoritosController(AppDbContext db) : ControllerBase
{
    [HttpGet("meus")]
    public async Task<IActionResult> MeusFavoritos()
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var favoritos = await db.Favoritos
            .Include(f => f.Animal)
            .Where(f => f.UsuarioId == usuarioId)
            .OrderByDescending(f => f.DataCriacao)
            .ToListAsync();

        var resultado = favoritos.Select(FavoritoResponseDto.FromModel).ToList();

        return Ok(resultado);
    }

    [HttpPost("{animalSlug}")]
    public async Task<IActionResult> AdicionarFavorito(string animalSlug)
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var animal = await db.Animais.FirstOrDefaultAsync(a => a.Slug == animalSlug);
        if (animal is null)
            return NotFound(new { mensagem = "Animal não encontrado." });

        var jaFavorito = await db.Favoritos
            .AnyAsync(f => f.UsuarioId == usuarioId && f.AnimalId == animal.Id);

        if (jaFavorito)
            return Conflict(new { mensagem = "Animal já está nos seus favoritos." });

        var favorito = new Favorito
        {
            UsuarioId = usuarioId,
            AnimalId = animal.Id
        };

        db.Favoritos.Add(favorito);
        await db.SaveChangesAsync();

        await db.Entry(favorito).Reference(f => f.Animal).LoadAsync();

        return StatusCode(201, FavoritoResponseDto.FromModel(favorito));
    }

    [HttpDelete("{animalSlug}")]
    public async Task<IActionResult> RemoverFavorito(string animalSlug)
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var favorito = await db.Favoritos
            .Include(f => f.Animal)
            .FirstOrDefaultAsync(f => f.UsuarioId == usuarioId && f.Animal.Slug == animalSlug);

        if (favorito is null)
            return NotFound(new { mensagem = "Favorito não encontrado." });

        db.Favoritos.Remove(favorito);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
