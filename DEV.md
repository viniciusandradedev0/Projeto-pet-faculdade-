# Rodar localmente — Paws Place

Guia rápido para subir backend + frontend em modo desenvolvimento.

## Pré-requisitos

- .NET SDK 8.0 (`dotnet --version` deve mostrar `8.x`)
- Node.js (para `npx serve`)
- Branch `desenvolvimento` (ou qualquer derivada com a Etapa 14+ aplicada)

## Forma rápida — script único

Na raiz do projeto:

```bash
./dev.sh
```

O script sobe a API em `localhost:5173` e o front em `localhost:3000`, mostrando os logs dos dois. `Ctrl+C` derruba os dois juntos.

## Forma manual — dois terminais

### Terminal 1 — Backend (.NET API)

```bash
cd backend/PawsPlace.Api
dotnet run
```

Aguarde até aparecer:
```
Now listening on: http://0.0.0.0:5173
[DB] Usando SQLite (dev)
```

O banco SQLite local fica em `backend/PawsPlace.Api/paws-place.db`. Já vem populado com 15 animais via seed.

### Terminal 2 — Frontend (servidor estático)

Na raiz do projeto:
```bash
npx serve
```

Abre em `http://localhost:3000`. O `scripts/config.js` detecta `localhost` e aponta automaticamente para a API em `localhost:5173`.

## Conferindo que está funcionando

1. Acesse `http://localhost:3000` no navegador
2. Abra DevTools (F12) → aba **Network**
3. Clique em "Animais" no menu
4. Deve aparecer `GET localhost:5173/api/animais` retornando **200** com 15 animais

Se aparecer aviso amarelo no console **"API indisponível, usando fallback local"** → backend não está respondendo. Confira se o terminal 1 está rodando e na porta 5173.

## Resetar o banco local

```bash
rm backend/PawsPlace.Api/paws-place.db*
```

Na próxima vez que rodar `dotnet run`, o schema é recriado e o seed roda de novo.

## URLs úteis

| O quê | URL |
|---|---|
| Front local | http://localhost:3000 |
| API local | http://localhost:5173 |
| GET animais (smoke test) | http://localhost:5173/api/animais |
| Front produção (GitHub Pages) | https://viniciusandradedev0.github.io/Projeto-pet-faculdade/ |
| API produção (Railway) | https://projeto-pet-faculdade-production.up.railway.app |

## Variáveis e ambientes

| Variável | Onde é lida | Default em dev |
|---|---|---|
| `PORT` | `Program.cs` | 5173 |
| `DATABASE_URL` | `Program.cs` (PG em prod) | `<vazio>` |
| `ConnectionStrings__DefaultConnection` | `appsettings*.json` | `Data Source=paws-place.db` (SQLite) |

Em dev, nenhuma variável precisa ser definida — os defaults bastam.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `ERR_CONNECTION_REFUSED` no console | Backend não está rodando ou em outra porta | Terminal 1: `dotnet run` na pasta `backend/PawsPlace.Api` |
| `GET /animais 404` (sem `.html`) | Rewrites do `serve.json` não foram lidos | Reinicie o `npx serve` |
| `Failed to load resource: ...lockdown-install.js` | Avisos do Brave/Chrome, irrelevantes | Ignorar |
| Banco sem animais | Seed não rodou (raro) | Apague `paws-place.db*` e reinicie o back |
