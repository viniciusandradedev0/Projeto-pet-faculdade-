// scripts/main.js (apenas o trecho que muda)

import { carregarAnimais } from './data.js';
import { renderizarPorEspecie } from './render.js';
import { inicializarFiltros } from './filtros.js';
// ⬇️ ADICIONAR inicializarModalAdocao
import { conectarBotoesAdotar, inicializarModalAdocao } from './modal.js';
import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
import { observarCards } from './animacoes.js';

async function init() {
  inicializarTema();
  inicializarBotaoVoltarTopo();
  inicializarModalAdocao();   // ⬅️ NOVO

  const animais = await carregarAnimais();

  renderizarPorEspecie(animais);
  observarCards();

  inicializarFiltros(animais, (filtrados) => {
    renderizarPorEspecie(filtrados);
    observarCards();
  });

  conectarBotoesAdotar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
