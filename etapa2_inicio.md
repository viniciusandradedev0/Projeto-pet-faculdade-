# CLAUDE.md — Paws Place (Front-end)

## O que é o projeto

Site de adoção de animais (gatos e cachorros). Stack completa:
- **Front:** HTML + CSS + JavaScript ES6 modules (Vanilla, sem framework), deploy no GitHub Pages
- **Back:** C# ASP.NET Core 8 Web API + SQLite, em `backend/PawsPlace.Api/`
- **Testes front:** Vitest + jsdom (125 testes)

## Estrutura do front-end

```
├── data/animais.json              # Mantido como referência — Etapa 14 migra para API
├── scripts/
│   ├── storage.js                 # Wrapper de localStorage/sessionStorage (simplificado na Etapa 14)
│   ├── auth.js                    # Cadastro, login, logout (SHA-256 — migra para fetch na Etapa 14)
│   ├── validacao.js               # Validadores PT-BR (sem alteração na Etapa 14)
│   ├── proteger-rota.js           # Proteção de rotas (migra: verifica JWT na Etapa 14)
│   ├── header.js                  # Menu dinâmico (sem alteração)
│   ├── bootstrap.js               # Inicialização global (sem alteração)
│   ├── tema.js                    # Dark/light mode (sem alteração)
│   ├── data.js                    # Fetch de animais (migra para GET /api/animais na Etapa 14)
│   ├── filtros.js                 # Busca e filtro (sem alteração)
│   ├── render.js                  # Renderização de cards (sem alteração)
│   ├── modal.js                   # Apenas mostrarToast()
│   ├── animais-page.js            # Controlador de animais.html
│   ├── main.js                    # Controlador da index.html
│   ├── adotar.js                  # Pedido de adoção (migra para POST /api/pedidos)
│   ├── meus-pedidos.js            # Histórico (migra para GET /api/pedidos/meus)
│   ├── perfil.js                  # Perfil + excluir conta (migra para /api/usuarios/me)
│   ├── cadastro.js                # Controlador de cadastro.html
│   ├── login.js                   # Controlador de login.html
│   ├── contato.js                 # Controlador de contato.html
│   ├── sobre.js                   # Controlador de sobre.html
│   ├── animacoes.js               # Fade-in com IntersectionObserver
│   └── voltar-topo.js             # Scroll-to-top com progresso
├── styles/
│   ├── main.css                   # Importa todos os outros CSS
│   ├── tokens.css, base.css, components.css
│   ├── header.css, home.css, auth.css
│   ├── adotar.css, meus-pedidos.css, perfil.css
│   └── contato.css, sobre.css, politica.css
├── tests/
│   ├── auth.test.js               # 34 testes
│   ├── storage.test.js            # 28 testes
│   ├── validacao.test.js          # 43 testes
│   └── filtros.test.js            # 20 testes  →  total: 125
├── index.html, animais.html, adotar.html
├── meus-pedidos.html, perfil.html
├── cadastro.html, login.html, contato.html
├── sobre.html, politica-privacidade.html
├── package.json                   # Vitest + jsdom
├── vitest.config.js
└── .gitignore
```

## Chaves de storage — estado atual (Fase 1)

### localStorage
- `paws-tema` — 'light' | 'dark' **(permanece na Etapa 14)**
- `paws-usuarios` — array de usuários **(removido na Etapa 14 → banco de dados)**
- `paws-sessao` — {email} do logado **(removido na Etapa 14 → JWT)**
- `paws-pedidos` — array de pedidos **(removido na Etapa 14 → banco de dados)**

### localStorage — após Etapa 14
- `paws-tema` — preferência de tema
- `paws-jwt` — token JWT (só se "lembrar de mim" marcado; se não, vai para sessionStorage)
  → Remoção do "lembrar de mim" planejada para Fase 3 (substituir por refresh token)

### sessionStorage
- `paws-sessao` — {email} sem lembrar **(removido na Etapa 14)**
- `paws-mensagem-redirect` — toast pós-redirect **(permanece)**
- `paws-redirect-pos-login` — URL de retorno **(permanece)**

## Roadmap do front-end

- [x] Etapa 1 — Fundação do projeto
- [x] Etapa 2 — Autenticação e cadastro (localStorage + SHA-256)
- [x] Etapa 3 — adotar.html (página dedicada, rota protegida)
- [x] Etapa 4 — meus-pedidos.html (simulação de status)
- [x] Etapa 5 — perfil.html (dados + excluir conta)
- [x] Etapa 6 — politica-privacidade.html (LGPD real)
- [x] Etapa 7 — Vitest (125 testes)
- [x] Etapa 8 — Polimento (console, semântica HTML, CSS)
- [ ] Etapa 14 — Migração para consumir a API (ver etapasFase3esboço.txt)

## Convenções do front

- Idioma do código: português (variáveis, funções, comentários)
- ES6 modules nativos (`type="module"` no HTML)
- Sem frameworks ou bibliotecas externas
- Acessibilidade: aria-live, aria-invalid, semântica HTML5, prefers-reduced-motion
- LGPD: consentimento com timestamp + versão em adotar.html e contato.html
- Prefixo `paws-` em todas as chaves de storage
- Testes: `npm test` (Vitest + jsdom)
- Deploy: https://viniciusandradedev0.github.io/Projeto-pet-faculdade/
