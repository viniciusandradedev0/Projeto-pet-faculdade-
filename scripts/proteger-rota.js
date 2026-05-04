/**
 * proteger-rota.js
 * Módulo de proteção de rotas client-side.
 *
 * Uso típico (no topo do controller da página protegida):
 *
 *   import { protegerRota } from './proteger-rota.js';
 *   const usuario = protegerRota();
 *   if (!usuario) return; // página será redirecionada — pare aqui
 *   // ... resto do código usa `usuario` à vontade
 *
 * ⚠️ AVISO: proteção client-side é apenas UX. Em produção,
 * a verdadeira proteção precisa estar no backend (tokens, sessões,
 * middleware de autorização). Este módulo é didático.
 */

import { obterUsuario, estaLogado } from './auth.js';
import { sessao, CHAVES } from './storage.js';
import { salvarMensagemRedirect } from './bootstrap.js';

// ============================================
// API PÚBLICA
// ============================================

/**
 * Protege a rota atual exigindo usuário autenticado.
 *
 * @param {Object}  [opcoes]
 * @param {string}  [opcoes.redirectTo='login.html']  - pra onde mandar se não logado
 * @param {string}  [opcoes.mensagem]                 - toast a exibir após redirect
 * @param {'sucesso'|'erro'|'info'} [opcoes.tipoToast='info'] - tipo do toast
 * @param {boolean} [opcoes.lembrarOrigem=true]       - salva URL atual pra voltar pós-login
 *
 * @returns {Object|null} usuário logado, ou null se redirecionou
 */
export function protegerRota(opcoes = {}) {
  const {
    redirectTo = 'login.html',
    mensagem = 'Você precisa estar logado para acessar esta página.',
    tipoToast = 'info',
    lembrarOrigem = true,
  } = opcoes;

  const usuario = obterUsuario();

  // ✅ Logado → libera passagem
  if (usuario) return usuario;

  // ❌ Não logado → prepara redirect

  // 1. Salva mensagem-redirect (mesmo sistema do bootstrap.js)
  salvarMensagemRedirect(mensagem, tipoToast);

  // 2. Salva URL atual pra voltar depois do login (se solicitado)
  if (lembrarOrigem) {
    const urlAtual = window.location.pathname + window.location.search;
    sessao.salvar(CHAVES.REDIRECT_POS_LOGIN, urlAtual);
  }

  // 3. Redireciona
  window.location.replace(redirectTo);
  return null;
}

/**
 * Recupera (e limpa) a URL salva antes do login.
 * Use em login.js após autenticar com sucesso.
 *
 * @param {string} [fallback='index.html'] - destino se não houver origem salva
 * @returns {string} URL pra onde redirecionar
 */
export function obterRedirectPosLogin(fallback = 'index.html') {
  const urlSalva = sessao.ler(CHAVES.REDIRECT_POS_LOGIN);
  sessao.remover(CHAVES.REDIRECT_POS_LOGIN);

  // Sanity check: só aceita rotas internas (evita open-redirect)
  if (typeof urlSalva === 'string' && urlSalva.startsWith('/')) {
    return urlSalva;
  }
  return fallback;
}

/**
 * Inverso: protege rotas que NÃO devem ser acessadas se logado
 * (ex.: login.html, cadastro.html). Substitui a duplicação que
 * existe hoje em login.js e cadastro.js.
 *
 * @param {Object} [opcoes]
 * @param {string} [opcoes.redirectTo='index.html']
 * @param {string} [opcoes.mensagem='Você já está logado! 🐾']
 * @param {'sucesso'|'erro'|'info'} [opcoes.tipoToast='info']
 *
 * @returns {boolean} true se pode permanecer, false se redirecionou
 */
export function bloquearSeLogado(opcoes = {}) {
  const {
    redirectTo = 'index.html',
    mensagem = 'Você já está logado! 🐾',
    tipoToast = 'info',
  } = opcoes;

  if (!estaLogado()) return true; // não logado → pode ficar

  salvarMensagemRedirect(mensagem, tipoToast);
  window.location.replace(redirectTo);
  return false;
}
