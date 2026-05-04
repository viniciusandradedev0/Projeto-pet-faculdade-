# 🐾 PAWS PLACE — Documento de Precificação do Projeto

**Projeto:** PAWS PLACE — Site de Adoção de Animais  
**Repositório:** [github.com/viniciusandradedev0/Projeto-pet-faculdade](https://github.com/viniciusandradedev0/Projeto-pet-faculdade)  
**Data de referência:** Maio de 2026  
**Mercado:** Brasil (valores em R$)

---

## 1. Visão Geral do Projeto

O PAWS PLACE é um site multi-página de adoção responsável de animais, desenvolvido com HTML5, CSS3 e JavaScript ES6+, sem framework. O projeto conta com dark mode, acessibilidade (ARIA), conformidade com LGPD, sistema de filtros dinâmicos, modal de adoção e módulos JS separados por página.

### Escopo atual (o que existe hoje)

| Entregável | Detalhes |
|---|---|
| Páginas HTML | 7 páginas (index, animais, sobre, contato, login, cadastro, política de privacidade) |
| Estilização | CSS com design tokens, variáveis, dark mode, layout responsivo |
| JavaScript | Módulos ES6 nativos: main.js, animais-page.js, cadastro.js |
| Dados | JSON local como base de dados (pasta `/data`) |
| Funcionalidades | Filtro + busca por animais, modal de adoção, sistema de toast, botão voltar ao topo, toggle de tema |
| Acessibilidade | aria-label, aria-current, aria-live, aria-pressed, noscript, semântica HTML5 |
| LGPD | Checkbox de consentimento, política de privacidade, finalidade descrita |
| Dark Mode | Anti-flash com script síncrono, localStorage persistência |

---

## 2. Estimativa de Horas por Etapa

Esta tabela mostra o tempo estimado para desenvolver o projeto do zero, considerando o nível de complexidade atual.

| Etapa | Descrição | Horas estimadas |
|---|---|---|
| Planejamento & UX | Estrutura das páginas, fluxo de usuário, wireframes | 8–12h |
| Design (CSS) | Design tokens, variáveis, dark mode, responsividade, componentes | 18–24h |
| HTML estrutural | 7 páginas com semântica, ARIA e LGPD | 12–16h |
| JavaScript — Lógica geral | main.js: tema, modal, toast, back-to-top | 10–14h |
| JavaScript — Animais | animais-page.js: filtros, busca, renderização de cards | 12–16h |
| JavaScript — Auth | cadastro.js + login.js: validação, toggle de senha | 8–10h |
| Dados (JSON) | Estruturação dos dados dos animais | 3–5h |
| Testes & Ajustes | Cross-browser, mobile, revisão de acessibilidade | 8–10h |
| **TOTAL** | | **79–107 horas** |

---

## 3. Precificação por Perfil de Desenvolvedor

Com base em dados de mercado do Brasil em 2025/2026 (fontes: Glassdoor, Robert Half, Código Fonte TV, GoDaddy Freelancer Guide).

### 3.1 Valor por hora (freelancer, Brasil)

| Perfil | Valor/hora (R$) | Referência de mercado |
|---|---|---|
| Estudante / júnior iniciante | R$ 30 – R$ 50/h | Plataformas como 99freelas, Workana |
| Desenvolvedor júnior | R$ 50 – R$ 80/h | Glassdoor, GoDaddy |
| Desenvolvedor pleno | R$ 80 – R$ 130/h | Glassdoor, Robert Half |
| Desenvolvedor sênior | R$ 150 – R$ 300/h | Robert Half 2026 |

### 3.2 Custo total estimado do projeto (hoje)

Considerando o escopo atual (79–107 horas):

| Perfil do desenvolvedor | Faixa de custo total |
|---|---|
| Estudante / júnior iniciante | R$ 2.400 – R$ 5.350 |
| Desenvolvedor júnior | R$ 3.950 – R$ 8.560 |
| Desenvolvedor pleno | R$ 6.320 – R$ 13.910 |
| Desenvolvedor sênior | R$ 11.850 – R$ 32.100 |

> **Estimativa mais realista para este projeto:** desenvolvido por um freelancer júnior/pleno, o PAWS PLACE custaria entre **R$ 4.500 e R$ 9.000**, considerando o nível técnico demonstrado no código (dark mode, ARIA, módulos ES6, LGPD).

### 3.3 Comparativo com o mercado (sites similares)

| Tipo de site | Faixa de mercado (2026) | Posição do PAWS PLACE |
|---|---|---|
| Landing page simples | R$ 800 – R$ 2.000 | Acima — projeto multi-página |
| Site institucional (4–8 páginas) | R$ 2.500 – R$ 7.000 | ✅ Dentro desta faixa |
| Site com autenticação + filtros | R$ 5.000 – R$ 15.000 | ✅ Dentro desta faixa |
| Site com back-end + banco de dados | R$ 8.000 – R$ 25.000 | Próxima fase do projeto |

---

## 4. Custos de Hospedagem e Manutenção (recorrentes)

Para colocar e manter o site no ar após o desenvolvimento:

| Item | Custo estimado | Frequência |
|---|---|---|
| Domínio `.com.br` (Registro.br) | R$ 40 | Anual |
| Domínio `.com` | R$ 55 – R$ 80 | Anual |
| Hospedagem compartilhada (básica) | R$ 20 – R$ 50/mês | Mensal |
| Hospedagem VPS (para back-end futuro) | R$ 80 – R$ 200/mês | Mensal |
| SSL (a maioria das hospedagens inclui grátis) | R$ 0 – R$ 100 | Anual |
| Deploy estático gratuito (Vercel/Netlify) | **R$ 0** | — |
| Manutenção mensal (opcional, freelancer) | R$ 150 – R$ 500/mês | Mensal |

> **Dica:** O PAWS PLACE, em sua versão atual (front-end estático), pode ser hospedado **gratuitamente** no Vercel ou Netlify, sem nenhum custo recorrente.

---

## 5. Valorização com Melhorias Futuras

Cada evolução agrega valor ao projeto. Estimativas de horas adicionais:

| Melhoria | Horas adicionais | Valor agregado (R$, júnior/pleno) |
|---|---|---|
| Hamburger menu responsivo | 3–5h | R$ 210 – R$ 650 |
| Back-end Node.js + Express (API REST) | 20–35h | R$ 1.400 – R$ 4.550 |
| Banco de dados (Supabase ou SQLite) | 15–25h | R$ 1.050 – R$ 3.250 |
| Autenticação real (JWT ou Supabase Auth) | 10–18h | R$ 700 – R$ 2.340 |
| Envio de e-mail (EmailJS ou Nodemailer) | 5–8h | R$ 350 – R$ 1.040 |
| Painel administrativo de animais | 20–30h | R$ 1.400 – R$ 3.900 |

### Valor estimado do projeto com back-end completo

Com todas as melhorias implementadas, o projeto passaria a valer entre **R$ 12.000 e R$ 25.000** no mercado, competindo com plataformas institucionais de ONGs e abrigos de animais.

---

## 6. Resumo Executivo

| | Valor |
|---|---|
| **Horas de desenvolvimento (estimado)** | 79 – 107 horas |
| **Custo atual do projeto (freelancer júnior/pleno)** | **R$ 4.500 – R$ 9.000** |
| **Custo com back-end completo** | **R$ 12.000 – R$ 25.000** |
| **Hospedagem estática (Vercel)** | **Gratuita** |
| **Hospedagem com back-end** | R$ 80 – R$ 200/mês |
| **Domínio anual** | R$ 40 – R$ 80/ano |

---

*Documento gerado em maio de 2026. Valores baseados em pesquisa de mercado brasileiro (Glassdoor, Robert Half, Código Fonte TV, HostGator, Cronoshare). Preços são estimativas e podem variar conforme região, experiência do profissional e complexidade final do projeto.*
