/**
 * config.js
 * URL base da API e helper de fetch autenticado.
 * Detecta automaticamente o ambiente pelo hostname.
 */

const isDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE = isDev
  ? 'http://localhost:5173'
  : 'https://projeto-pet-faculdade-production.up.railway.app';

/**
 * Wrapper de fetch que injeta o JWT automaticamente quando disponível.
 * Busca o token em localStorage primeiro (lembrar de mim), depois sessionStorage.
 *
 * @param {string} caminho  - ex.: '/api/animais'
 * @param {RequestInit} opcoes - opções padrão do fetch
 * @returns {Promise<Response>}
 */
export async function apiFetch(caminho, opcoes = {}) {
  const token = localStorage.getItem('paws-jwt') ?? sessionStorage.getItem('paws-jwt');

  const cabecalhos = { 'Content-Type': 'application/json', ...opcoes.headers };
  if (token) cabecalhos['Authorization'] = `Bearer ${token}`;

  return fetch(`${API_BASE}${caminho}`, { ...opcoes, headers: cabecalhos });
}
