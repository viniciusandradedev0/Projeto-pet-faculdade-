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
import { inicializarFavoritos } from './favoritos.js';

async function init() {
  inicializarBootstrap();

  // Busca todos os animais em uma única requisição (tamanhoPagina=50) para
  // que os filtros client-side e o renderizarPorEspecie continuem funcionando
  // sem paginação adicional — o catálogo tem poucos registros (≤ 50).
  const envelope = await carregarAnimais({ pagina: 1, tamanhoPagina: 50 });
  const animais = envelope.itens;

  renderizarPorEspecie(animais);
  observarCards();
  await inicializarFavoritos();

  inicializarFiltros(animais, async (filtrados) => {
    renderizarPorEspecie(filtrados);
    observarCards();
    await inicializarFavoritos();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
