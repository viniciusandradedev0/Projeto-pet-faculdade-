/**
 * bootstrap.js
 * Inicialização comum a todas as páginas do PAWS PLACE.
 *
 * Responsabilidades:
 * 1. Tema claro/escuro (toggle + persistência)
 * 2. Botão "voltar ao topo"
 * 3. Toast de mensagem-redirect (vinda de outra página via sessionStorage)
 *
 * 🔮 Fase 2 adicionará aqui:
 * - Renovação de sessão (auth.js)
 * - Atualização do header com nome do usuário logado
 *
 * USO:
 *   import { inicializarBootstrap } from './bootstrap.js';
 *   inicializarBootstrap();
 *   // ... depois, init específico da página
 */

import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
import { mostrarToast } from './modal.js';

// ============================================
// MENSAGEM-REDIRECT
// ============================================

/**
 * Chave usada no sessionStorage para mensagens entre páginas.
 * Padrão: "paws-<contexto>" para evitar colisão com outros projetos no mesmo domínio.
 */
const CHAVE_MENSAGEM_REDIRECT = 'paws-mensagem-redirect';

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
  try {
    sessionStorage.setItem(
      CHAVE_MENSAGEM_REDIRECT,
      JSON.stringify({ texto, tipo })
    );
  } catch (err) {
    // sessionStorage pode estar bloqueado (modo privado restrito, cookies off)
    console.warn('[bootstrap] Não foi possível salvar mensagem-redirect:', err);
  }
}

/**
 * Lê (e CONSOME) a mensagem-redirect pendente, exibindo-a como toast.
 * Roda automaticamente em toda página via inicializarBootstrap().
 */
function exibirMensagemRedirectPendente() {
  let raw;
  try {
    raw = sessionStorage.getItem(CHAVE_MENSAGEM_REDIRECT);
  } catch {
    return; // sessionStorage indisponível → ignora silenciosamente
  }

  if (!raw) return;

  // Consome IMEDIATAMENTE (antes de exibir) para evitar duplicação
  // se algo der errado no parse ou no toast.
  try {
    sessionStorage.removeItem(CHAVE_MENSAGEM_REDIRECT);
  } catch {
    /* noop */
  }

  let mensagem;
  try {
    mensagem = JSON.parse(raw);
  } catch {
    console.warn('[bootstrap] mensagem-redirect malformada, ignorando.');
    return;
  }

  if (!mensagem?.texto) return;

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
  exibirMensagemRedirectPendente();
}
