# CLAUDE.md — Paws Place (Back-end)

## Projeto

ASP.NET Core 8 Web API em `backend/PawsPlace.Api/`
Banco: SQLite (dev) → PostgreSQL (prod planejado)
Auth: JWT Bearer (BCrypt.Net, JwtBearer 8.0.15)

## Estrutura do back-end

```
backend/PawsPlace.Api/
├── Controllers/
│   ├── AuthController.cs       # POST /api/auth/cadastro + login
│   ├── AnimaisController.cs    # GET /api/animais + /api/animais/{slug}
│   ├── PedidosController.cs    # POST + GET /api/pedidos/meus
│   ├── FavoritosController.cs  # POST/DELETE/GET /api/favoritos
│   └── UsuariosController.cs   # GET/PUT/DELETE /api/usuarios/me
├── Services/
│   ├── JwtService.cs           # Gera token HS256 (claims: userId, email, nome)
│   └── AuthService.cs          # Cadastro (bcrypt w=12) + login
├── Models/
│   ├── Usuario.cs              # Id, Nome, Email, SenhaHash, Telefone, DataCadastro
│   ├── Animal.cs               # Id, Slug, Nome, Especie, Idade, IdadeMeses, Imagem, LinkDetalhes
│   ├── Pedido.cs               # Id, FK Usuario+Animal, Telefone, Mensagem, Status, DataPedido
│   └── Favorito.cs             # Id, FK Usuario+Animal, DataCriacao
├── DTOs/
│   ├── Auth/       CadastroDto, LoginDto, TokenResponseDto
│   ├── Animais/    AnimalResponseDto
│   ├── Pedidos/    CriarPedidoDto, PedidoResponseDto
│   ├── Favoritos/  FavoritoResponseDto
│   └── Usuarios/   AtualizarPerfilDto, PerfilResponseDto
├── Data/
│   ├── AppDbContext.cs          # DbContext com índices únicos e relacionamentos
│   └── Seed.cs                  # Popula 15 animais na primeira execução
├── Migrations/
│   └── CriarTabelasIniciais    # Migration inicial
├── Program.cs                  # JWT + CORS + EF + migrations automáticas + DI
├── appsettings.json            # ConnectionString, JWT config, CORS origins
└── PawsPlace.Api.http          # 13 requisições de teste manual (REST Client)
```

## Endpoints

| Método | Rota | Auth | Status |
|--------|------|------|--------|
| POST | /api/auth/cadastro | ❌ | ✅ |
| POST | /api/auth/login | ❌ | ✅ |
| GET | /api/animais | ❌ | ✅ |
| GET | /api/animais/{slug} | ❌ | ✅ |
| POST | /api/pedidos | ✅ | ✅ |
| GET | /api/pedidos/meus | ✅ | ✅ |
| POST | /api/favoritos/{slug} | ✅ | ✅ |
| DELETE | /api/favoritos/{slug} | ✅ | ✅ |
| GET | /api/favoritos/meus | ✅ | ✅ |
| GET | /api/usuarios/me | ✅ | ✅ |
| PUT | /api/usuarios/me | ✅ | ✅ |
| DELETE | /api/usuarios/me | ✅ | ✅ |

## Chaves de configuração (appsettings.json)

```json
"ConnectionStrings": { "DefaultConnection": "Data Source=paws-place.db" }
"Jwt": { "Secret": "...", "Issuer": "PawsPlace.Api", "Audience": "PawsPlace.Front", "ExpiracaoHoras": 8 }
"Cors": { "OrigensPermitidas": ["https://viniciusandradedev0.github.io", "http://localhost:5500"] }
```

## Relacionamentos do banco

```
Usuario ──< Pedido >── Animal
   └──────< Favorito >──┘

Regras:
- Email único por usuário
- Slug único por animal
- Favorito único por (usuário + animal)
- Deletar usuário → cascade deleta Pedidos e Favoritos
```

## Rodar localmente

```bash
cd backend/PawsPlace.Api
dotnet run          # http://localhost:5173
# banco criado automaticamente + 15 animais inseridos no primeiro run
```

## Roadmap do back-end

- [x] Etapa 8 — Setup ASP.NET Core, models, EF, migrations
- [x] Etapa 9 — Seed dos 15 animais, banco verificado
- [x] Etapa 10 — Auth JWT (cadastro + login)
- [x] Etapa 11 — AnimaisController (público)
- [x] Etapa 12 — PedidosController (autenticado)
- [x] Etapa 12.5 — FavoritosController (autenticado)
- [x] Etapa 13 — UsuariosController/perfil (autenticado)
- [x] Etapa 14 — Migração do front para consumir a API (⚠️ teste manual pendente)
- [ ] Etapa 15 — Deploy (Railway/Render/Azure)

## Convenções do back

- Idioma do código: português (nomes de variáveis, métodos, comentários)
- DTOs como `record` (imutáveis, conciso)
- Services injetados como `Scoped`
- Controllers sem lógica de negócio (delegam para Services)
- Erros: InvalidOperationException → 409, UnauthorizedAccessException → 401
