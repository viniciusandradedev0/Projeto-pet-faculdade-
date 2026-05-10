/**
 * data.js
 * Responsável por carregar os dados dos animais.
 * Tenta a API REST primeiro; em caso de falha, usa o fallback local (animais.json).
 */

import { API_BASE } from './config.js';

const URL_FALLBACK = 'data/animais.json';

/**
 * Carrega a lista de animais.
 * 1. Tenta GET ${API_BASE}/api/animais
 * 2. Se falhar (network error ou resposta não-ok), usa data/animais.json como fallback.
 * 3. Se o fallback também falhar, lança o erro.
 *
 * Objetos retornados da API têm o campo "id" substituído pelo "slug"
 * para manter compatibilidade com render.js.
 *
 * @returns {Promise<Array>} Lista de animais
 */
export async function carregarAnimais() {
  try {
    const resposta = await fetch(`${API_BASE}/api/animais`);

    if (!resposta.ok) {
      throw new Error(`Resposta não-ok da API: ${resposta.status} ${resposta.statusText}`);
    }

    const animais = await resposta.json();

    return animais.map(animal => ({ ...animal, id: animal.slug }));
  } catch (erroApi) {
    console.warn('Aviso: API indisponível, usando fallback local.', erroApi);

    const respostaFallback = await fetch(URL_FALLBACK);

    if (!respostaFallback.ok) {
      throw new Error(`Fallback também falhou: HTTP ${respostaFallback.status}`);
    }

    return respostaFallback.json();
  }
}
