using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Data;
using PawsPlace.Api.DTOs;
using PawsPlace.Api.DTOs.Pedidos;
using PawsPlace.Api.Models;

namespace PawsPlace.Api.Controllers;

[ApiController]
[Route("api/pedidos")]
[Authorize]
public class PedidosController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CriarPedido([FromBody] CriarPedidoDto dto)
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var animal = await db.Animais
            .FirstOrDefaultAsync(a => a.Slug == dto.AnimalSlug);

        if (animal is null)
            return NotFound(new { mensagem = "Animal não encontrado." });

        bool pedidoPendente = await db.Pedidos
            .AnyAsync(p => p.UsuarioId == usuarioId
                        && p.AnimalId == animal.Id
                        && p.Status == "pendente");

        if (pedidoPendente)
            return Conflict(new { mensagem = "Você já possui um pedido pendente para este animal." });

        var pedido = new Pedido
        {
            UsuarioId = usuarioId,
            AnimalId = animal.Id,
            Telefone = dto.Telefone,
            Mensagem = dto.Mensagem,
            Status = "pendente",
            ConsentimentoTimestamp = DateTime.UtcNow,
            ConsentimentoVersao = "1.0"
        };

        db.Pedidos.Add(pedido);
        await db.SaveChangesAsync();

        var pedidoComAnimal = await db.Pedidos
            .Include(p => p.Animal)
            .FirstAsync(p => p.Id == pedido.Id);

        return StatusCode(201, PedidoResponseDto.FromModel(pedidoComAnimal));
    }

    [HttpGet("meus")]
    public async Task<IActionResult> MeusPedidos([FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 5)
    {
        if (pagina < 1)
            return BadRequest(new { mensagem = "O número da página deve ser maior ou igual a 1." });

        if (tamanhoPagina < 1 || tamanhoPagina > 50)
            return BadRequest(new { mensagem = "O tamanho da página deve estar entre 1 e 50." });

        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = db.Pedidos
            .Where(p => p.UsuarioId == usuarioId)
            .OrderByDescending(p => p.DataPedido);

        var totalItens = await query.CountAsync();
        var totalPaginas = (int)Math.Ceiling(totalItens / (double)tamanhoPagina);

        var itens = await query
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .Include(p => p.Animal)
            .Select(p => PedidoResponseDto.FromModel(p))
            .ToListAsync();

        var resultado = new PaginadoDto<PedidoResponseDto>
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
}
