# 🐾 PAWS PLACE — Plano de Migração Multi-Page

> Documento de continuidade do projeto. Status atual + próximos passos detalhados.
> **Data de criação:** 02/05/2026
> **Stack:** HTML + CSS + JavaScript (vanilla, ES6 modules)

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

```
PAWS-PLACE-PROJECT/
├── data/
│   └── animais.json
├── scripts/
│   ├── animacoes.js
│   ├── data.js
│   ├── filtros.js
│   ├── main.js
│   ├── modal.js
│   ├── render.js
│   ├── tema.js
│   └── voltar-topo.js
├── styles/
│   ├── base.css
│   ├── components.css
│   ├── main.css
│   ├── politica.css
│   └── tokens.css
├── index.html
└── politica-privacidade.html
```

---

## 🎯 OBJETIVO DA PRÓXIMA FASE

Transformar o site **single-page com scroll** em um **site multi-page** com rotas reais:

- Cada item do menu (Animais, Sobre, Contato) leva a uma URL própria
- Header/footer consistentes entre páginas
- Indicação de página ativa via `aria-current="page"`
- Manter UX e estilo já desenvolvidos

### ❓ Decisão tomada: React?

**NÃO migrar para React agora.** Justificativa:
1. Projeto vanilla está sólido e funcional
2. Multi-page em HTML é fundamento essencial
3. React seria overkill para site institucional
4. Plano: terminar este projeto em vanilla → criar projeto NOVO em React (ganha 2 projetos no portfólio)

---

## 🗺️ ROADMAP — Etapas em ordem

### 📍 Etapa A — Planejamento e estrutura ✅ (já feito)
### 📍 Etapa B — Criar `animais.html` (validar abordagem)
### 📍 Etapa C — Criar `sobre.html` e `contato.html`
### 📍 Etapa D — Atualizar menu de navegação
### 📍 Etapa E — Componentizar header/footer (avaliar estratégia)

---

## 📂 ESTRUTURA PROPOSTA (após multi-page)

```
PAWS-PLACE-PROJECT/
├── data/
│   └── animais.json
├── scripts/
│   ├── animacoes.js
│   ├── data.js
│   ├── filtros.js
│   ├── main.js              ← controlador da home
│   ├── animais-page.js      🆕 controlador de /animais
│   ├── contato.js           🆕 validação do form
│   ├── modal.js
│   ├── nav.js               🆕 menu ativo + mobile
│   ├── render.js
│   ├── tema.js
│   └── voltar-topo.js
├── styles/
│   ├── base.css
│   ├── components.css
│   ├── main.css
│   ├── politica.css
│   ├── sobre.css            🆕
│   ├── contato.css          🆕
│   └── tokens.css
├── index.html               (home: hero + destaques)
├── animais.html             🆕 lista + filtros
├── sobre.html               🆕 missão, valores
├── contato.html             🆕 formulário + info
└── politica-privacidade.html
```

---

## 🧠 DECISÕES ARQUITETURAIS

### 1. Páginas no root (não em subpastas)
- ✅ `animais.html` → URL: `/animais.html`
- ❌ Evitar: `pages/animais.html` → URL feia
- 💡 Em produção (Netlify/Vercel), `.html` some automaticamente

### 2. Um JS controlador por página

| Página | JS principal | Responsabilidade |
|---|---|---|
| `index.html` | `main.js` | Hero + cards de destaque |
| `animais.html` | `animais-page.js` | Lista + filtros + modal |
| `sobre.html` | (apenas comuns) | Página estática |
| `contato.html` | `contato.js` | Validação do form |

### 3. JS compartilhados em todas as páginas
- `tema.js` — toggle dark/light
- `voltar-topo.js` — botão flutuante
- `nav.js` 🆕 — destacar item ativo + menu mobile

### 4. CSS — mantém padrão atual

| Arquivo | Carregado em | Conteúdo |
|---|---|---|
| `tokens.css` | todas | Variáveis CSS |
| `base.css` | todas | Reset + tipografia |
| `components.css` | todas | Botões, cards, header, footer, modal |
| `main.css` | `index.html`, `animais.html` | Hero, grid, filtros |
| `sobre.css` 🆕 | `sobre.html` | Layout específico |
| `contato.css` 🆕 | `contato.html` | Layout específico |
| `politica.css` | `politica-privacidade.html` | (já existe) |

---

## 🧩 ESTRATÉGIAS PARA HEADER/FOOTER (Etapa E)

### Opção A — Duplicação consciente ⭐ (recomendada para começar)
- Header/footer copiados em cada HTML
- ✅ Simples, sem mágica, sem servidor
- ✅ SEO perfeito
- ❌ Edição em múltiplos arquivos (mas busca-e-substitui resolve)

### Opção B — Includes via `fetch`
- Header/footer em arquivos separados, carregados via JS
- ✅ DRY real
- ❌ Flash de conteúdo vazio
- ❌ SEO prejudicado
- ❌ Não roda em `file://`

### Opção C — Build tool (Vite, Eleventy, Astro)
- Templates compilados em build time
- ✅ Melhor dos dois mundos
- ❌ Adiciona toolchain

**Plano:** começar com Opção A. Reavaliar na Etapa E.

---

## 📋 MAPEAMENTO DE CONTEÚDO POR PÁGINA

### `index.html` (HOME)
- Hero (mantém atual)
- Seção "Animais em destaque" (3-4 pets) + botão "Ver todos →"
- Seção curta "Como adotar" (3 passos)
- CTA para contato
- ❌ Remove: lista completa + filtros (migra para `animais.html`)

### `animais.html` 🆕
- Cabeçalho: "Nossos amiguinhos"
- Filtros (espécie, porte, idade)
- Grid completo de animais
- Modal de detalhes

### `sobre.html` 🆕
- Missão, visão, valores
- História da ONG
- Equipe (placeholder inicial)

### `contato.html` 🆕
- Formulário (nome, email, mensagem)
- Informações: endereço, telefone, e-mail, redes sociais
- Mapa (placeholder inicial)

---

## ❓ PERGUNTAS PENDENTES (responder antes de começar Etapa B)

1. **🗂️ Estrutura proposta:** OK? Algo a alterar?
2. **🏠 Conteúdo da home:** Hero + Destaques + Como Adotar + CTA, ou versão mais simples?
3. **🎨 Sobre/Contato:** já tem conteúdo real ou usar placeholders/Lorem Ipsum?
4. **🧩 Header/Footer (Etapa E):** confirmar Opção A para começar?
5. **🌐 Publicação:** GitHub Pages? Vercel? Netlify? Só local? (afeta tratamento de URLs)

---

## 💬 COMMIT DA ÚLTIMA ENTREGA (Botão Voltar ao Topo)

```bash
git add .
git commit -m "feat(ui): adiciona botão flutuante 'voltar ao topo' com anel de progresso

- Botão fixo no canto inferior direito com gradiente da marca
- Anel SVG que preenche conforme o scroll da página
- Aparece suavemente após 300px de scroll (fade + slide-in)
- Scroll suave ao clicar, com foco devolvido ao topo (a11y)
- Throttling via requestAnimationFrame para performance
- Listeners passivos no scroll/resize (otimização mobile)
- Respeita prefers-reduced-motion
- Favicon emoji 🐾 inline para corrigir 404 no console
- Implementado em index.html e politica-privacidade.html"
```

---

## 🚀 COMO RETOMAR ESTE PROJETO

Quando voltar a trabalhar, faça assim:

1. Abra este documento
2. Confira o **Status Atual** (o que já está pronto)
3. Responda as **5 perguntas pendentes** acima
4. Continue da **Etapa B — criar `animais.html`**

### Prompt sugerido para retomar com a IA:

> "Vamos retomar o projeto PAWS PLACE. Estou na **Etapa B** do plano de migração multi-page (criar `animais.html`). Segue o plano completo em anexo + minhas respostas às perguntas pendentes: [colar respostas]. Pode seguir com a Etapa B."

---

## 📚 GLOSSÁRIO TÉCNICO RÁPIDO

- **Multi-page (MPA):** site com várias páginas HTML reais, navegação recarrega a página
- **Single-page (SPA):** uma página só, navegação simulada via JS (React, Vue)
- **DRY:** Don't Repeat Yourself — princípio de não duplicar código
- **a11y:** abreviação de "accessibility" (acessibilidade)
- **SEO:** Search Engine Optimization — otimização para buscadores
- **`aria-current="page"`:** atributo que indica ao leitor de tela qual é a página atual no menu

---

**Fim do documento. Bons estudos e boa codada! 🐾**
