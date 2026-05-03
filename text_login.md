# 🐾 PAWS PLACE — Guia Rápido de Teste

Guia simples para cadastrar, logar e limpar dados durante os testes.

---

## 🚀 Como cadastrar um usuário

1. Abra `cadastro.html` no navegador
2. Preencha os campos:
   - **Nome:** seu nome
   - **E-mail:** ex. `vinicius@teste.com`
   - **Telefone:** com DDD (ex. `41999998888`)
   - **Senha:** mínimo 6 caracteres
   - ⚠️ **Evite senhas comuns** como `senha123` — o Chrome avisa que estão em vazamentos. Use algo como `PawsPlace2026!`
3. Marque o consentimento LGPD
4. Clique em **Cadastrar**

✅ Você será redirecionado para o login com uma mensagem de sucesso.

---

## 🔓 Como fazer login

1. Abra `login.html`
2. Digite e-mail e senha cadastrados
3. (Opcional) Marque **"Lembrar de mim"** para manter logado mesmo após fechar o navegador
4. Clique em **Entrar**

✅ Vai redirecionar para a home com um toast de boas-vindas.

---

## 🧹 Como limpar tudo do localStorage

Abra o **Console do navegador** (`F12` → aba **Console**) e cole:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Isso apaga **todos** os dados (usuários, sessões, tema, etc.) e recarrega a página.

### Limpar só usuários e sessões (mantendo tema)

```javascript
localStorage.removeItem('paws-usuarios');
localStorage.removeItem('paws-sessao');
sessionStorage.removeItem('paws-sessao');
location.reload();
```

---

## 🔍 Comandos úteis no Console

### Ver usuários cadastrados

```javascript
JSON.parse(localStorage.getItem('paws-usuarios') || '[]');
```

### Ver sessão ativa

```javascript
// Se "Lembrar de mim" foi marcado:
JSON.parse(localStorage.getItem('paws-sessao') || 'null');

// Se NÃO foi marcado:
JSON.parse(sessionStorage.getItem('paws-sessao') || 'null');
```

### Fazer logout pelo console

```javascript
const { logout } = await import('./scripts/auth.js');
logout();
location.reload();
```

---

## ⚠️ Avisos comuns

### "Mude sua senha" (alerta do Chrome)

É um aviso do **navegador**, não do site. Aparece quando a senha digitada está em vazamentos públicos (ex. `senha123`, `123456`).

✅ **Solução:** use uma senha forte tipo `PawsPlace2026!` ou `MinhaSenh@99`.

### "E-mail ou senha incorretos"

- Confira se digitou a senha exata do cadastro
- Cuidado com **autocomplete** do navegador (pode preencher errado)
- Se esqueceu, limpe o localStorage e cadastre de novo

---

## 📦 Chaves usadas no Storage

| Chave | Onde | Conteúdo |
|---|---|---|
| `paws-usuarios` | localStorage | Lista de usuários cadastrados |
| `paws-sessao` | local **ou** session | Sessão ativa (`{ email }`) |
| `paws-tema` | localStorage | Tema escolhido (`light` / `dark`) |
| `paws-mensagem-redirect` | sessionStorage | Toast pendente entre páginas |

---

## 🎯 Fluxo de teste recomendado

1. Limpa tudo (`localStorage.clear()`)
2. Cadastra um usuário com senha forte
3. Faz login
4. Navega pelo site logado
5. Faz logout
6. Tenta logar de novo
7. Repete com "Lembrar de mim" marcado e fecha/abre o navegador

🐾 **Pronto pra testar!**
