/**
 * cadastro.js
 * Controlador da página cadastro.html.
 *
 * Fluxo:
 *  1. Inicializa bootstrap (tema, header, voltar-topo, toasts pendentes)
 *  2. Se já estiver logado → redireciona pra home
 *  3. Conecta validação ao vivo (blur/change) usando validacao.js
 *  4. Valida tudo no submit, chama auth.cadastrar() + auth.login()
 *  5. Redireciona com toast de boas-vindas
 */

import {
  inicializarBootstrap,
  salvarMensagemRedirect,
  mostrarToast,
} from './bootstrap.js';
import { cadastrar, login, estaLogado } from './auth.js';
import {
  validarCampo,
  validarFormulario,
  conectarValidacaoAoVivo,
} from './validacao.js';

/* ================================================================
   1. Setup inicial
   ================================================================ */

inicializarBootstrap();

// Se já tá logado, não faz sentido ficar na página de cadastro
if (estaLogado()) {
  salvarMensagemRedirect('Você já está logado! 🐾', 'info');
  window.location.replace('index.html');
}

/* ================================================================
   2. Referências do DOM
   ================================================================ */

const form = document.getElementById('form-cadastro');
const btnCadastrar = document.getElementById('btn-cadastrar');

/* ================================================================
   3. Toggle de visibilidade das senhas
   ================================================================ */

document.querySelectorAll('[data-toggle-senha]').forEach((btn) => {
  const idCampo = btn.dataset.toggleSenha;
  const input = document.getElementById(idCampo);
  if (!input) return;

  btn.addEventListener('click', () => {
    const visivel = input.type === 'text';
    input.type = visivel ? 'password' : 'text';
    btn.setAttribute('aria-pressed', String(!visivel));
    btn.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
    btn.closest('.campo-senha')?.classList.toggle('campo-senha--visivel', !visivel);
  });
});

/* ================================================================
   4. Validação ao vivo (blur / change)
   ================================================================ */

conectarValidacaoAoVivo(form);

// Extra: quando a senha original muda, revalida a confirmação se já foi tocada
const inputSenha = form.elements['senha'];
const inputSenhaConfirmar = form.elements['senhaConfirmar'];

inputSenha?.addEventListener('input', () => {
  if (inputSenhaConfirmar?.value) {
    validarCampo(form, inputSenhaConfirmar);
  }
});

/* ================================================================
   5. Submit
   ================================================================ */

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const camposParaValidar = [
    'nome',
    'email',
    'telefone',
    'senha',
    'senhaConfirmar',
    'consentimento',
  ];

  const { ok, primeiroInvalido } = validarFormulario(form, camposParaValidar);

  if (!ok) {
    mostrarToast('Corrija os erros antes de continuar.', 'erro');
    primeiroInvalido?.focus();
    return;
  }

  // Trava o botão (evita duplo-clique)
  btnCadastrar.disabled = true;
  const textoOriginal = btnCadastrar.textContent;
  btnCadastrar.textContent = 'Criando conta...';

  try {
    const dados = {
      nome: form.elements['nome'].value.trim(),
      email: form.elements['email'].value.trim().toLowerCase(),
      telefone: form.elements['telefone'].value.trim(),
      senha: form.elements['senha'].value,
    };

    // 1) Cadastra
    await cadastrar(dados);

    // 2) Loga automaticamente (UX: usuário já entra direto após criar conta)
    await login({
      email: dados.email,
      senha: dados.senha,
      lembrar: false, // sessão da aba apenas (mais seguro como padrão)
    });

    // 3) Redireciona com mensagem de boas-vindas
    const primeiroNome = dados.nome.split(/\s+/)[0];
    salvarMensagemRedirect(
      `Bem-vindo ao PAWS PLACE, ${primeiroNome}! 🐾`,
      'sucesso'
    );
    window.location.href = 'index.html';
  } catch (erro) {
    const msg = erro?.message || 'Erro inesperado ao cadastrar.';

    // Se for email duplicado, destaca o campo e foca nele
    if (/e-?mail.*j[áa].*cadastrad/i.test(msg)) {
      const campoEmail = form.elements['email'];
      campoEmail.setAttribute('aria-invalid', 'true');
      const erroEl = form.querySelector('[data-erro="email"]');
      if (erroEl) erroEl.textContent = 'Este e-mail já está cadastrado.';
      campoEmail.focus();
    }

    mostrarToast(msg, 'erro');

    btnCadastrar.disabled = false;
    btnCadastrar.textContent = textoOriginal;
  }
});
