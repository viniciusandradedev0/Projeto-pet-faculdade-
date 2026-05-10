using PawsPlace.Api.Models;

namespace PawsPlace.Api.DTOs.Animais;

public record AnimalResponseDto(
    int Id,
    string Slug,
    string Nome,
    string Especie,
    string Idade,
    int IdadeMeses,
    string Imagem,
    string? LinkDetalhes)
{
    public static AnimalResponseDto FromModel(Animal a) => new(
        a.Id,
        a.Slug,
        a.Nome,
        a.Especie,
        a.Idade,
        a.IdadeMeses,
        a.Imagem,
        a.LinkDetalhes);
}
