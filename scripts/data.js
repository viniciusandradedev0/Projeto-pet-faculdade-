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
 * Busca a lista de animais na API com suporte a paginação server-side.
 *
 * Cada animal retornado pela API tem um campo `slug` (string única).
 * Para manter compatibilidade com o `render.js` (que espera `id`), o slug
 * é copiado para `id` em cada objeto do array `itens`.
 *
 * @param {Object} [opcoes]
 * @param {number} [opcoes.pagina=1]        - Número da página solicitada
 * @param {number} [opcoes.tamanhoPagina=12] - Quantidade de itens por página
 * @returns {Promise<{
 *   itens: Array,
 *   pagina: number,
 *   tamanhoPagina: number,
 *   totalItens: number,
 *   totalPaginas: number,
 *   temProxima: boolean,
 *   temAnterior: boolean
 * }>} Envelope de paginação com os itens já com `id` mapeado
 * @throws {Error} Se a API não responder ou retornar status diferente de 2xx
 */
export async function carregarAnimais({ pagina = 1, tamanhoPagina = 12 } = {}) {
  const url = `${API_BASE}/api/animais?pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`;
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`API retornou ${resposta.status} ${resposta.statusText}`);
  }

  const envelope = await resposta.json();

  return {
    itens: envelope.itens.map(animal => ({ ...animal, id: animal.slug })),
    pagina: envelope.pagina,
    tamanhoPagina: envelope.tamanhoPagina,
    totalItens: envelope.totalItens,
    totalPaginas: envelope.totalPaginas,
    temProxima: envelope.temProxima,
    temAnterior: envelope.temAnterior,
  };
}
