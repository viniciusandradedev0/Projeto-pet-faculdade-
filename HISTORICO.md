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
| Deploy | GitHub Pages (front) · Railway/Render (back — planejado) |

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

## Próximo — Etapa 14: Migração do front para consumir a API

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

## Fluxo de autenticação (Fase 2 — planejado)

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
