using PawsPlace.Api.Models;

namespace PawsPlace.Api.Data;

public static class Seed
{
    public static void PopularAnimais(AppDbContext db)
    {
        if (db.Animais.Any()) return;

        var animais = new List<Animal>
        {
            new() { Slug = "nespresso",   Nome = "Nespresso",   Especie = "gato",     Idade = "5 Meses",  IdadeMeses = 5,  Imagem = "https://adoteumgatinho.org.br/media/uploads/cats/cf18cf45b86e195fec98c438f1a90e36.JPG",  LinkDetalhes = "https://adoteumgatinho.org.br/detalhes-gato/20553/nespresso" },
            new() { Slug = "pilao",        Nome = "Pilão",        Especie = "gato",     Idade = "5 Meses",  IdadeMeses = 5,  Imagem = "https://adoteumgatinho.org.br/media/uploads/cats/00a6f69c309b2387294a28b6ff252da1.jpeg", LinkDetalhes = "https://adoteumgatinho.org.br/detalhes-gato/20552/pil%C3%A3%C2%A3o" },
            new() { Slug = "santo-grao",   Nome = "Santo Grão",   Especie = "gato",     Idade = "5 Meses",  IdadeMeses = 5,  Imagem = "https://adoteumgatinho.org.br/media/uploads/cats/fa8c070c5d79f6b9b466ab47c875c25a.jpg",  LinkDetalhes = "https://adoteumgatinho.org.br/detalhes-gato/20551/santo-gr%C3%A3%C2%A3o" },
            new() { Slug = "starbucks",    Nome = "Starbucks",    Especie = "gato",     Idade = "5 Meses",  IdadeMeses = 5,  Imagem = "https://adoteumgatinho.org.br/media/uploads/cats/c94e8359c9dbb8ae34961388c25b8865.JPG",  LinkDetalhes = "https://adoteumgatinho.org.br/detalhes-gato/20550/starbucks" },
            new() { Slug = "the-coffee",   Nome = "The Coffee",   Especie = "gato",     Idade = "5 Meses",  IdadeMeses = 5,  Imagem = "https://adoteumgatinho.org.br/media/uploads/cats/1a6771fb0d7a2ccaaab2bc99041e5e14.JPG",  LinkDetalhes = "https://adoteumgatinho.org.br/detalhes-gato/20549/the-coffee" },
            new() { Slug = "lady-gaga",    Nome = "Lady Gaga",    Especie = "gato",     Idade = "1 Ano",    IdadeMeses = 12, Imagem = "https://adoteumgatinho.org.br/media/uploads/cats/d5c9727bf0b01a0f2b66d14ce3cb5338.jpg",  LinkDetalhes = "https://adoteumgatinho.org.br/detalhes-gato/20530/lady-gaga" },
            new() { Slug = "topazio",      Nome = "Topázio",      Especie = "cachorro", Idade = "7 Anos",   IdadeMeses = 84, Imagem = "https://acaochego.org/img/cachorros/946/topazio11.jpg",                                   LinkDetalhes = "https://acaochego.org/Cachorro/Adotar/946" },
            new() { Slug = "ametista",     Nome = "Ametista",     Especie = "cachorro", Idade = "6 Anos",   IdadeMeses = 72, Imagem = "https://acaochego.org/img/cachorros/980/ametista1.jpg",                                   LinkDetalhes = "https://acaochego.org/Cachorro/Adotar/980" },
            new() { Slug = "tony",         Nome = "Tony",         Especie = "cachorro", Idade = "7 Anos",   IdadeMeses = 84, Imagem = "https://acaochego.org/img/cachorros/968/filhote7_bela_1.jpg",                              LinkDetalhes = "https://acaochego.org/Cachorro/Adotar/968" },
            new() { Slug = "romeu",        Nome = "Romeu",        Especie = "cachorro", Idade = "1 Ano",    IdadeMeses = 12, Imagem = "https://adotar.com.br/upload/2026-03/animais_imagem1339710.jpg?w=700&format=webp",          LinkDetalhes = "https://adotar.com.br/pr-curitiba/cao/adocao/romeu/333257" },
            new() { Slug = "stallone",     Nome = "Stallone",     Especie = "cachorro", Idade = "2 Anos",   IdadeMeses = 24, Imagem = "https://adotar.com.br/upload/2026-03/animais_imagem1338827.jpg?w=700&format=webp",          LinkDetalhes = "https://adotar.com.br/pr-curitiba/cao/adocao/stallone/333028" },
            new() { Slug = "espoleta",     Nome = "Espoleta",     Especie = "cachorro", Idade = "1 Ano",    IdadeMeses = 12, Imagem = "https://adotar.com.br/upload/2026-02/animais_imagem1324836.jpg?w=700&format=webp",          LinkDetalhes = "https://adotar.com.br/pr-curitiba/cao/adocao/espoleta/329403" },
            new() { Slug = "frederico",    Nome = "Frederico",    Especie = "cachorro", Idade = "3 Anos",   IdadeMeses = 36, Imagem = "https://adotar.com.br/upload/2025-08/animais_imagem1257155.jpg?w=700&format=webp",          LinkDetalhes = "https://adotar.com.br/pr-curitiba/cao/adocao/frederico/312406" },
            new() { Slug = "batman",       Nome = "Batman",       Especie = "cachorro", Idade = "3 Meses",  IdadeMeses = 3,  Imagem = "https://adotar.com.br/upload/2025-10/animais_imagem1273245.jpg?w=700&format=webp",          LinkDetalhes = "https://adotar.com.br/pr-curitiba/cao/adocao/nao-tem/316393" },
            new() { Slug = "banny",        Nome = "Banny",        Especie = "cachorro", Idade = "5 Anos",   IdadeMeses = 60, Imagem = "https://img.pikbest.com/illustration/20250808/elegant-silhouette-of-a-dog-head-in-profile-perfect-for-logos-and-minimalist-designs_11821931.jpg!sw800", LinkDetalhes = null },
        };

        db.Animais.AddRange(animais);
        db.SaveChanges();
    }
}
