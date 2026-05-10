/**
 * meus-pedidos.js
 * Controlador da página /meus-pedidos.html
 *
 * Responsabilidades:
 * - Proteger a rota (requer login)
 * - Ler paws-pedidos do localStorage e filtrar pelo usuário logado
 * - Renderizar lista de pedidos com status
 * - Exibir estado vazio com CTA para animais.html
 */

import { protegerRota } from './proteger-rota.js';
import { obterEmailUsuario } from './auth.js';
import { storage, CHAVES } from './storage.js';
import { inicializarBootstrap } from './bootstrap.js';

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

function init() {
  inicializarBootstrap();

  const usuario = protegerRota({
    mensagem: 'Faça login para ver seus pedidos de adoção. 🐾',
  });
  if (!usuario) return;

  const emailUsuario = obterEmailUsuario();
  const todosPedidos = storage.ler(CHAVES.PEDIDOS, []);
  const meusPedidos = todosPedidos.filter((p) => p.usuarioEmail === emailUsuario);

  const lista = document.getElementById('lista-pedidos');
  const estadoVazio = document.getElementById('estado-vazio');
  const contadorEl = document.getElementById('contador-pedidos');

  if (!lista) return;

  if (meusPedidos.length === 0) {
    lista.hidden = true;
    if (estadoVazio) estadoVazio.hidden = false;
    if (contadorEl) contadorEl.hidden = true;
    return;
  }

  if (contadorEl) {
    contadorEl.textContent = `${meusPedidos.length} pedido${meusPedidos.length > 1 ? 's' : ''}`;
  }

  // Ordem: mais recentes primeiro
  const ordenados = [...meusPedidos].sort(
    (a, b) => new Date(b.dataPedido) - new Date(a.dataPedido)
  );

  const fragment = document.createDocumentFragment();
  ordenados.forEach((pedido) => fragment.appendChild(criarCardPedido(pedido)));
  lista.appendChild(fragment);
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
