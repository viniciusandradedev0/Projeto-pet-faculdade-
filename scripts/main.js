/**
 * main.js
 * Ponto de entrada da aplicação.
 */

import { carregarAnimais } from './data.js';
import { renderizarPorEspecie } from './render.js';
import { inicializarFiltros } from './filtros.js';
import { conectarBotoesAdotar } from './modal.js';
import { inicializarTema } from './tema.js';
import { observarCards } from './animacoes.js';

async function init() {
  // Tema (sincroniza ARIA do botão com o tema já aplicado)
  inicializarTema();

  const animais = await carregarAnimais();

  // Render inicial + fade-in
  renderizarPorEspecie(animais);
  observarCards();

  // Filtros: re-renderiza E re-observa cards novos
  inicializarFiltros(animais, (filtrados) => {
    renderizarPorEspecie(filtrados);
    observarCards();
  });

  // Botões "ADOTAR"
  conectarBotoesAdotar();

  console.log(`✅ ${animais.length} animais carregados`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
