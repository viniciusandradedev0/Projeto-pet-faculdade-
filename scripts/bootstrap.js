/**
 * bootstrap.js
 * Inicialização comum a todas as páginas do PAWS PLACE.
 *
 * Responsabilidades:
 * 1. Tema claro/escuro (toggle + persistência)
 * 2. Botão "voltar ao topo"
 * 3. Header dinâmico (estado de login)
 * 4. Toast de mensagem-redirect (vinda de outra página via sessionStorage)
 *
 * USO:
 *   import { inicializarBootstrap } from './bootstrap.js';
 *   inicializarBootstrap();
 *   // ... depois, init específico da página
 */

import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
import { mostrarToast } from './modal.js';
import { sessao, CHAVES } from './storage.js';
import { atualizarHeader } from './header.js';

// 🔹 NOVO: re-exporta o mostrarToast pra quem quiser usar via bootstrap
export { mostrarToast };

// ============================================
// MENSAGEM-REDIRECT
// ============================================

/**
 * Salva uma mensagem para ser exibida na PRÓXIMA página carregada.
 * Útil para redirects (logout, sessão expirada, cadastro concluído, etc.).
 *
 * @param {string} texto              - Mensagem a exibir
 * @param {'sucesso'|'erro'|'info'} tipo - Estilo do toast (padrão: 'info')
 *
 * @example
 *   salvarMensagemRedirect('Até logo, Vinicius! 👋', 'sucesso');
 *   window.location.href = 'index.html';
 */
export function salvarMensagemRedirect(texto, tipo = 'info') {
  sessao.salvar(CHAVES.MENSAGEM_REDIRECT, { texto, tipo });
}

/**
 * Lê (e CONSOME) a mensagem-redirect pendente, exibindo-a como toast.
 * Roda automaticamente em toda página via inicializarBootstrap().
 */
function exibirMensagemRedirectPendente() {
  const mensagem = sessao.ler(CHAVES.MENSAGEM_REDIRECT);
  if (!mensagem?.texto) return;

  // Consome IMEDIATAMENTE (antes de exibir) para evitar duplicação
  // se algo der errado no toast.
  sessao.remover(CHAVES.MENSAGEM_REDIRECT);

  // Pequeno delay para garantir que o toast-container já está no DOM
  // e a animação de entrada não compete com o paint inicial.
  setTimeout(() => {
    mostrarToast(mensagem.texto, mensagem.tipo || 'info');
  }, 100);
}

// ============================================
// API PÚBLICA
// ============================================

/**
 * Inicializa todos os componentes globais da página.
 * Deve ser chamada UMA VEZ no init() de cada controller, ANTES da lógica específica.
 */
export function inicializarBootstrap() {
  inicializarTema();
  inicializarBotaoVoltarTopo();
  atualizarHeader();              // Atualiza nav com estado de login
  exibirMensagemRedirectPendente();
}
