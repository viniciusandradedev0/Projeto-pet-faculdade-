/**
 * modal.js
 * Gerencia o modal de adoção, validação do formulário e toasts de feedback.
 *
 * ⚠️ NOTA: Na Fase 2, o modal de adoção será substituído pela página adotar.html.
 * Este arquivo continuará exportando mostrarToast() (usado em todo o site).
 */

import {
  validarCampo,
  validarFormulario,
  conectarValidacaoAoVivo,
  limparErros,
} from './validacao.js';

// === ÍCONES DOS TOASTS ===
const ICONES_TOAST = {
  sucesso: '✅',
  erro: '⚠️',
  info: 'ℹ️',
};

// === ESTADO INTERNO ===
let modalRef = null;
let tituloAnimalRef = null;
const supportsDialog = typeof HTMLDialogElement === 'function';

function fecharModal() {
  if (!modalRef) return;
  if (supportsDialog && typeof modalRef.close === 'function') {
    modalRef.close();
  } else {
    modalRef.removeAttribute('open');
  }
}

export function abrirModalAdocao(nomeAnimal) {
  if (!modalRef || !tituloAnimalRef) {
    console.warn('⚠️ Modal não inicializado nesta página.');
    return;
  }

  tituloAnimalRef.textContent = nomeAnimal;

  if (supportsDialog && typeof modalRef.showModal === 'function') {
    modalRef.showModal();
  } else {
    modalRef.setAttribute('open', '');
  }

  setTimeout(() => document.getElementById('form-nome')?.focus(), 50);
}

export function mostrarToast(mensagem, tipo = 'info', duracao = 4000) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.warn('⚠️ #toast-container não encontrado. Mensagem:', mensagem);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  toast.innerHTML = `
    <span class="toast__icone" aria-hidden="true">${ICONES_TOAST[tipo]}</span>
    <span class="toast__texto">${mensagem}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-saindo');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duracao);
}

export function conectarBotoesAdotar() {
  document.querySelectorAll('[data-lista]').forEach((container) => {
    if (container.dataset.adotarConectado === 'true') return;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-adotar');
      if (!btn) return;
      const nome = btn.dataset.animalNome;
      if (nome) abrirModalAdocao(nome);
    });

    container.dataset.adotarConectado = 'true';
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

export function inicializarModalAdocao() {
  const modal = document.getElementById('modal-adocao');
  const form = document.getElementById('form-adocao');
  const tituloAnimal = document.getElementById('modal-nome-animal');

  if (!modal || !form || !tituloAnimal) return;

  modalRef = modal;
  tituloAnimalRef = tituloAnimal;

  // === Fechar: backdrop ou botões com data-fechar-modal ===
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-fechar-modal]')) {
      fecharModal();
    }
  });

  // === Reset do form ao fechar ===
  modal.addEventListener('close', () => {
    form.reset();
    limparErros(form); // ← agora vem do módulo central
  });

  // === Validação on-blur (módulo central) ===
  conectarValidacaoAoVivo(form);

  // === Submit ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { ok, primeiroInvalido } = validarFormulario(form, [
      'nome',
      'email',
      'telefone',
      'consentimento',
    ]);

    if (!ok) {
      primeiroInvalido?.focus();
      mostrarToast('⚠️ Verifique os campos destacados.', 'erro');
      return;
    }

    const dados = Object.fromEntries(new FormData(form));

    // 🔒 Evidência LGPD
    dados.consentimentoTimestamp = new Date().toISOString();
    dados.consentimentoVersao = '1.0';

    console.log('Dados com evidência de consentimento:', dados);

    mostrarToast(
      `Pedido enviado! Em breve entraremos em contato sobre ${tituloAnimal.textContent}. 🐾`,
      'sucesso'
    );

    fecharModal();
  });
}
