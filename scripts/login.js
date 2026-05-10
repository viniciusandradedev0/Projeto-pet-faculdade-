/**
 * login.js
 * Controlador da página de Login.
 *
 * Responsabilidades:
 * 1. Validação dos campos:
 *    - Email: regra padrão (validadores.email do módulo validacao.js)
 *    - Senha: validação relaxada (apenas "não vazio")
 *      Senhas antigas/curtas continuam podendo logar; quem decide
 *      se está correta é o auth.login().
 * 2. Submit → chama auth.login() (que LANÇA Error em caso de falha)
 * 3. Toggle de visibilidade da senha (SVG)
 * 4. Redirect pós-login (com mensagem-redirect via sessionStorage)
 *    🔹 Respeita URL de origem salva por protegerRota()
 * 5. Bloqueia acesso se já estiver logado (redireciona pra home)
 *
 * USO:
 *   <script type="module" src="scripts/login.js"></script>
 */

import { inicializarBootstrap, salvarMensagemRedirect } from './bootstrap.js';
import { login, estaLogado } from './auth.js';
import { mostrarToast } from './modal.js';
import { validarCampo } from './validacao.js';
import { obterRedirectPosLogin } from './proteger-rota.js';

// ============================================
// SELETORES
// ============================================

const SELETORES = {
  form: '#form-login',
  email: '#login-email',
  senha: '#login-senha',
  lembrar: '#login-lembrar',
  botao: '#btn-entrar',
  toggleSenha: '#toggle-senha',
  linkEsqueci: '#link-esqueci-senha',
};

// ============================================
// VALIDAÇÃO ESPECÍFICA DO LOGIN
// ============================================

/**
 * No login não usamos a regra forte de senha (8+ chars, letra, número),
 * porque ela é para CADASTRO. Aqui basta verificar se foi preenchida.
 * Quem decide se a senha está correta é o auth.login().
 *
 * @returns {{ ok: boolean, primeiroInvalido: HTMLElement | null }}
 */
function validarLogin(form) {
  let ok = true;
  let primeiroInvalido = null;

  // 1. Email — usa validador padrão do módulo
  const campoEmail = form.elements['email'];
  if (campoEmail && !validarCampo(form, campoEmail)) {
    ok = false;
    primeiroInvalido = campoEmail;
  }

  // 2. Senha — validação relaxada (só "não vazio")
  const campoSenha = form.elements['senha'];
  const erroSenhaEl = form.querySelector('[data-erro="senha"]');

  if (campoSenha) {
    if (!campoSenha.value) {
      campoSenha.setAttribute('aria-invalid', 'true');
      if (erroSenhaEl) erroSenhaEl.textContent = 'Por favor, informe sua senha.';
      ok = false;
      if (!primeiroInvalido) primeiroInvalido = campoSenha;
    } else {
      campoSenha.removeAttribute('aria-invalid');
      if (erroSenhaEl) erroSenhaEl.textContent = '';
    }
  }

  return { ok, primeiroInvalido };
}

// ============================================
// TOGGLE DE VISIBILIDADE DA SENHA
// CSS faz a troca visual automaticamente via [aria-pressed]
// ============================================

function configurarToggleSenha() {
  const btnToggle = document.querySelector(SELETORES.toggleSenha);
  const inputSenha = document.querySelector(SELETORES.senha);
  if (!btnToggle || !inputSenha) return;

  btnToggle.addEventListener('click', () => {
    const visivel = inputSenha.type === 'text';
    inputSenha.type = visivel ? 'password' : 'text';

    btnToggle.setAttribute('aria-pressed', String(!visivel));
    btnToggle.setAttribute(
      'aria-label',
      visivel ? 'Mostrar senha' : 'Ocultar senha'
    );
  });
}

// ============================================
// LINK "ESQUECI MINHA SENHA" (placeholder)
// ============================================

function configurarLinkEsqueciSenha() {
  const link = document.querySelector(SELETORES.linkEsqueci);
  if (!link) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarToast('Funcionalidade em desenvolvimento. Em breve! 🐾', 'info');
  });
}

// ============================================
// SUBMIT DO FORMULÁRIO
// ============================================

async function aoSubmeter(evento) {
  evento.preventDefault();

  const form = evento.target;
  const botao = document.querySelector(SELETORES.botao);

  // Valida campos no front
  const { ok, primeiroInvalido } = validarLogin(form);
  if (!ok) {
    primeiroInvalido?.focus();
    mostrarToast('Por favor, corrija os campos destacados.', 'erro');
    return;
  }

  // Coleta dados
  const dados = {
    email: form.elements['email'].value.trim().toLowerCase(),
    senha: form.elements['senha'].value,
    lembrar: form.elements['lembrar']?.checked ?? false,
  };

  // Loading state
  botao.classList.add('is-loading');
  botao.disabled = true;

  try {
    // ⚠️ auth.login() retorna o USUÁRIO em sucesso, e LANÇA Error em falha.
    const usuario = await login({
      email: dados.email,
      senha: dados.senha,
      lembrar: dados.lembrar,
    });

    // ✅ Sucesso! Agenda toast e redireciona
    const primeiroNome = String(usuario?.nome || 'amigo')
      .trim()
      .split(/\s+/)[0];

    salvarMensagemRedirect(
      `Bem-vindo de volta, ${primeiroNome}! 🐾`,
      'sucesso'
    );

    // Respeita URL de origem (se veio de uma rota protegida)
    const destino = obterRedirectPosLogin('index.html');
    window.location.href = destino;
  } catch (erro) {
    // ❌ Erro de credencial OU erro inesperado — auth lança Error
    console.error('[login] Falha no login:', erro);

    const mensagem = erro?.message || 'E-mail ou senha incorretos.';

    // Destaca o campo de senha (causa mais provável)
    const campoSenha = form.elements['senha'];
    const erroSenhaEl = form.querySelector('[data-erro="senha"]');
    campoSenha?.setAttribute('aria-invalid', 'true');
    if (erroSenhaEl) erroSenhaEl.textContent = mensagem;

    mostrarToast(mensagem, 'erro');
    campoSenha?.focus();
  } finally {
    botao.classList.remove('is-loading');
    botao.disabled = false;
  }
}

// ============================================
// GUARD: redireciona se já estiver logado
// ============================================

function redirecionarSeLogado() {
  if (estaLogado()) {
    salvarMensagemRedirect('Você já está logado! 🐾', 'info');
    window.location.replace('index.html');
    return true;
  }
  return false;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

function init() {
  if (redirecionarSeLogado()) return;

  inicializarBootstrap();

  const form = document.querySelector(SELETORES.form);
  if (!form) {
    console.error('[login] Formulário não encontrado.');
    return;
  }

  const campoEmail = form.elements['email'];
  if (campoEmail) {
    campoEmail.addEventListener('blur', () => validarCampo(form, campoEmail));
  }

  const campoSenha = form.elements['senha'];
  if (campoSenha) {
    campoSenha.addEventListener('input', () => {
      if (campoSenha.getAttribute('aria-invalid') === 'true') {
        campoSenha.removeAttribute('aria-invalid');
        const erroEl = form.querySelector('[data-erro="senha"]');
        if (erroEl) erroEl.textContent = '';
      }
    });
  }

  form.addEventListener('submit', aoSubmeter);
  configurarToggleSenha();
  configurarLinkEsqueciSenha();
  campoEmail?.focus();
}

// Executa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
