/**
 * favoritos.js
 * Gerencia o sistema de favoritos no front-end.
 *
 * Exporta:
 *   - inicializarFavoritos()  — preenche corações e conecta eventos
 *   - atualizarFavoritos()    — re-busca e sincroniza estados (útil após mudanças)
 */

import { estaLogado } from './auth.js';
import { apiFetch } from './config.js';
import { mostrarToast } from './bootstrap.js';

// ============================================
// HELPERS INTERNOS
// ============================================

/**
 * Retorna todos os botões de favorito presentes no DOM.
 * @returns {NodeListOf<HTMLButtonElement>}
 */
function obterBotoesFavorito() {
  return document.querySelectorAll('.btn-favorito');
}

/**
 * Marca um botão como favoritado.
 * @param {HTMLButtonElement} btn
 * @param {string} nomeAnimal
 */
function marcarComoFavoritado(btn, nomeAnimal) {
  btn.textContent = '❤️';
  btn.setAttribute('aria-pressed', 'true');
  btn.setAttribute('aria-label', `Remover ${nomeAnimal} dos favoritos`);
}

/**
 * Desmarca um botão como favoritado.
 * @param {HTMLButtonElement} btn
 * @param {string} nomeAnimal
 */
function marcarComoNaoFavoritado(btn, nomeAnimal) {
  btn.textContent = '🤍';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', `Adicionar ${nomeAnimal} aos favoritos`);
}

/**
 * Obtém o nome do animal a partir do botão (via card pai).
 * @param {HTMLButtonElement} btn
 * @returns {string}
 */
function obterNomeAnimal(btn) {
  const card = btn.closest('.card');
  if (!card) return 'animal';
  const titulo = card.querySelector('h3');
  return titulo ? titulo.textContent.trim() : 'animal';
}

// ============================================
// LÓGICA DE TOGGLE
// ============================================

/**
 * Realiza o toggle de favorito ao clicar no botão.
 * @param {HTMLButtonElement} btn
 */
async function toggleFavorito(btn) {
  if (!estaLogado()) {
    mostrarToast('Faça login para favoritar um animal. 🐾', 'info');
    return;
  }

  const slug = btn.dataset.animalId;
  const nomeAnimal = obterNomeAnimal(btn);
  const estavaFavoritado = btn.getAttribute('aria-pressed') === 'true';

  // Feedback visual imediato (otimista)
  btn.disabled = true;

  try {
    if (estavaFavoritado) {
      // Remove favorito
      const res = await apiFetch(`/api/favoritos/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 404) {
        marcarComoNaoFavoritado(btn, nomeAnimal);
        if (res.ok) {
          mostrarToast(`${nomeAnimal} removido dos favoritos. 🤍`, 'info');
        }
      } else {
        throw new Error(`Erro ao remover favorito (${res.status})`);
      }
    } else {
      // Adiciona favorito
      const res = await apiFetch(`/api/favoritos/${encodeURIComponent(slug)}`, {
        method: 'POST',
      });

      if (res.status === 201) {
        marcarComoFavoritado(btn, nomeAnimal);
        mostrarToast(`${nomeAnimal} adicionado aos favoritos! ❤️`, 'sucesso');
      } else if (res.status === 409) {
        // Já favoritado — sincroniza estado
        marcarComoFavoritado(btn, nomeAnimal);
      } else {
        throw new Error(`Erro ao adicionar favorito (${res.status})`);
      }
    }
  } catch (erro) {
    console.error('[favoritos] Erro no toggle:', erro);
    mostrarToast('Não foi possível atualizar o favorito. Tente novamente.', 'erro');
  } finally {
    btn.disabled = false;
  }
}

// ============================================
// DELEGAÇÃO DE EVENTOS
// ============================================

/**
 * Conecta delegação de evento num container de cards.
 * Usa data-fav-conectado para evitar conectar duas vezes (idempotente).
 * @param {HTMLElement} container
 */
function conectarContainerFavoritos(container) {
  if (container.dataset.adotarFavConectado) return;
  container.dataset.adotarFavConectado = 'true';

  container.addEventListener('click', (evento) => {
    const btn = evento.target.closest('.btn-favorito');
    if (!btn) return;

    evento.preventDefault();
    toggleFavorito(btn);
  });
}

/**
 * Conecta delegação de eventos em todos os containers [data-lista].
 */
function conectarTodosContainers() {
  document.querySelectorAll('[data-lista]').forEach(conectarContainerFavoritos);
}

// ============================================
// BUSCA E SINCRONIZAÇÃO DE ESTADOS
// ============================================

/**
 * Busca os favoritos do usuário e preenche os corações nos cards.
 * @returns {Promise<string[]>} slugs dos animais favoritados
 */
async function buscarESincronizarFavoritos() {
  if (!estaLogado()) return [];

  try {
    const res = await apiFetch('/api/favoritos/meus');
    if (!res.ok) {
      console.warn('[favoritos] Falha ao buscar favoritos:', res.status);
      return [];
    }

    const favoritos = await res.json();
    const slugsFavoritados = new Set(favoritos.map((f) => f.animalSlug));

    // Atualiza todos os botões de favorito presentes no DOM
    obterBotoesFavorito().forEach((btn) => {
      const slug = btn.dataset.animalId;
      const nomeAnimal = obterNomeAnimal(btn);

      if (slugsFavoritados.has(slug)) {
        marcarComoFavoritado(btn, nomeAnimal);
      } else {
        marcarComoNaoFavoritado(btn, nomeAnimal);
      }
    });

    return [...slugsFavoritados];
  } catch (erro) {
    console.error('[favoritos] Erro ao buscar favoritos:', erro);
    return [];
  }
}

// ============================================
// API PÚBLICA
// ============================================

/**
 * Inicializa o sistema de favoritos:
 * - Se não logado: apenas conecta eventos (corações ficam vazios)
 * - Se logado: busca favoritos, preenche corações e conecta eventos
 */
export async function inicializarFavoritos() {
  conectarTodosContainers();

  if (!estaLogado()) return;

  await buscarESincronizarFavoritos();
}

/**
 * Re-executa a busca e atualiza o estado dos corações.
 * Útil após mudanças (ex.: remoção da página de favoritos).
 */
export async function atualizarFavoritos() {
  await buscarESincronizarFavoritos();
}
