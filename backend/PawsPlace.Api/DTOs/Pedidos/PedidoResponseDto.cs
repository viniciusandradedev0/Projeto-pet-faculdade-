using PawsPlace.Api.Models;

namespace PawsPlace.Api.DTOs.Pedidos;

public record PedidoResponseDto(
    int Id,
    string AnimalNome,
    string AnimalEspecie,
    string AnimalImagem,
    string Telefone,
    string Mensagem,
    string Status,
    DateTime DataPedido
)
{
    public static PedidoResponseDto FromModel(Pedido p) => new(
        p.Id,
        p.Animal.Nome,
        p.Animal.Especie,
        p.Animal.Imagem,
        p.Telefone,
        p.Mensagem,
        p.Status,
        p.DataPedido
    );
}
