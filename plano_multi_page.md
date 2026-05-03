# 🐾 PAWS PLACE — Plano de Evolução do Projeto

> Documento de continuidade do projeto. Status atual + próximos passos detalhados.
> **Stack:** HTML + CSS + JavaScript (vanilla)

---

## ✅ STATUS ATUAL DO PROJETO

### Funcionalidades já implementadas
- [x] Estrutura base com HTML semântico
- [x] Sistema de design tokens (CSS variables)
- [x] Tema claro/escuro com persistência
- [x] Listagem de animais com dados em JSON
- [x] Filtros (espécie, porte, idade)
- [x] Modal de detalhes do animal
- [x] Página de Política de Privacidade
- [x] Botão "Voltar ao topo" com anel de progresso
- [x] Favicon emoji 🐾 (SVG inline)
- [x] Acessibilidade básica (a11y) e prefers-reduced-motion

### Estrutura atual de pastas

PROJETO-PET-FACULDADE/
├── data/
│   └── animais.json
├── scripts/
│   ├── animacoes.js
│   ├── animais-page.js
│   ├── contato.js
│   ├── data.js
│   ├── filtros.js
│   ├── main.js
│   ├── modal.js
│   ├── render.js
│   ├── sobre.js
│   ├── tema.js
│   └── voltar-topo.js
├── styles/
│   ├── base.css
│   ├── components.css
│   ├── contato.css
│   ├── home.css
│   ├── main.css
│   ├── politica.css
│   ├── sobre.css
│   └── tokens.css
├── animais.html
├── contato.html
├── index.html
├── plano_multi_page.md
├── politica-privacidade.html
├── README.md
└── sobre.html


## 🗺️ VISÃO GERAL DAS FASES

| Fase | Objetivo | Status |
|---|---|---|
| **Fase 1** | Migração para Multi-page (rotas reais) | ⏳ Próxima |
| **Fase 2** | Páginas de Login e Pedidos de Adoção | 🔜 Após Fase 1 |

## ❓ PERGUNTAS PENDENTES (responder antes de começar Etapa B)

1. **🗂️ Estrutura proposta:** OK? Algo a alterar?

# 🔐 FASE 2 — LOGIN E PEDIDOS DE ADOÇÃO

> ⚠️ **ATENÇÃO:** Esta será a **fase atual do projeto após concluir a Fase 1**.
> A implementação **se limitará exclusivamente** às funcionalidades descritas abaixo.

## 🎯 Objetivo

Permitir que o usuário:
1. **Crie uma conta e faça login** no site
2. **Solicite a adoção** de um animal através de um formulário estruturado
3. **Acompanhe** os pedidos de adoção que ele já fez

---

## 📦 Escopo definido (o que ENTRA nesta fase)

### Página `login.html` 🆕
- Formulário de **Login** (e-mail + senha)
- Formulário de **Cadastro** (nome, e-mail, senha, telefone)
- Alternância entre Login ↔ Cadastro (tabs ou botões)
- Validação client-side (campos obrigatórios, formato de e-mail, força de senha)
- Mensagens de erro/sucesso amigáveis
- Link "Esqueci minha senha" (placeholder, sem implementação real ainda)

### Página `adotar.html` 🆕
- Acessada ao clicar em "Quero adotar" no card/modal do animal
- Formulário de **Pedido de Adoção** com campos:
  - Dados do animal (preenchidos automaticamente via query string ou localStorage)
  - Dados do adotante (puxados do perfil logado)
  - Endereço residencial completo
  - Tipo de moradia (casa/apartamento, com quintal?)
  - Possui outros animais? Quais?
  - Há crianças na residência?
  - Motivo para adotar (textarea)
  - Aceite dos termos e responsabilidades (checkbox obrigatório)
- Confirmação visual ao enviar (modal ou página de sucesso)

### Página `meus-pedidos.html` 🆕
- Lista dos pedidos de adoção feitos pelo usuário logado
- Status de cada pedido (Em análise / Aprovado / Recusado)
- Detalhes ao clicar em cada pedido

### Restrições e proteções
- Usuário **não logado** que tente acessar `adotar.html` ou `meus-pedidos.html` é redirecionado para `login.html`
- Após login, header mostra **"Olá, [Nome]"** + botão "Sair"
- Botão "Quero adotar" só funciona se o usuário estiver logado (caso contrário, redireciona para login)

---

## 🚫 Fora de escopo desta fase (NÃO implementar)
- ❌ Backend real (vamos usar `localStorage` como simulação)
- ❌ Recuperação de senha por e-mail
- ❌ Login social (Google, Facebook)
- ❌ Painel administrativo da ONG
- ❌ Sistema de aprovação/recusa de pedidos por admin
- ❌ Notificações em tempo real
- ❌ Upload de documentos/comprovantes
- ❌ Sistema de doações/pagamentos
- ❌ Chat com a ONG
- ❌ Avaliações ou comentários
- ❌ Histórico médico/vacinas dos animais

---

## 🛠️ Stack técnica da Fase 2
- **Persistência:** `localStorage` (simulando banco de dados)
- **Sessão:** `sessionStorage` ou objeto em `localStorage` com flag `isLoggedIn`
- **Senhas:** **NÃO armazenar em texto plano** — usar hash simples (ex.: `SubtleCrypto` API nativa do browser) **com aviso explícito** de que isso é didático e não substitui um backend real
- **Validação:** API nativa de Constraint Validation + JS customizado
- **Sem dependências externas** (mantém o vanilla)

---

## 📂 Estrutura de pastas após Fase 2

```
PAWS-PLACE-PROJECT/
├── data/
│   ├── animais.json
│   └── pedidos-mock.json     🆕 (estrutura de exemplo)
├── scripts/
│   ├── (todos os anteriores)
│   ├── auth.js               🆕 login, cadastro, logout, getUserAtual
│   ├── login-page.js         🆕 controlador da página login
│   ├── adotar-page.js        🆕 controlador do formulário de adoção
│   ├── meus-pedidos.js       🆕 listagem de pedidos do usuário
│   └── storage.js            🆕 wrapper sobre localStorage
├── styles/
│   ├── (todos os anteriores)
│   ├── auth.css              🆕 login/cadastro
│   └── adotar.css            🆕 formulário de adoção
├── login.html                🆕
├── adotar.html               🆕
├── meus-pedidos.html         🆕
└── (demais páginas)
```

---

## 🪜 Roadmap da Fase 2 — Etapas sugeridas

### 📍 Etapa F — Modelagem de dados
Definir formato dos objetos `usuario` e `pedidoAdocao` no localStorage.

### 📍 Etapa G — Módulo `auth.js` + `storage.js`
Funções utilitárias: `cadastrar()`, `login()`, `logout()`, `usuarioAtual()`, `estaLogado()`.

### 📍 Etapa H — Página `login.html`
HTML + CSS + integração com `auth.js`.

### 📍 Etapa I — Atualização do header (estado logado)
Mostrar nome do usuário + botão "Sair" quando logado.

### 📍 Etapa J — Página `adotar.html`
Formulário de adoção, com proteção de rota (só logado acessa).

### 📍 Etapa K — Página `meus-pedidos.html`
Listagem dos pedidos do usuário atual.

### 📍 Etapa L — Integração final
Botão "Quero adotar" no card/modal redireciona corretamente.

---

# 🚀 COMO RETOMAR ESTE PROJETO

Quando voltar a trabalhar, faça assim:

1. Abra este documento
2. Confira o **Status Atual** (o que já está pronto)
3. Identifique em qual **Fase** e **Etapa** você parou
4. Responda as perguntas pendentes da fase atual
5. Continue da próxima etapa

### Prompt sugerido para retomar com a IA:

> "Vamos retomar o projeto PAWS PLACE. Estou na **Fase [X], Etapa [Y]** do plano. Segue o documento completo em anexo + minhas respostas às perguntas pendentes: [colar respostas]. Pode seguir."

---

# 📚 GLOSSÁRIO TÉCNICO RÁPIDO

- **Multi-page (MPA):** site com várias páginas HTML reais, navegação recarrega a página
- **Single-page (SPA):** uma página só, navegação simulada via JS (React, Vue)
- **DRY:** Don't Repeat Yourself — princípio de não duplicar código
- **a11y:** abreviação de "accessibility" (acessibilidade)
- **SEO:** Search Engine Optimization — otimização para buscadores
- **`aria-current="page"`:** atributo que indica ao leitor de tela qual é a página atual no menu
- **localStorage:** armazenamento persistente do navegador (sobrevive ao fechamento da aba)
- **sessionStorage:** armazenamento temporário (limpa ao fechar a aba)
- **Hash de senha:** transformação irreversível de senha em string ininteligível, para não armazenar em texto plano
- **Auth (autenticação):** processo de identificar quem é o usuário (login)
- **Authz (autorização):** processo de verificar o que o usuário pode fazer (permissões)

---

**Fim do documento. Bons estudos e boa codada! 🐾**