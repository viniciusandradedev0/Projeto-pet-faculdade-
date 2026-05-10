/**
 * perfil.js
 * Controller da página de perfil do usuário logado.
 *
 * Responsabilidades:
 *  - Protege a rota (redireciona se não logado)
 *  - Busca os dados do usuário via GET /api/usuarios/me
 *  - Exibe os dados na tela
 *  - Permite excluir a conta com confirmação via <dialog> nativo
 */

import { inicializarBootstrap, salvarMensagemRedirect, mostrarToast } from './bootstrap.js';
import { protegerRota } from './proteger-rota.js';
import { apiFetch } from './config.js';

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  inicializarBootstrap();

  const usuario = protegerRota({ mensagem: 'Faça login para acessar seu perfil. 🐾' });
  if (!usuario) {
    // Rota protegida — o redirect já foi disparado, interrompe execução
    return;
  }

  try {
    await preencherPagina();
  } catch (erro) {
    console.error('[perfil] Erro ao carregar dados:', erro);
    mostrarToast('Não foi possível carregar seu perfil. Tente novamente.', 'erro');
  }

  configurarDialogExclusao();
}

// ============================================
// PREENCHE DADOS NA TELA
// ============================================

/**
 * Formata uma data ISO 8601 para o formato legível em pt-BR.
 * Ex.: "2024-03-15T10:00:00.000Z" → "15 de março de 2024"
 *
 * @param {string} iso
 * @returns {string}
 */
function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Busca os dados do usuário na API e preenche os elementos de exibição.
 */
async function preencherPagina() {
  const res = await apiFetch('/api/usuarios/me');
  if (!res.ok) throw new Error('Sessão inválida.');
  const usuario = await res.json(); // { id, nome, email, telefone, dataCadastro }

  const nomeEl = document.getElementById('perfil-nome-titulo');
  if (nomeEl) nomeEl.textContent = usuario.nome;

  const campos = {
    'perfil-nome':     usuario.nome,
    'perfil-email':    usuario.email,
    'perfil-telefone': usuario.telefone || '—',
    'perfil-data':     formatarData(usuario.dataCadastro),
  };
  Object.entries(campos).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

// ============================================
// EXCLUSÃO DE CONTA
// ============================================

/**
 * Configura os eventos do dialog de confirmação de exclusão.
 */
function configurarDialogExclusao() {
  const dialog     = document.getElementById('dialog-confirmar-exclusao');
  const btnExcluir  = document.getElementById('btn-excluir-conta');
  const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
  const btnCancelar  = document.getElementById('btn-cancelar-exclusao');

  /**
   * Abre o dialog nativo de confirmação.
   */
  function abrirDialogExclusao() {
    if (dialog) dialog.showModal();
  }

  /**
   * Fecha o dialog sem fazer nada.
   */
  function fecharDialog() {
    if (dialog) dialog.close();
  }

  /**
   * Executa a exclusão da conta via API:
   *  1. DELETE /api/usuarios/me
   *  2. Remove o JWT do storage
   *  3. Redireciona para a home com mensagem de despedida
   */
  async function confirmarExclusao() {
    try {
      const res = await apiFetch('/api/usuarios/me', { method: 'DELETE' });

      if (res.ok) {
        // Remove o JWT de ambos os storages
        localStorage.removeItem('paws-jwt');
        sessionStorage.removeItem('paws-jwt');

        salvarMensagemRedirect('Sua conta foi excluída. Até logo! 👋', 'info');
        window.location.replace('index.html');
      } else {
        mostrarToast('Não foi possível excluir sua conta. Tente novamente.', 'erro');
        fecharDialog();
      }
    } catch {
      mostrarToast('Erro de conexão. Verifique sua internet e tente novamente.', 'erro');
      fecharDialog();
    }
  }

  // Vincula eventos
  if (btnExcluir)   btnExcluir.addEventListener('click', abrirDialogExclusao);
  if (btnConfirmar) btnConfirmar.addEventListener('click', confirmarExclusao);
  if (btnCancelar)  btnCancelar.addEventListener('click', fecharDialog);

  // Fecha o dialog ao clicar fora (no backdrop nativo)
  if (dialog) {
    dialog.addEventListener('click', (evento) => {
      // O clique é no backdrop quando o alvo é o próprio <dialog>
      if (evento.target === dialog) fecharDialog();
    });
  }
}

// ============================================
// PONTO DE ENTRADA
// ============================================

init();
