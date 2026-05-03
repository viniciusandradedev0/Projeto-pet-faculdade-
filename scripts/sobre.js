/**
 * sobre.js
 * Controlador da página /sobre.html
 *
 * Responsabilidades:
 * - Inicializar componentes globais (tema + voltar-ao-topo)
 *
 * Esta página é estática (sem dados dinâmicos), portanto NÃO usa:
 * - data.js / render.js  → não há cards de animais
 * - modal.js             → não há botão "ADOTAR"
 * - filtros.js           → não há sistema de filtros
 * - animacoes.js         → não há .card pra animar
 *
 * Reusa 100% dos módulos compartilhados — zero duplicação de código.
 */

import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';

/**
 * Bootstrap da página Sobre.
 */
function init() {
  inicializarTema();
  inicializarBotaoVoltarTopo();
}

// === Bootstrap idempotente ===
// Executa só após o DOM estar pronto, mesmo se o script for carregado tarde
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
