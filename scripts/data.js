/**
 * data.js
 * Responsável por carregar a lista de animais a partir da API REST.
 *
 * Histórico: anteriormente havia um fallback para `data/animais.json` caso
 * a API estivesse offline. Foi removido após a validação da Etapa 16 — a
 * API em produção (Railway) está estável e o fallback estava mascarando
 * problemas reais de conectividade durante o desenvolvimento.
 */

import { API_BASE } from './config.js';

/**
 * Busca a lista de animais na API.
 *
 * Cada animal retornado pela API tem um campo `slug` (string única).
 * Para manter compatibilidade com o `render.js` (que espera `id`), o slug
 * é copiado para `id` no objeto retornado.
 *
 * @returns {Promise<Array>} Lista de animais
 * @throws {Error} Se a API não responder ou retornar status diferente de 2xx
 */
export async function carregarAnimais() {
  const resposta = await fetch(`${API_BASE}/api/animais`);

  if (!resposta.ok) {
    throw new Error(`API retornou ${resposta.status} ${resposta.statusText}`);
  }

  const animais = await resposta.json();

  return animais.map(animal => ({ ...animal, id: animal.slug }));
}
