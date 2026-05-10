# Guia de Deploy — Paws Place API no Railway

## Pré-requisitos
- Conta no GitHub (já tem)
- Conta no Railway: https://railway.app (criar grátis com GitHub)

---

## Passo 1 — Criar conta no Railway

1. Acesse https://railway.app
2. Clique em **Login** → **Login with GitHub**
3. Autorize o Railway a acessar seus repositórios

---

## Passo 2 — Criar o projeto

1. No dashboard do Railway, clique em **New Project**
2. Escolha **Deploy from GitHub repo**
3. Selecione o repositório `Projeto-pet-faculdade`
4. Railway vai detectar o código — clique em **Add service** e depois em **GitHub Repo**

---

## Passo 3 — Configurar o diretório raiz

1. Clique no serviço criado
2. Vá em **Settings** → **Source**
3. Em **Root Directory**, digite: `backend/PawsPlace.Api`
4. Clique em **Save**

---

## Passo 4 — Adicionar o banco PostgreSQL

1. No projeto Railway, clique em **+ New** → **Database** → **Add PostgreSQL**
2. Aguarde o banco ser criado (~30 segundos)
3. O Railway vai criar automaticamente a variável `DATABASE_URL` — a API já está configurada para usá-la

---

## Passo 5 — Configurar variáveis de ambiente

No serviço da API, vá em **Variables** e adicione:

| Nome | Valor |
|------|-------|
| `Jwt__Secret` | Gere uma string aleatória de 32+ caracteres (ex: `AbCdEf123456GhIjKl789012MnOpQr34`) |
| `Jwt__Issuer` | `PawsPlace.Api` |
| `Jwt__Audience` | `PawsPlace.Front` |
| `Jwt__ExpiracaoHoras` | `8` |
| `CORS_ORIGINS` | `https://viniciusandradedev0.github.io` |

> **Como gerar o JWT Secret:** abra qualquer terminal e rode:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Passo 6 — Fazer o deploy

1. Após configurar as variáveis, vá em **Deploy** → **Deploy Now**
2. Acompanhe os logs — deve aparecer `Now listening on: http://0.0.0.0:PORT`
3. O deploy leva ~2 minutos na primeira vez (build do .NET)

---

## Passo 7 — Pegar a URL da API

1. Após o deploy, vá em **Settings** → **Networking** → **Generate Domain**
2. Copie a URL gerada (ex: `https://projeto-pet-faculdade-production.up.railway.app`)

---

## Passo 8 — Atualizar o front-end

Abra `scripts/config.js` e substitua o placeholder pela URL real:

```js
// Antes:
: 'https://PLACEHOLDER_URL_PRODUCAO';

// Depois (exemplo):
: 'https://projeto-pet-faculdade-production.up.railway.app';
```

Faça commit e push — o GitHub Pages vai atualizar automaticamente.

---

## Passo 9 — Testar

Execute os testes manuais com a API em produção:
- Cadastro → Login → Adotar → Ver pedidos → Perfil
- Verificar no DevTools → Application → LocalStorage que `paws-jwt` aparece

---

## Troubleshooting

| Problema | Solução |
|---------|---------|
| Deploy falha com erro de build | Verifique se **Root Directory** está como `backend/PawsPlace.Api` |
| `JWT Secret não configurado` | Adicione a variável `Jwt__Secret` nas Settings |
| CORS bloqueando requests | Confirme que `CORS_ORIGINS` tem exatamente a URL do GitHub Pages |
| Banco não conecta | Verifique se o serviço PostgreSQL está no mesmo projeto Railway |
