/**
 * modal.js
 * Exporta mostrarToast() — usado em todo o site via bootstrap.js.
 *
 * O modal de adoção foi substituído pela página adotar.html (Etapa 3).
 */

const ICONES_TOAST = {
  sucesso: '✅',
  erro: '⚠️',
  info: 'ℹ️',
};

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
