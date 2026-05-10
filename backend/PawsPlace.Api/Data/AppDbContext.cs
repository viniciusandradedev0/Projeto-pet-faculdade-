using Microsoft.EntityFrameworkCore;
using PawsPlace.Api.Models;

namespace PawsPlace.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Animal> Animais => Set<Animal>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<Favorito> Favoritos => Set<Favorito>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Email único por usuário
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Slug único por animal
        modelBuilder.Entity<Animal>()
            .HasIndex(a => a.Slug)
            .IsUnique();

        // Um usuário não pode favoritar o mesmo animal duas vezes
        modelBuilder.Entity<Favorito>()
            .HasIndex(f => new { f.UsuarioId, f.AnimalId })
            .IsUnique();

        // Relacionamentos
        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Usuario)
            .WithMany(u => u.Pedidos)
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Animal)
            .WithMany(a => a.Pedidos)
            .HasForeignKey(p => p.AnimalId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Favorito>()
            .HasOne(f => f.Usuario)
            .WithMany(u => u.Favoritos)
            .HasForeignKey(f => f.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorito>()
            .HasOne(f => f.Animal)
            .WithMany(a => a.Favoritos)
            .HasForeignKey(f => f.AnimalId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
