using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Data;
using PawsPlace.Api.DTOs;
using PawsPlace.Api.DTOs.Animais;

namespace PawsPlace.Api.Controllers;

[ApiController]
[Route("api/animais")]
public class AnimaisController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> ListarAnimais([FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 12)
    {
        if (pagina < 1)
            return BadRequest(new { mensagem = "O número da página deve ser maior ou igual a 1." });

        if (tamanhoPagina < 1 || tamanhoPagina > 50)
            return BadRequest(new { mensagem = "O tamanho da página deve estar entre 1 e 50." });

        var query = db.Animais
            .OrderBy(a => a.Especie)
            .ThenBy(a => a.Nome);

        var totalItens = await query.CountAsync();
        var totalPaginas = (int)Math.Ceiling(totalItens / (double)tamanhoPagina);

        var itens = await query
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .Select(a => AnimalResponseDto.FromModel(a))
            .ToListAsync();

        var resultado = new PaginadoDto<AnimalResponseDto>
        {
            Itens         = itens,
            Pagina        = pagina,
            TamanhoPagina = tamanhoPagina,
            TotalItens    = totalItens,
            TotalPaginas  = totalPaginas,
            TemProxima    = pagina < totalPaginas,
            TemAnterior   = pagina > 1
        };

        return Ok(resultado);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> ObterAnimal(string slug)
    {
        var slugNormalizado = slug.ToLowerInvariant();

        var animal = await db.Animais
            .FirstOrDefaultAsync(a => a.Slug == slugNormalizado);

        if (animal is null)
            return NotFound(new { mensagem = "Animal não encontrado." });

        return Ok(AnimalResponseDto.FromModel(animal));
    }
}
