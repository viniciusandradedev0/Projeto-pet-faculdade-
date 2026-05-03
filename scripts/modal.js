/**
 * modal.js
 * Gerencia o modal de adoção, validação do formulário e toasts de feedback.
 *
 * Uso:
 *   import { inicializarModalAdocao, conectarBotoesAdotar, mostrarToast } from './modal.js';
 *   inicializarModalAdocao();   // 1x por página (se houver modal)
 *   conectarBotoesAdotar();     // após renderizar os cards
 */

// === ÍCONES DOS TOASTS (constante de módulo, não depende do DOM) ===
const ICONES_TOAST = {
  sucesso: '✅',
  erro: '⚠️',
  info: 'ℹ️',
};

// === ESTADO INTERNO DO MÓDULO ===
// Guardado em closure pra que conectarBotoesAdotar() saiba se o modal existe.
let modalRef = null;
let tituloAnimalRef = null;
const supportsDialog = typeof HTMLDialogElement === 'function';

/**
 * Fecha o modal (com fallback para navegadores sem suporte a <dialog>).
 */
function fecharModal() {
  if (!modalRef) return;

  if (supportsDialog && typeof modalRef.close === 'function') {
    modalRef.close();
  } else {
    modalRef.removeAttribute('open');
  }
}

/**
 * Abre o modal pré-preenchendo o nome do animal.
 * Move o foco para o primeiro campo (acessibilidade).
 */
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

/**
 * Mostra uma notificação toast.
 * Funciona em qualquer página que tenha #toast-container.
 */
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

/**
 * Conecta os cliques dos botões "ADOTAR" em todos os containers [data-lista].
 * Pode ser chamada múltiplas vezes (ex.: após filtros), pois usa delegação.
 *
 * ⚠️ Para evitar handlers duplicados, marcamos o container com data-adotar-conectado.
 */
export function conectarBotoesAdotar() {
  document.querySelectorAll('[data-lista]').forEach((container) => {
    if (container.dataset.adotarConectado === 'true') return; // já conectado

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
// VALIDADORES (PT-BR)
// ============================================

const validadores = {
  nome: (v) =>
    v.trim().length >= 3 || 'Informe seu nome completo (mínimo 3 letras).',
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Digite um e-mail válido.',
  telefone: (v) =>
    v.replace(/\D/g, '').length >= 10 ||
    'Telefone deve ter DDD + número (mín. 10 dígitos).',
  consentimento: (_, campo) =>
    campo.checked ||
    'Você precisa concordar com a Política de Privacidade para continuar.',
};

/**
 * Valida um único campo, atualizando ARIA e a mensagem de erro visível.
 */
function validarCampo(form, campo) {
  const validador = validadores[campo.name];
  if (!validador) return true;

  const valor = campo.type === 'checkbox' ? campo.checked : campo.value;
  const resultado = validador(valor, campo);
  const erroEl = form.querySelector(`[data-erro="${campo.name}"]`);

  if (resultado === true) {
    campo.removeAttribute('aria-invalid');
    if (erroEl) erroEl.textContent = '';
    return true;
  }

  campo.setAttribute('aria-invalid', 'true');
  if (erroEl) erroEl.textContent = resultado;
  return false;
}

// ============================================
// INICIALIZAÇÃO (chamar 1x por página)
// ============================================

/**
 * Inicializa o modal de adoção:
 * - Conecta listeners de fechar (backdrop, botões, ESC nativo do <dialog>)
 * - Conecta validação dos campos
 * - Conecta envio do formulário
 *
 * Sai silenciosamente se a página não tiver o modal.
 */
export function inicializarModalAdocao() {
  const modal = document.getElementById('modal-adocao');
  const form = document.getElementById('form-adocao');
  const tituloAnimal = document.getElementById('modal-nome-animal');

  // Guard clause: página não tem modal → sai sem erro
  if (!modal || !form || !tituloAnimal) return;

  // Salva referências no escopo do módulo (acessadas por abrirModalAdocao)
  modalRef = modal;
  tituloAnimalRef = tituloAnimal;

  // === Fechar: backdrop ou botões com data-fechar-modal ===
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-fechar-modal]')) {
      fecharModal();
    }
  });

  // === Reset do form ao fechar (ESC nativo do <dialog> também dispara 'close') ===
  modal.addEventListener('close', () => {
    form.reset();
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) =>
      el.removeAttribute('aria-invalid')
    );
    form.querySelectorAll('.campo__erro').forEach((el) => (el.textContent = ''));
  });

  // === Validação on-blur (ou on-change pra checkbox) ===
  form.querySelectorAll('input, textarea').forEach((campo) => {
    const evento = campo.type === 'checkbox' ? 'change' : 'blur';
    campo.addEventListener(evento, () => validarCampo(form, campo));
  });

  // === Submit ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const camposObrigatorios = ['nome', 'email', 'telefone', 'consentimento'];
    let tudoOk = true;
    let primeiroInvalido = null;

    camposObrigatorios.forEach((nome) => {
      const campo = form.elements[nome];
      if (!campo) return;
      if (!validarCampo(form, campo)) {
        tudoOk = false;
        if (!primeiroInvalido) primeiroInvalido = campo;
      }
    });

    if (!tudoOk) {
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
