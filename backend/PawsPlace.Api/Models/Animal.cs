namespace PawsPlace.Api.Models;

public class Animal
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Especie { get; set; } = string.Empty;
    public string Idade { get; set; } = string.Empty;
    public int IdadeMeses { get; set; }
    public string Imagem { get; set; } = string.Empty;
    public string? LinkDetalhes { get; set; }

    public ICollection<Pedido> Pedidos { get; set; } = [];
    public ICollection<Favorito> Favoritos { get; set; } = [];
}
