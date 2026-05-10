namespace PawsPlace.Api.Models;

public class Favorito
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int AnimalId { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public Animal Animal { get; set; } = null!;
}
