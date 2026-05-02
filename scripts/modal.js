/**
 * modal.js
 * Gerencia o modal de adoção, validação do formulário e toasts de feedback.
 */

const modal = document.getElementById('modal-adocao');
const form = document.getElementById('form-adocao');
const tituloAnimal = document.getElementById('modal-nome-animal');
const toastContainer = document.getElementById('toast-container');
const supportsDialog = typeof HTMLDialogElement === 'function';

function fecharModal() {
  if (supportsDialog && typeof modal.close === 'function') {
    modal.close();
  } else {
    modal.removeAttribute('open');
  }
}

/**
 * Abre o modal pré-preenchendo o nome do animal.
 * Move o foco para o primeiro campo (acessibilidade).
 */
export function abrirModalAdocao(nomeAnimal) {
  tituloAnimal.textContent = nomeAnimal;

  if (supportsDialog && typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }

  setTimeout(() => document.getElementById('form-nome').focus(), 50);
}

// === Fechar modal: backdrop, botões com data-fechar-modal e ESC (nativo) ===
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.closest('[data-fechar-modal]')) {
    fecharModal();
  }
});

modal.addEventListener('close', () => {
  form.reset();
  form.querySelectorAll('[aria-invalid="true"]').forEach((el) =>
    el.removeAttribute('aria-invalid')
  );
  form.querySelectorAll('.campo__erro').forEach((el) => (el.textContent = ''));
});

// === Validadores customizados (mensagens em PT-BR) ===
const validadores = {
  nome: (v) =>
    v.trim().length >= 3 || 'Informe seu nome completo (mínimo 3 letras).',
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Digite um e-mail válido.',
  telefone: (v) =>
    v.replace(/\D/g, '').length >= 10 ||
    'Telefone deve ter DDD + número (mín. 10 dígitos).',
};

function validarCampo(campo) {
  const validador = validadores[campo.name];
  if (!validador) return true;

  const resultado = validador(campo.value);
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

form.querySelectorAll('input, textarea').forEach((campo) => {
  campo.addEventListener('blur', () => validarCampo(campo));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const camposObrigatorios = ['nome', 'email', 'telefone'];
  let tudoOk = true;
  let primeiroInvalido = null;

  camposObrigatorios.forEach((nome) => {
    const campo = form.elements[nome];
    if (!validarCampo(campo)) {
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

  mostrarToast(
    `Pedido enviado! Em breve entraremos em contato sobre ${tituloAnimal.textContent}. 🐾`,
    'sucesso'
  );

  fecharModal();
});

const ICONES_TOAST = {
  sucesso: '✅',
  erro: '⚠️',
  info: 'ℹ️',
};

export function mostrarToast(mensagem, tipo = 'info', duracao = 4000) {
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
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-adotar');
      if (!btn) return;
      const nome = btn.dataset.animalNome;
      if (nome) abrirModalAdocao(nome);
    });
  });
}
