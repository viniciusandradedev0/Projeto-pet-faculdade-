/**
 * main.js
 * Ponto de entrada da aplicação.
 */

import { carregarAnimais } from './data.js';
import { renderizarPorEspecie } from './render.js';
import { inicializarFiltros } from './filtros.js';
import { conectarBotoesAdotar } from './modal.js';

async function init() {
  const animais = await carregarAnimais();

  // Render inicial
  renderizarPorEspecie(animais);

  // Sistema de filtros + busca (re-renderiza ao filtrar)
  inicializarFiltros(animais, (filtrados) => {
    renderizarPorEspecie(filtrados);
  });

  // Conecta botões "ADOTAR" → abre modal
  conectarBotoesAdotar();

  console.log(`✅ ${animais.length} animais carregados`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
