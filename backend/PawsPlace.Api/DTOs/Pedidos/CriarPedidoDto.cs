namespace PawsPlace.Api.DTOs.Pedidos;

public record CriarPedidoDto(
    string AnimalSlug,
    string Telefone,
    string Mensagem
);
