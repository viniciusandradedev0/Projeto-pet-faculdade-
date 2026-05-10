/**
 * main.js
 * Controlador da home (index.html)
 *
 * Responsabilidades:
 * - Carregar dados dos animais
 * - Atualizar estatísticas (contadores)
 * - Sortear e renderizar 4 animais em destaque
 * - Conectar modal de adoção nos cards de destaque
 * - Inicializar componentes globais (via bootstrap)
 *
 * NÃO inclui filtros nem busca — esses são exclusivos de animais.html.
 */

import { carregarAnimais } from './data.js';
import { renderizarAnimais } from './render.js';
import { inicializarBootstrap } from './bootstrap.js';
import { observarCards } from './animacoes.js';
import { inicializarFavoritos } from './favoritos.js';


// === Configurações ===
const QUANTIDADE_DESTAQUES = 4;

/**
 * Sorteia N elementos aleatórios de um array (sem repetição).
 * Usa cópia rasa pra não mutar o array original.
 *
 * @param {Array} array - array de origem
 * @param {number} n - quantidade desejada
 * @returns {Array} subconjunto aleatório
 */
function sortearAleatorios(array, n) {
  const copia = [...array];
  // Fisher-Yates shuffle (parcial — só até N elementos)
  for (let i = copia.length - 1; i > 0 && i >= copia.length - n; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(-n);
}

/**
 * Seleciona destaques de forma balanceada:
 * idealmente metade gatos, metade cachorros (quando possível).
 *
 * @param {Array} animais - lista completa
 * @param {number} total - quantidade desejada
 * @returns {Array} destaques balanceados
 */
function selecionarDestaques(animais, total) {
  const gatos = animais.filter(a => a.especie === 'gato');
  const cachorros = animais.filter(a => a.especie === 'cachorro');

  const metade = Math.floor(total / 2);
  const gatosSorteados = sortearAleatorios(gatos, Math.min(metade, gatos.length));
  const cachorrosSorteados = sortearAleatorios(
    cachorros,
    Math.min(total - gatosSorteados.length, cachorros.length)
  );

  // Combina e embaralha o resultado final pra alternar visualmente
  return sortearAleatorios([...gatosSorteados, ...cachorrosSorteados], total);
}

/**
 * Atualiza os contadores de estatísticas no DOM.
 *
 * @param {Array} animais - lista completa de animais
 */
function atualizarEstatisticas(animais) {
  const totalGatos = animais.filter(a => a.especie === 'gato').length;
  const totalCachorros = animais.filter(a => a.especie === 'cachorro').length;
  const total = animais.length;

  const elGatos = document.getElementById('stats-gatos');
  const elCachorros = document.getElementById('stats-cachorros');
  const elTotal = document.getElementById('stats-total');

  if (elGatos) elGatos.textContent = totalGatos;
  if (elCachorros) elCachorros.textContent = totalCachorros;
  if (elTotal) elTotal.textContent = total;
}

/**
 * Renderiza os cards de destaque dentro do container.
 * Reutiliza renderizarAnimais() do módulo render.js.
 *
 * @param {Array} destaques - animais a exibir
 */
function renderizarDestaques(destaques) {
  const container = document.querySelector('[data-lista="destaques"]');
  if (!container) return;

  // Caso vazio — mensagem customizada da home
  if (destaques.length === 0) {
    container.innerHTML = `
      <p class="mensagem-vazia">
        Nenhum animal cadastrado no momento. Volte em breve! 🐾
      </p>
    `;
    return;
  }

  // Reutiliza a renderização padrão (já cuida de innerHTML, fragment, etc.)
  renderizarAnimais(destaques, container);
}

/**
 * Exibe mensagem de erro caso o JSON falhe ao carregar.
 */
function mostrarErroCarregamento() {
  const container = document.querySelector('[data-lista="destaques"]');
  if (!container) return;

  container.innerHTML = `
    <p class="mensagem-vazia">
      😿 Não foi possível carregar os animais agora. Tente novamente em alguns instantes.
    </p>
  `;
}

/**
 * Bootstrap da home.
 */
async function init() {
  // === Componentes globais (tema + voltar-topo + mensagem-redirect) ===
  inicializarBootstrap();

  // === Carrega dados ===
  try {
    const animais = await carregarAnimais();

    // === Atualiza estatísticas ===
    atualizarEstatisticas(animais);

    // === Sorteia e renderiza destaques ===
    const destaques = selecionarDestaques(animais, QUANTIDADE_DESTAQUES);
    renderizarDestaques(destaques);

    // === Anima cards (fade-in cascata) ===
    observarCards();

    // === Inicializa favoritos (preenche corações) ===
    await inicializarFavoritos();
  } catch (erro) {
    console.error('[main] Falha ao inicializar a home:', erro);
    mostrarErroCarregamento();
  }
}

// === Bootstrap idempotente ===
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
