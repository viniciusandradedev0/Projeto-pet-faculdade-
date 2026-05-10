/**
 * meus-pedidos.js
 * Controlador da página /meus-pedidos.html
 *
 * Responsabilidades:
 * - Proteger a rota (requer login)
 * - Buscar pedidos do usuário na API REST (GET /api/pedidos/meus)
 * - Renderizar lista de pedidos com status
 * - Exibir estado vazio com CTA para animais.html
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

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  inicializarBootstrap();

  const usuario = protegerRota({ mensagem: 'Faça login para ver seus pedidos de adoção. 🐾' });
  if (!usuario) return;

  const lista = document.getElementById('lista-pedidos');
  const estadoVazio = document.getElementById('estado-vazio');
  const contadorEl = document.getElementById('contador-pedidos');

  try {
    const res = await apiFetch('/api/pedidos/meus');
    if (!res.ok) throw new Error('Falha ao buscar pedidos.');

    const pedidos = await res.json(); // array de PedidoResponseDto

    if (pedidos.length === 0) {
      lista.hidden = true;
      if (estadoVazio) estadoVazio.hidden = false;
      if (contadorEl) contadorEl.hidden = true;
      return;
    }

    if (contadorEl) {
      contadorEl.textContent = `${pedidos.length} pedido${pedidos.length > 1 ? 's' : ''}`;
    }

    const fragment = document.createDocumentFragment();
    pedidos.forEach(pedido => fragment.appendChild(criarCardPedido(pedido)));
    lista.appendChild(fragment);

  } catch (err) {
    console.error('[meus-pedidos]', err);
    mostrarToast('Não foi possível carregar seus pedidos.', 'erro');
  }
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
