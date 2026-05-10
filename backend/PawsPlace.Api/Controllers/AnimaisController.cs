using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Data;
using PawsPlace.Api.DTOs.Animais;

namespace PawsPlace.Api.Controllers;

[ApiController]
[Route("api/animais")]
public class AnimaisController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> ListarAnimais()
    {
        var animais = await db.Animais
            .OrderBy(a => a.Especie)
            .ThenBy(a => a.Nome)
            .Select(a => AnimalResponseDto.FromModel(a))
            .ToListAsync();

        return Ok(animais);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> ObterAnimal(string slug)
    {
        var animal = await db.Animais
            .FirstOrDefaultAsync(a => a.Slug.ToLower() == slug.ToLower());

        if (animal is null)
            return NotFound(new { mensagem = "Animal não encontrado." });

        return Ok(AnimalResponseDto.FromModel(animal));
    }
}
