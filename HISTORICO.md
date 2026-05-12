# Histórico de Implementação — Paws Place

> Registro rápido do que foi construído, decisões tomadas e fluxos implementados.
> Usado como base para documentação futura.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Front  | HTML + CSS + JavaScript ES6 modules (Vanilla, sem framework) |
| Testes | Vitest + jsdom |
| Back   | C# ASP.NET Core 8 Web API |
| Banco  | SQLite (dev) → PostgreSQL (prod) |
| Auth   | JWT (back) / SHA-256 localStorage (front — fase 1) |
| Deploy | GitHub Pages (front) · Railway (back — ativo em produção) |

---

## Fase 1 — Front-end

### Fundação
- Estrutura de páginas HTML com ES6 modules nativos
- Sistema de temas claro/escuro com `prefers-color-scheme` e `localStorage`
- `storage.js` — wrapper centralizado para localStorage/sessionStorage com prefixo `paws-`
- Header dinâmico injetado via JS conforme estado de autenticação

### Autenticação (client-side)
- `auth.js` — cadastro e login com hash SHA-256 via Web Crypto API
- Sessão persistente (`lembrar de mim`) ou por aba (sessionStorage)
- `proteger-rota.js` — redireciona para login com URL de retorno salva
- Validação de formulários centralizada em `validacao.js` (PT-BR, ARIA)

### Fluxo de adoção
```
Catálogo (animais.html)
  → botão ADOTAR (link para adotar.html?id=...)
    → adotar.html [rota protegida]
      → formulário com dados do usuário pré-preenchidos
        → pedido salvo em paws-pedidos (localStorage)
          → redirect para meus-pedidos.html com toast de sucesso
```

### Páginas protegidas (requerem login)
- `adotar.html` — formulário de pedido de adoção
- `meus-pedidos.html` — histórico com badges de status
- `perfil.html` — dados do usuário + excluir conta (limpa todo localStorage)

### LGPD
- Checkbox de consentimento com timestamp + versão em adotar.html e contato.html
- `politica-privacidade.html` reescrita refletindo uso real de localStorage

### Testes (Vitest + jsdom)
- `validacao.test.js` — 43 testes (todos os validadores)
- `storage.test.js` — 28 testes (CRUD + limpeza seletiva por prefixo)
- `auth.test.js` — 34 testes (cadastro, login, sessão, polyfill crypto)
- `filtros.test.js` — 20 testes (normalização, debounce, filtro, busca)
- **Total: 125 testes passando**

---

## Fase 2 — Back-end (em andamento)

### Etapa 8 — Setup concluído ✅
- Projeto `PawsPlace.Api` em `backend/`
- Pacotes instalados: EF Core Sqlite, BCrypt.Net-Next, JwtBearer (todos v8.0.15)
- Models criados com relacionamentos e índices únicos:

```
Usuario ──< Pedido >── Animal
   └──────< Favorito >──┘
```

- `AppDbContext` configurado com:
  - Email único por usuário
  - Slug único por animal
  - Favorito único por (usuário + animal)
  - Cascade delete em Pedidos e Favoritos ao excluir usuário
- `Program.cs` com JWT Bearer, CORS e migrations automáticas na inicialização
- Migration inicial `CriarTabelasIniciais` gerada

### Etapas 9–13 — API completa ✅

**Estrutura de arquivos criada:**
```
backend/PawsPlace.Api/
├── Services/
│   ├── JwtService.cs       — gera token HS256 com claims
│   └── AuthService.cs      — cadastro (bcrypt) + login
├── Controllers/
│   ├── AuthController.cs   — POST cadastro / login
│   ├── AnimaisController.cs— GET animais (público)
│   ├── PedidosController.cs— POST + GET pedidos (auth)
│   ├── FavoritosController.cs — POST/DELETE/GET favoritos (auth)
│   └── UsuariosController.cs  — GET/PUT/DELETE perfil (auth)
├── DTOs/
│   ├── Auth/       (CadastroDto, LoginDto, TokenResponseDto)
│   ├── Animais/    (AnimalResponseDto)
│   ├── Pedidos/    (CriarPedidoDto, PedidoResponseDto)
│   ├── Favoritos/  (FavoritoResponseDto)
│   └── Usuarios/   (AtualizarPerfilDto, PerfilResponseDto)
└── Data/Seed.cs    — 15 animais populados na inicialização
```

**Endpoints implementados:**

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/cadastro | ❌ | Cadastro + retorna JWT |
| POST | /api/auth/login | ❌ | Login + retorna JWT |
| GET | /api/animais | ❌ | Lista todos os animais |
| GET | /api/animais/{slug} | ❌ | Detalhe por slug |
| POST | /api/pedidos | ✅ | Criar pedido de adoção |
| GET | /api/pedidos/meus | ✅ | Meus pedidos |
| POST | /api/favoritos/{slug} | ✅ | Adicionar favorito |
| DELETE | /api/favoritos/{slug} | ✅ | Remover favorito |
| GET | /api/favoritos/meus | ✅ | Meus favoritos |
| GET | /api/usuarios/me | ✅ | Ver perfil |
| PUT | /api/usuarios/me | ✅ | Atualizar nome/telefone |
| DELETE | /api/usuarios/me | ✅ | Excluir conta |

**Build final: 0 erros, 0 warnings.**

### API validada manualmente ✅
Testes com curl confirmaram:
- GET /api/animais → 15 animais retornados
- POST /api/auth/cadastro → JWT gerado
- POST /api/auth/login → token válido
- POST /api/pedidos (com JWT) → pedido criado, status "pendente"
- GET /api/pedidos/meus → lista retornada corretamente

---

## Etapa 14 — Migração do front concluída e validada ✅

### O que muda no localStorage

| Chave | Antes | Depois |
|-------|-------|--------|
| `paws-usuarios` | array de usuários | **removida** (está no banco) |
| `paws-sessao` | {email} do logado | **removida** (substituída por JWT) |
| `paws-pedidos` | array de pedidos | **removida** (está no banco) |
| `paws-jwt` | não existia | **nova** (token JWT) |
| `paws-tema` | preferência de tema | permanece |
| `paws-mensagem-redirect` | toast pós-redirect | permanece |
| `paws-redirect-pos-login` | URL de retorno | permanece |

### Decisões da Etapa 14

| Decisão | Escolha |
|---------|---------|
| "Lembrar de mim" | JWT em `localStorage` se marcado, `sessionStorage` se não — mantém comportamento atual. Remoção planejada para Fase 3. |
| URL da API | Auto-detectada: `localhost:5173` em dev, URL real em prod (via `scripts/config.js`) |
| `animais.json` | Mantido como fallback se API cair. Remover após deploy confirmado. |

### Etapa 14 — Migração concluída ✅

| Arquivo | O que mudou |
|---------|-----------|
| `scripts/config.js` | NOVO — `API_BASE` auto-detectada + `apiFetch` com JWT automático |
| `scripts/storage.js` | Simplificado — removidas USUARIOS, SESSAO, PEDIDOS; adicionada JWT |
| `scripts/auth.js` | fetch /api/auth/* + JWT em localStorage (lembrar) ou sessionStorage |
| `scripts/data.js` | fetch GET /api/animais, fallback para animais.json |
| `scripts/proteger-rota.js` | Decodifica JWT client-side, sem depender de auth.js |
| `scripts/adotar.js` | fetch POST /api/pedidos via apiFetch |
| `scripts/meus-pedidos.js` | fetch GET /api/pedidos/meus via apiFetch |
| `scripts/perfil.js` | fetch GET/DELETE /api/usuarios/me, logout limpa paws-jwt |

**localStorage após migração:**
- Removidas: `paws-usuarios`, `paws-sessao`, `paws-pedidos`
- Adicionada: `paws-jwt` (token JWT, quando "lembrar de mim" marcado)
- Mantidas: `paws-tema`, `paws-mensagem-redirect`, `paws-redirect-pos-login`

---

## Decisões de arquitetura

| Decisão | Motivo |
|---------|--------|
| Vanilla JS no front (sem framework) | Aprendizado de fundamentos + requisito do projeto |
| SHA-256 no client (Fase 1) | Didático — Fase 2 migra para bcrypt no servidor |
| SQLite em dev | Zero configuração — migra para PostgreSQL no deploy |
| JWT sem refresh token (Fase 2) | Simplicidade — expiração curta (8h) é suficiente para o escopo |
| Favoritos incluído desde o modelo | Custo zero adicioná-lo ao schema agora; difícil migrar depois |
| Front JS + API C# separados | Padrão real de mercado; Blazor fica como opção futura (Fase 3) |

---

## Fluxos de navegação — Fase 2 (implementados)

### Autenticação

```
Cadastro
  → POST /api/auth/cadastro { nome, email, senha, telefone }
    → bcrypt hash da senha → salvo no banco
      → retorna JWT { userId, email, nome, exp }
        → front salva JWT no localStorage

Login
  → POST /api/auth/login { email, senha }
    → bcrypt.verify → retorna JWT
      → front salva JWT

Requisição autenticada
  → Header: Authorization: Bearer <token>
    → Middleware JwtBearer valida
      → Controller recebe userId via User.Claims

Logout
  → front remove JWT do localStorage (sem chamada à API)
```

### Adoção (fluxo completo)
```
animais.html (carrega da API)
  → clica ADOTAR → adotar.html?id={slug}
    → protegerRota() [decodifica JWT]
      ├─ não logado → login.html (salva URL de retorno)
      │     → login → volta para adotar.html?id={slug}
      └─ logado → carrega animal da API
          → formulário pré-preenchido (nome/email do JWT)
            → POST /api/pedidos
              → redirect para meus-pedidos.html com toast ✅
```

### Proteção de rotas
```
Acesso a rota protegida sem JWT (ou JWT expirado)
  → proteger-rota.js decodifica paws-jwt do storage
    → inválido/ausente → salva URL atual + mensagem-redirect
      → redirect para login.html
        → login bem-sucedido → volta para URL salva
```

### Exclusão de conta
```
perfil.html → "Excluir conta" → dialog de confirmação
  → confirma → DELETE /api/usuarios/me (cascade: pedidos + favoritos)
    → remove paws-jwt de localStorage e sessionStorage
      → redirect para index.html com toast de despedida
```

### Favoritos no front ✅
- `❤️/🤍` em cada card — sincroniza estado com `GET /api/favoritos/meus` ao carregar
- Toggle: `POST /api/favoritos/{slug}` (adicionar) / `DELETE` (remover)
- `favoritos.html` — lista com foto, nome, botão ADOTAR e botão remover
- Link "Favoritos" adicionado ao menu (entre Perfil e Meus Pedidos)
- Re-sincroniza após filtros em `animais.html`

### Edição de perfil ✅
- Formulário (nome + telefone) adicionado em `perfil.html`
- `PUT /api/usuarios/me` — validação client-side + atualiza dados exibidos + toast
- Botão cancelar restaura valores anteriores

### Etapa 15 — Deploy no Railway ✅ (10/05/2026)

**URL de produção:** `https://projeto-pet-faculdade-production.up.railway.app`

**O que foi feito:**
- `railway.toml`: builder trocado de `NIXPACKS` → `DOCKERFILE`
  - Nixpacks defaultava para .NET SDK 6.0.413 e falhava o build
  - Dockerfile usa `mcr.microsoft.com/dotnet/sdk:8.0` oficial
- `startCommand` corrigido: `/app/publish/PawsPlace.Api.dll` → `/app/PawsPlace.Api.dll`
  - O Dockerfile copia os arquivos para `/app`, não `/app/publish`
- Branch de deploy configurada para `desenvolvimento` (não `main`)
- PostgreSQL online no Railway com variáveis de ambiente configuradas
- Deploy status: **ACTIVE**

### Etapa 16 — Validação em produção ✅ (11/05/2026)

**Resultado:** todos os 13 endpoints validados via curl contra a URL de produção.

**Problemas encontrados e corrigidos durante a validação:**

| Problema | Sintoma | Correção |
|---------|---------|----------|
| Migration gerada para SQLite | `INSERT` em PG falhava silenciosamente — coluna `Id` sem `IDENTITY` (anotação `Sqlite:Autoincrement` ignorada por Npgsql). API ficava online mas `GET /api/animais` retornava `[]` e cadastro retornava 500. | `Program.cs`: trocado `db.Database.Migrate()` por `db.Database.EnsureCreated()` — gera schema correto por provider em runtime. Exceção de inicialização agora re-lançada (não engole erro). |
| Npgsql não parseia URI | Railway injeta `DATABASE_URL` como `postgresql://user:pass@host:port/db`, mas Npgsql espera `Host=...;Port=...;Username=...`. Startup quebrava com `Host can't be null`. | Adicionado `BuildNpgsqlFromUri()` em `Program.cs` que converte URI → keyword=value com `SSL Mode=Require`. |
| Referências quebradas no Railway | Após recriar o serviço Postgres, a variável `ConnectionStrings__DefaultConnection` da API ainda apontava para o ID antigo (`${{Postgres-fd52b244-....PGHOST}}`). Railway resolvia para string vazia → `Host=;Port=;...` → mesmo erro. | Editado Raw Editor no dashboard: trocadas todas as referências de `Postgres-fd52b244-11d6-45c8-afbc-65853df2f236` para `Postgres` (nome do novo serviço). |

**Melhorias adicionais em `Program.cs`:**
- Log diagnóstico no startup mostra `DATABASE_URL`, `ConnectionStrings:DefaultConnection`, `PGHOST` (mascarados) — facilita diagnóstico em futuros deploys.
- Fallback adicional: se `DATABASE_URL` e `ConnectionStrings__DefaultConnection` não estiverem disponíveis, monta a connection string a partir das variáveis individuais `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE`.

**Resultado da validação (todos endpoints contra prod):**

| # | Endpoint | Resultado |
|---|---|---|
| 1 | GET /api/animais | 200 — 15 animais |
| 2 | GET /api/animais/{slug} | 200 |
| 3 | POST /api/auth/cadastro | 201 |
| 4 | POST /api/auth/login | 200 — JWT 255 chars |
| 5 | POST /api/auth/login (senha errada) | 401 |
| 6 | POST /api/pedidos | 200 — pedido criado |
| 7 | GET /api/pedidos/meus | 200 |
| 8 | POST /api/favoritos/{slug} | 201 |
| 9 | GET /api/favoritos/meus | 200 |
| 10 | DELETE /api/favoritos/{slug} | 204 |
| 11 | GET /api/usuarios/me | 200 |
| 12 | PUT /api/usuarios/me | 200 — nome/telefone atualizados |
| 13 | DELETE /api/usuarios/me | 204 — cascade delete confirmado (GET pós-delete → 404) |

**Validação end-to-end local concluída ✅** — front em `localhost:3000` consumindo API em `localhost:5173`, todas as páginas navegáveis e operações funcionando (cadastro, login, adotar, favoritar, perfil).

**Ajustes adicionais durante a validação local:**
- `Program.cs`: porta default trocada de `8080` para `5173` (bate com `scripts/config.js`). Railway continua usando `PORT` env var em produção.
- `serve.json`: adicionados rewrites para todas as páginas (`/animais` → `/animais.html`, etc.) — permite acesso direto pela URL sem extensão.
- `DEV.md` criado com guia de execução local.
- `dev.sh` criado para subir back + front com um comando.

### Limpeza pós-Etapa 16 ✅

Depois da validação completa em produção e local, foram removidos artefatos
que ficaram obsoletos:

| Item | Motivo |
|---|---|
| `backend/PawsPlace.Api/Migrations/` (pasta) | Substituída por `EnsureCreated()` no `Program.cs`. As migrations eram SQLite-only e não funcionavam em PostgreSQL — manter o arquivo confundiria leitura futura. |
| `data/animais.json` (e pasta `data/`) | Era fallback caso a API estivesse offline. Removido após validação — fallback estava mascarando problemas reais durante o desenvolvimento e a API em produção está estável. |
| Branch `connectionString.StartsWith("Host=")` no `Program.cs` | Redundante após adição do parser de URI (`BuildNpgsqlFromUri`) e fallback via variáveis individuais `PGHOST/PGPORT/...`. |

`scripts/data.js` ficou com um comentário breve explicando o histórico do fallback removido — preserva contexto para quem ler o código depois.

**Próximos passos:** priorizar funcionalidades da Fase 3 (testes xUnit no back, painel admin, paginação, refresh token).
