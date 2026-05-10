/**
 * animais-page.js
 * Controlador da página /animais.html
 *
 * Responsabilidades:
 * - Carregar todos os animais do JSON
 * - Renderizar listas separadas (gatos / cachorros)
 * - Inicializar filtros e busca
 * - Aplicar fade-in nos cards
 *
 * 🌍 Página PÚBLICA: qualquer visitante pode ver os animais.
 * A proteção de rota fica reservada para páginas que dependem
 * do usuário logado (adotar, meus-pedidos, perfil).
 */

import { carregarAnimais } from './data.js';
import { renderizarPorEspecie } from './render.js';
import { inicializarFiltros } from './filtros.js';
import { inicializarBootstrap } from './bootstrap.js';
import { observarCards } from './animacoes.js';

async function init() {
  inicializarBootstrap();

  const animais = await carregarAnimais();

  renderizarPorEspecie(animais);
  observarCards();

  inicializarFiltros(animais, (filtrados) => {
    renderizarPorEspecie(filtrados);
    observarCards();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
