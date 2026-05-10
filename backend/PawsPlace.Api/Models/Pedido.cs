namespace PawsPlace.Api.Models;

public class Pedido
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int AnimalId { get; set; }
    public string Telefone { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public string Status { get; set; } = "pendente";
    public DateTime DataPedido { get; set; } = DateTime.UtcNow;
    public DateTime ConsentimentoTimestamp { get; set; } = DateTime.UtcNow;
    public string ConsentimentoVersao { get; set; } = "1.0";

    public Usuario Usuario { get; set; } = null!;
    public Animal Animal { get; set; } = null!;
}
