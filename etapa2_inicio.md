# CLAUDE.md — Paws Place

## O que e o projeto

Site de adocao de animais (gatos e cachorros) feito em HTML, CSS e JavaScript puro (ES6+ modules). Sem frameworks, sem bundler. Dados mockados em `data/animais.json`. Testes unitarios com Vitest + jsdom.

## Estrutura do projeto

```
├── data/animais.json              # Dados dos animais (fetch local)
├── scripts/
│   ├── storage.js                 # Wrapper central de localStorage/sessionStorage
│   ├── auth.js                    # Cadastro, login, logout, sessao (SHA-256 client-side)
│   ├── validacao.js               # Validadores de formulario (nome, email, telefone, senha)
│   ├── proteger-rota.js           # Protecao de rotas client-side (redireciona se nao logado)
│   ├── header.js                  # Menu dinamico (logado: Perfil, Meus Pedidos, Sair)
│   ├── bootstrap.js               # Inicializacao global (tema, header, toasts)
│   ├── tema.js                    # Dark/light mode com persistencia
│   ├── data.js                    # Fetch de animais.json
│   ├── filtros.js                 # Busca e filtro por especie com debounce
│   ├── render.js                  # Renderizacao de cards (botao ADOTAR = link para adotar.html)
│   ├── modal.js                   # Apenas mostrarToast() (modal de adocao removido na Etapa 3)
│   ├── animais-page.js            # Controlador de animais.html
│   ├── main.js                    # Controlador da index.html (home)
│   ├── adotar.js                  # Controlador de adotar.html (protegido, salva pedido)
│   ├── meus-pedidos.js            # Controlador de meus-pedidos.html (protegido)
│   ├── perfil.js                  # Controlador de perfil.html (protegido, excluir conta)
│   ├── cadastro.js                # Controlador de cadastro.html
│   ├── login.js                   # Controlador de login.html
│   ├── contato.js                 # Controlador de contato.html
│   ├── sobre.js                   # Controlador de sobre.html
│   ├── animacoes.js               # Fade-in com IntersectionObserver
│   └── voltar-topo.js             # Botao scroll-to-top com progresso
├── styles/
│   ├── main.css                   # Importa todos os outros CSS
│   ├── tokens.css                 # Variaveis CSS
│   ├── base.css                   # Reset e utilitarios
│   ├── components.css             # Menu, card, footer, modal, toast, etc.
│   ├── header.css                 # Navegacao
│   ├── home.css                   # Estilos da index.html
│   ├── auth.css                   # Login e cadastro
│   ├── adotar.css                 # Pagina de pedido de adocao
│   ├── meus-pedidos.css           # Lista de pedidos com badges de status
│   ├── perfil.css                 # Card de perfil e zona de perigo
│   ├── contato.css                # Formulario de contato
│   ├── sobre.css                  # Pagina institucional
│   └── politica.css               # Politica de privacidade
├── tests/
│   ├── auth.test.js               # 34 testes (cadastrar, login, logout, sessao)
│   ├── storage.test.js            # 28 testes (salvar, ler, remover, limpar)
│   ├── validacao.test.js          # 43 testes (todos os validadores + validarFormulario)
│   └── filtros.test.js            # 20 testes (normalização, debounce, filtro, busca, limpar)
├── index.html                     # Home (destaques + stats)
├── animais.html                   # Catalogo com filtros
├── adotar.html                    # Pedido de adocao (rota protegida)
├── meus-pedidos.html              # Historico de pedidos (rota protegida)
├── perfil.html                    # Perfil do usuario + excluir conta (rota protegida)
├── cadastro.html                  # Registro de usuario
├── login.html                     # Autenticacao
├── contato.html                   # Formulario de contato
├── sobre.html                     # Pagina institucional
├── politica-privacidade.html      # LGPD (atualizada com dados reais do site)
├── package.json                   # Vitest + jsdom
├── vitest.config.js               # environment: jsdom, globals: true
└── .gitignore                     # node_modules/, dist/, coverage/
```

## Chaves de storage usadas

### localStorage
- `paws-tema` — 'light' | 'dark'
- `paws-usuarios` — array com todos os usuarios cadastrados
- `paws-sessao` — {email} do usuario logado (quando "lembrar de mim")
- `paws-pedidos` — array com todos os pedidos de adocao

### sessionStorage
- `paws-sessao` — {email} do usuario logado (sem lembrar)
- `paws-mensagem-redirect` — {texto, tipo} para toast pos-redirect
- `paws-redirect-pos-login` — URL de retorno apos login

## Estrutura de um pedido (paws-pedidos)

```js
{
  id: string,               // Date.now().toString(36)
  animalId: string,         // id do animal (ex: "nespresso")
  animalNome: string,
  animalEspecie: 'gato' | 'cachorro',
  usuarioEmail: string,     // chave de associacao com paws-usuarios
  nome: string,
  email: string,
  telefone: string,
  mensagem: string,
  status: 'pendente' | 'em_analise' | 'aprovado' | 'recusado',
  dataPedido: string,       // ISO 8601
  consentimentoTimestamp: string,
  consentimentoVersao: '1.0',
}
```

## Roadmap atual

- [x] Etapa 1 — Fundacao do projeto
- [x] Etapa 2 — Autenticacao e cadastro
- [x] Etapa 3 — Remover modal de adocao + criar `adotar.html` (pagina dedicada)
- [x] Etapa 4 — Criar `meus-pedidos.html` (simulacao de status de pedidos)
- [x] Etapa 5 — Criar `perfil.html` (versao minima + excluir conta)
- [x] Etapa 6 — Atualizar `politica-privacidade.html`
- [x] Etapa 7 — Testes unitarios com Vitest (125 testes passando)
  - auth.test.js (34), storage.test.js (28), validacao.test.js (43), filtros.test.js (20)
- [x] Etapa 8 — Polimento final
  - console.log de dados do usuario removido de contato.js
  - HTML semantico corrigido: article dentro de li em meus-pedidos
  - Checklist E2E manual concluido (cadastro, adocao, pedidos, excluir conta)

## Plano futuro: migrar para backend C# .NET

O projeto vai ganhar um backend em ASP.NET que substitui o localStorage por banco de dados real.

### O que muda com o backend
- `storage.js` — removido inteiramente
- `paws-usuarios` — migra para banco de dados
- `paws-sessao` — substituido por JWT ou cookie HttpOnly
- Hash SHA-256 no client — senha vai para o backend com bcrypt/argon2
- `auth.js` — vira chamadas fetch para `/api/auth/*`
- `data.js` — `animais.json` vira `GET /api/animais`
- `adotar.js` submit — vira `POST /api/pedidos`
- `meus-pedidos.js` — vira `GET /api/pedidos/{usuarioId}`
- `perfil.js` exclusao — vira `DELETE /api/usuarios/{id}`
- `proteger-rota.js` — valida token, mas autorizacao real fica no servidor

### O que NAO muda
- `validacao.js` — validacao de formulario no front continua
- `filtros.js` — filtro local continua
- `render.js`, `animacoes.js`, `tema.js`, `voltar-topo.js` — independentes do backend

### Endpoints futuros
- `POST /api/auth/cadastro` + `POST /api/auth/login` + `POST /api/auth/logout`
- `GET /api/animais`
- `POST /api/pedidos` + `GET /api/pedidos/{usuarioId}`
- `GET/PUT/DELETE /api/usuarios/{id}`

## Convencoes

- Idioma do codigo: portugues (nomes de variaveis, funcoes, comentarios)
- Modules ES6 nativos (type="module" no HTML)
- Sem frameworks ou bibliotecas externas no front
- Acessibilidade: aria-live, aria-invalid, semantica HTML5, prefers-reduced-motion
- LGPD: consentimento com timestamp e versao em formularios de adocao e contato
- Prefixo `paws-` em todas as chaves de storage
- Testes: Vitest + jsdom, rodar com `npm test` (125 testes, 4 arquivos)
- Deploy: https://viniciusandradedev0.github.io/Projeto-pet-faculdade/
