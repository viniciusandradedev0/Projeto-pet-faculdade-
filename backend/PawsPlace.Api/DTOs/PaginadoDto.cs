namespace PawsPlace.Api.DTOs;

public class PaginadoDto<T>
{
    public IEnumerable<T> Itens { get; init; } = [];
    public int Pagina { get; init; }
    public int TamanhoPagina { get; init; }
    public int TotalItens { get; init; }
    public int TotalPaginas { get; init; }
    public bool TemProxima { get; init; }
    public bool TemAnterior { get; init; }
}
