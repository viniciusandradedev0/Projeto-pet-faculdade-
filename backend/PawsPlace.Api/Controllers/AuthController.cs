using Microsoft.AspNetCore.Mvc;
using PawsPlace.Api.DTOs.Auth;
using PawsPlace.Api.Services;

namespace PawsPlace.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("cadastro")]
    public async Task<IActionResult> Cadastro([FromBody] CadastroDto dto)
    {
        try
        {
            var resultado = await authService.CadastrarAsync(dto);
            return StatusCode(201, resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { mensagem = "Erro interno." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var resultado = await authService.LoginAsync(dto);
            return Ok(resultado);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { mensagem = "E-mail ou senha incorretos." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { mensagem = "Erro interno." });
        }
    }
}
