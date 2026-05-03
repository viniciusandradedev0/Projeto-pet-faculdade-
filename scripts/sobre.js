/**
 * sobre.js
 * Controlador da página /sobre.html
 *
 * Responsabilidades:
 * - Inicializar componentes globais (via bootstrap)
 *
 * Esta página é estática (sem dados dinâmicos), portanto NÃO usa:
 * - data.js / render.js  → não há cards de animais
 * - modal.js             → não há botão "ADOTAR"
 * - filtros.js           → não há sistema de filtros
 * - animacoes.js         → não há .card pra animar
 *
 * Reusa 100% dos módulos compartilhados — zero duplicação de código.
 */

import { inicializarBootstrap } from './bootstrap.js';

/**
 * Bootstrap da página Sobre.
 */
function init() {
  inicializarBootstrap();
}

// === Bootstrap idempotente ===
// Executa só após o DOM estar pronto, mesmo se o script for carregado tarde
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
