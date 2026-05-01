/**
 * main.js
 * Ponto de entrada da aplicação.
 * Carrega os dados e dispara a renderização inicial.
 */

import { carregarAnimais } from './data.js';
import { renderizarPorEspecie } from './render.js';

/**
 * Inicializa a aplicação.
 */
async function init() {
  const animais = await carregarAnimais();
  renderizarPorEspecie(animais);

  // Log útil para debug durante desenvolvimento
  console.log(`✅ ${animais.length} animais carregados`);
}

// Aguarda o DOM estar pronto antes de executar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
