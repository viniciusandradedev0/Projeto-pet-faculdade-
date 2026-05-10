using PawsPlace.Api.Models;

namespace PawsPlace.Api.DTOs.Usuarios;

public record PerfilResponseDto(int Id, string Nome, string Email, string Telefone, DateTime DataCadastro)
{
    public static PerfilResponseDto FromModel(Usuario u) =>
        new(u.Id, u.Nome, u.Email, u.Telefone, u.DataCadastro);
}
