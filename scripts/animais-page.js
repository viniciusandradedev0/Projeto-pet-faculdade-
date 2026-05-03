/**
 * animais-page.js
 * Controlador da página /animais.html
 *
 * Responsabilidades:
 * - Carregar todos os animais do JSON
 * - Renderizar listas separadas (gatos / cachorros)
 * - Inicializar filtros, busca e modal de adoção
 * - Aplicar fade-in nos cards
 *
 * Esta página NÃO compartilha controlador com a home (index.html),
 * que tem o seu próprio (main.js).
 */

import { carregarAnimais } from './data.js';
import { renderizarPorEspecie } from './render.js';
import { inicializarFiltros } from './filtros.js';
import { conectarBotoesAdotar, inicializarModalAdocao } from './modal.js';
import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
import { observarCards } from './animacoes.js';

/**
 * Bootstrap da página de animais.
 */
async function init() {
  // === Componentes globais (presentes em todas as páginas) ===
  inicializarTema();
  inicializarBotaoVoltarTopo();

  // === Modal de adoção (específico desta página + home) ===
  inicializarModalAdocao();

  // === Carrega dados ===
  const animais = await carregarAnimais();

  // === Render inicial + fade-in cascata ===
  renderizarPorEspecie(animais);
  observarCards();

  // === Filtros: re-renderiza E re-observa cards novos ===
  inicializarFiltros(animais, (filtrados) => {
    renderizarPorEspecie(filtrados);
    observarCards();
  });

  // === Conecta botões "ADOTAR" (delegação de eventos) ===
  conectarBotoesAdotar();
}

// === Bootstrap idempotente ===
// Executa só após o DOM estar pronto, mesmo se o script for carregado tarde
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
