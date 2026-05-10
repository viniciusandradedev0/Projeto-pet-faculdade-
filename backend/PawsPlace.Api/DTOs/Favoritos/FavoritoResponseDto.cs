using PawsPlace.Api.Models;

namespace PawsPlace.Api.DTOs.Favoritos;

public record FavoritoResponseDto(
    int Id,
    string AnimalSlug,
    string AnimalNome,
    string AnimalEspecie,
    string AnimalImagem,
    string? AnimalLinkDetalhes,
    DateTime DataCriacao)
{
    public static FavoritoResponseDto FromModel(Favorito f) => new(
        f.Id,
        f.Animal.Slug,
        f.Animal.Nome,
        f.Animal.Especie,
        f.Animal.Imagem,
        f.Animal.LinkDetalhes,
        f.DataCriacao);
}
