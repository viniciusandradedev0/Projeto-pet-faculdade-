/**
 * favoritos-page.js
 * Controlador da página /favoritos.html
 *
 * Responsabilidades:
 * - Proteger rota (exige login)
 * - Carregar e exibir os animais favoritados do usuário
 * - Permitir remover favoritos diretamente da lista
 *
 * Rota PROTEGIDA: redireciona para login.html se não autenticado.
 */

import { inicializarBootstrap, mostrarToast } from './bootstrap.js';
import { protegerRota } from './proteger-rota.js';
import { apiFetch } from './config.js';
import { observarCards } from './animacoes.js';

// ============================================
// RENDERIZAÇÃO
// ============================================

/**
 * Cria o elemento de imagem com skeleton + fallback.
 * @param {Object} favorito
 * @returns {HTMLDivElement}
 */
function criarImagemWrapper(favorito) {
  const wrapper = document.createElement('div');
  wrapper.className = 'favorito-card__img-wrapper is-loading';

  const img = document.createElement('img');
  img.className = 'favorito-card__img';
  img.src = favorito.animalImagem || '';
  img.alt = `Foto de ${favorito.animalNome}`;
  img.loading = 'lazy';
  img.decoding = 'async';

  img.addEventListener('load', () => wrapper.classList.remove('is-loading'));
  img.addEventListener('error', () => {
    wrapper.classList.remove('is-loading');
    wrapper.classList.add('is-error');
    img.style.display = 'none';
  });

  wrapper.appendChild(img);
  return wrapper;
}

/**
 * Remove um item da lista com animação de fade.
 * @param {HTMLLIElement} item - o <li> pai do card
 * @param {string} nomeAnimal
 */
function removerItemComAnimacao(item, nomeAnimal) {
  const card = item.querySelector('.favorito-card');
  if (card) card.classList.add('favorito-card--saindo');

  setTimeout(() => {
    item.remove();
    atualizarContador();

    // Verifica se a lista ficou vazia
    const lista = document.getElementById('lista-favoritos');
    if (lista && lista.children.length === 0) {
      exibirEstadoVazio();
    }

    mostrarToast(`${nomeAnimal} removido dos favoritos. 🤍`, 'info');
  }, 300);
}

/**
 * Atualiza o contador de favoritos no DOM.
 */
function atualizarContador() {
  const lista = document.getElementById('lista-favoritos');
  const contador = document.getElementById('contador-favoritos');
  if (!lista || !contador) return;

  const total = lista.children.length;
  contador.textContent = total === 0 ? '' : `${total} ${total === 1 ? 'animal' : 'animais'}`;
}

/**
 * Exibe o estado vazio e oculta a lista/cabeçalho.
 */
function exibirEstadoVazio() {
  const estadoVazio = document.getElementById('estado-vazio');
  const cabecalho = document.querySelector('.favoritos-cabecalho');
  if (estadoVazio) estadoVazio.hidden = false;
  if (cabecalho) cabecalho.hidden = true;
}

/**
 * Cria o card de um favorito.
 * @param {Object} favorito
 * @returns {HTMLLIElement}
 */
function criarCardFavorito(favorito) {
  const li = document.createElement('li');

  const card = document.createElement('div');
  card.className = 'favorito-card';

  // Imagem
  card.appendChild(criarImagemWrapper(favorito));

  // Informações
  const info = document.createElement('div');
  info.className = 'favorito-card__info';

  const nome = document.createElement('p');
  nome.className = 'favorito-card__nome';
  nome.textContent = favorito.animalNome;

  const especie = document.createElement('p');
  especie.className = 'favorito-card__especie';
  especie.textContent = favorito.animalEspecie || '';

  info.appendChild(nome);
  info.appendChild(especie);
  card.appendChild(info);

  // Ações
  const acoes = document.createElement('div');
  acoes.className = 'favorito-card__acoes';

  const btnAdotar = document.createElement('a');
  btnAdotar.href = `adotar.html?id=${encodeURIComponent(favorito.animalSlug)}`;
  btnAdotar.className = 'btn-adotar-fav';
  btnAdotar.textContent = 'ADOTAR';
  btnAdotar.setAttribute('aria-label', `Adotar ${favorito.animalNome}`);

  const btnRemover = document.createElement('button');
  btnRemover.type = 'button';
  btnRemover.className = 'btn-remover-fav';
  btnRemover.textContent = 'Remover ♡';
  btnRemover.setAttribute('aria-label', `Remover ${favorito.animalNome} dos favoritos`);
  btnRemover.dataset.slug = favorito.animalSlug;

  btnRemover.addEventListener('click', () => aoRemoverFavorito(favorito, li, btnRemover));

  acoes.appendChild(btnAdotar);
  acoes.appendChild(btnRemover);
  card.appendChild(acoes);

  li.appendChild(card);
  return li;
}

/**
 * Renderiza a lista de favoritos no DOM.
 * @param {Array} favoritos
 */
function renderizarFavoritos(favoritos) {
  const lista = document.getElementById('lista-favoritos');
  const contador = document.getElementById('contador-favoritos');
  if (!lista) return;

  lista.innerHTML = '';

  const fragment = document.createDocumentFragment();
  favoritos.forEach((fav) => fragment.appendChild(criarCardFavorito(fav)));
  lista.appendChild(fragment);

  if (contador) {
    const total = favoritos.length;
    contador.textContent = `${total} ${total === 1 ? 'animal' : 'animais'}`;
  }
}

// ============================================
// AÇÕES
// ============================================

/**
 * Remove um favorito via API e atualiza o DOM.
 * @param {Object} favorito
 * @param {HTMLLIElement} item
 * @param {HTMLButtonElement} btn
 */
async function aoRemoverFavorito(favorito, item, btn) {
  btn.disabled = true;

  try {
    const res = await apiFetch(`/api/favoritos/${encodeURIComponent(favorito.animalSlug)}`, {
      method: 'DELETE',
    });

    if (res.ok || res.status === 404) {
      removerItemComAnimacao(item, favorito.animalNome);
    } else {
      throw new Error(`Erro ao remover favorito (${res.status})`);
    }
  } catch (erro) {
    console.error('[favoritos-page] Erro ao remover:', erro);
    mostrarToast('Não foi possível remover o favorito. Tente novamente.', 'erro');
    btn.disabled = false;
  }
}

// ============================================
// BOOTSTRAP DA PÁGINA
// ============================================

async function init() {
  inicializarBootstrap();

  const usuario = protegerRota({
    mensagem: 'Faça login para ver seus favoritos. 🐾',
  });
  if (!usuario) return;

  try {
    const res = await apiFetch('/api/favoritos/meus');

    if (!res.ok) {
      throw new Error(`Falha ao carregar favoritos (${res.status})`);
    }

    const favoritos = await res.json();

    if (favoritos.length === 0) {
      exibirEstadoVazio();
      return;
    }

    renderizarFavoritos(favoritos);
    observarCards();
  } catch (erro) {
    console.error('[favoritos-page] Erro ao inicializar:', erro);
    mostrarToast('Não foi possível carregar seus favoritos. Tente novamente.', 'erro');
    exibirEstadoVazio();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
