/**
 * meus-pedidos.js
 * Controlador da página /meus-pedidos.html
 *
 * Responsabilidades:
 * - Proteger a rota (requer login)
 * - Buscar pedidos do usuário na API REST (GET /api/pedidos/meus) com paginação server-side
 * - Renderizar lista de pedidos com status
 * - Exibir estado vazio com CTA para animais.html
 * - Renderizar controles de paginação (Anterior / Próxima)
 */

import { protegerRota } from './proteger-rota.js';
import { inicializarBootstrap, mostrarToast } from './bootstrap.js';
import { apiFetch } from './config.js';

// ============================================
// CONFIGURAÇÃO DE STATUS
// ============================================

const CONFIG_STATUS = {
  pendente:   { rotulo: 'Aguardando análise', classe: 'status--pendente' },
  em_analise: { rotulo: 'Em análise',         classe: 'status--analise'  },
  aprovado:   { rotulo: 'Aprovado',           classe: 'status--aprovado' },
  recusado:   { rotulo: 'Recusado',           classe: 'status--recusado' },
};

const ICONE_ESPECIE = { gato: '🐱', cachorro: '🐶' };

const TAMANHO_PAGINA = 5;

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  inicializarBootstrap();

  const usuario = protegerRota({ mensagem: 'Faça login para ver seus pedidos de adoção. 🐾' });
  if (!usuario) return;

  await carregarPagina(1);
}

// ============================================
// CARREGAMENTO DE PÁGINA
// ============================================

async function carregarPagina(pagina) {
  const lista = document.getElementById('lista-pedidos');
  const estadoVazio = document.getElementById('estado-vazio');
  const contadorEl = document.getElementById('contador-pedidos');

  try {
    const res = await apiFetch(`/api/pedidos/meus?pagina=${pagina}&tamanhoPagina=${TAMANHO_PAGINA}`);
    if (!res.ok) throw new Error('Falha ao buscar pedidos.');

    const envelope = await res.json(); // { itens, pagina, tamanhoPagina, totalItens, totalPaginas, temProxima, temAnterior }
    const pedidos = envelope.itens;

    // Limpa os cards da página anterior antes de renderizar os novos
    lista.innerHTML = '';
    removerControlePaginacao();

    if (envelope.totalItens === 0) {
      lista.hidden = true;
      if (estadoVazio) estadoVazio.hidden = false;
      if (contadorEl) contadorEl.hidden = true;
      return;
    }

    if (estadoVazio) estadoVazio.hidden = true;
    lista.hidden = false;

    if (contadorEl) {
      contadorEl.textContent = `${envelope.totalItens} pedido${envelope.totalItens > 1 ? 's' : ''}`;
      contadorEl.hidden = false;
    }

    const fragment = document.createDocumentFragment();
    pedidos.forEach(pedido => fragment.appendChild(criarCardPedido(pedido)));
    lista.appendChild(fragment);

    // Só renderiza a paginação se houver mais de uma página
    if (envelope.totalPaginas > 1) {
      renderizarControlePaginacao(envelope);
    }

  } catch (err) {
    console.error('[meus-pedidos]', err);
    mostrarToast('Não foi possível carregar seus pedidos.', 'erro');
  }
}

// ============================================
// PAGINAÇÃO
// ============================================

/**
 * Remove o controle de paginação existente (se houver) do DOM.
 */
function removerControlePaginacao() {
  const existente = document.getElementById('controle-paginacao-pedidos');
  if (existente) existente.remove();
}

/**
 * Cria e insere os controles de paginação abaixo da lista de pedidos.
 *
 * @param {{ pagina: number, totalPaginas: number, temAnterior: boolean, temProxima: boolean }} envelope
 */
function renderizarControlePaginacao(envelope) {
  const { pagina, totalPaginas, temAnterior, temProxima } = envelope;

  const nav = document.createElement('nav');
  nav.id = 'controle-paginacao-pedidos';
  nav.setAttribute('aria-label', 'Paginação de pedidos');
  nav.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:1.5rem;';

  const btnAnterior = document.createElement('button');
  btnAnterior.type = 'button';
  btnAnterior.className = 'btn btn--secundario';
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = !temAnterior;
  btnAnterior.setAttribute('aria-disabled', String(!temAnterior));

  const info = document.createElement('span');
  info.className = 'paginacao__info';
  info.textContent = `Página ${pagina} de ${totalPaginas}`;

  const btnProxima = document.createElement('button');
  btnProxima.type = 'button';
  btnProxima.className = 'btn btn--secundario';
  btnProxima.textContent = 'Próxima';
  btnProxima.disabled = !temProxima;
  btnProxima.setAttribute('aria-disabled', String(!temProxima));

  btnAnterior.addEventListener('click', () => {
    if (temAnterior) carregarPagina(pagina - 1);
  });

  btnProxima.addEventListener('click', () => {
    if (temProxima) carregarPagina(pagina + 1);
  });

  nav.appendChild(btnAnterior);
  nav.appendChild(info);
  nav.appendChild(btnProxima);

  // Insere após a lista de pedidos
  const lista = document.getElementById('lista-pedidos');
  lista.insertAdjacentElement('afterend', nav);
}

// ============================================
// RENDERIZAÇÃO
// ============================================

function criarCardPedido(pedido) {
  const config = CONFIG_STATUS[pedido.status] || CONFIG_STATUS.pendente;
  const icone = ICONE_ESPECIE[pedido.animalEspecie] || '🐾';
  const dataFormatada = formatarData(pedido.dataPedido);

  const li = document.createElement('li');
  const article = document.createElement('article');
  article.className = 'pedido-card';

  article.innerHTML = `
    <div class="pedido-card__icone" aria-hidden="true">${icone}</div>

    <div class="pedido-card__info">
      <h2 class="pedido-card__nome">${pedido.animalNome}</h2>
      <p class="pedido-card__detalhe">
        ${pedido.animalEspecie === 'gato' ? 'Gato' : 'Cachorro'}
        &nbsp;·&nbsp;
        <time datetime="${pedido.dataPedido}">Pedido em ${dataFormatada}</time>
      </p>
    </div>

    <div class="pedido-card__status">
      <span class="status-badge ${config.classe}" role="status">
        ${config.rotulo}
      </span>
    </div>
  `;

  li.appendChild(article);
  return li;
}

function formatarData(isoString) {
  try {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

// ============================================
// BOOTSTRAP
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
