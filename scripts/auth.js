/**
 * auth.js
 * Módulo central de autenticação (cadastro, login, logout, sessão).
 *
 * AVISO DIDÁTICO:
 * Este módulo autentica via API REST (backend ASP.NET), usando JWT.
 * O token é armazenado no localStorage (lembrar=true) ou sessionStorage
 * (lembrar=false). Em produção real, prefira cookies HttpOnly para evitar
 * ataques XSS. Esta abordagem é adequada para fins de aprendizado/portfólio.
 *
 * USO:
 *   import { cadastrar, login, logout, obterUsuario, estaLogado } from './auth.js';
 *
 *   await cadastrar({ nome, email, senha, telefone });
 *   await login({ email, senha, lembrar });
 *   logout();
 *
 *   if (estaLogado()) {
 *     const usuario = obterUsuario(); // { id, nome, email }
 *   }
 */

import { CHAVES } from './storage.js';
import { API_BASE } from './config.js';

// ============================================
// HELPERS PRIVADOS
// ============================================

/**
 * Decodifica o payload de um JWT (sem verificar assinatura — apenas leitura client-side).
 * @param {string} token
 * @returns {object | null}
 */
function decodificarJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/**
 * Obtém o token JWT de localStorage (lembrar=true) ou sessionStorage (lembrar=false).
 * Prioriza localStorage se ambos existirem.
 * @returns {string | null}
 */
function obterToken() {
  return localStorage.getItem(CHAVES.JWT) ?? sessionStorage.getItem(CHAVES.JWT);
}

// ============================================
// API PÚBLICA — CADASTRO
// ============================================

/**
 * Cadastra um novo usuário via POST /api/auth/cadastro.
 * Em caso de sucesso, salva o JWT retornado como sessão temporária (sessionStorage).
 *
 * @param {{nome:string, email:string, senha:string, telefone:string}} dados
 * @returns {Promise<{token:string, nome:string, email:string}>}
 * @throws {Error} se o backend rejeitar (ex.: 409 = email duplicado)
 */
export async function cadastrar(dados) {
  const res = await fetch(`${API_BASE}/api/auth/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      telefone: dados.telefone,
    }),
  });

  if (!res.ok) {
    let mensagem = 'Não foi possível concluir o cadastro.';
    try {
      const corpo = await res.json();
      if (corpo?.message) mensagem = corpo.message;
      else if (corpo?.title) mensagem = corpo.title;
      else if (typeof corpo === 'string') mensagem = corpo;
    } catch {
      /* sem body JSON — mantém mensagem padrão */
    }
    throw new Error(mensagem);
  }

  const corpo = await res.json();
  const { token } = corpo;

  // Cadastro novo: salva como sessão temporária (sem "lembrar de mim")
  sessionStorage.setItem(CHAVES.JWT, token);
  localStorage.removeItem(CHAVES.JWT);

  return corpo;
}

// ============================================
// API PÚBLICA — LOGIN / LOGOUT
// ============================================

/**
 * Autentica via POST /api/auth/login.
 * Se lembrar=true, persiste o JWT no localStorage (sobrevive a fechar o navegador).
 * Se lembrar=false, salva apenas no sessionStorage (some ao fechar a aba).
 *
 * @param {{email:string, senha:string, lembrar?:boolean}} credenciais
 * @returns {Promise<{token:string, nome:string, email:string}>}
 * @throws {Error} se credenciais inválidas ou erro de rede
 */
export async function login({ email, senha, lembrar = false } = {}) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const corpo = await res.json();
  const { token } = corpo;

  if (lembrar) {
    localStorage.setItem(CHAVES.JWT, token);
    sessionStorage.removeItem(CHAVES.JWT);
  } else {
    sessionStorage.setItem(CHAVES.JWT, token);
    localStorage.removeItem(CHAVES.JWT);
  }

  return corpo;
}

/**
 * Encerra a sessão removendo o JWT de ambos os storages.
 */
export function logout() {
  localStorage.removeItem(CHAVES.JWT);
  sessionStorage.removeItem(CHAVES.JWT);
}

// ============================================
// API PÚBLICA — CONSULTAS
// ============================================

/**
 * Verifica se há um usuário logado com token ainda válido (não expirado).
 * @returns {boolean}
 */
export function estaLogado() {
  const token = obterToken();
  if (!token) return false;

  const payload = decodificarJwt(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 > Date.now();
}

/**
 * Retorna os dados públicos do usuário logado, decodificados do JWT.
 * Se o token estiver expirado, chama logout() e retorna null.
 *
 * @returns {{id:number|string, nome:string, email:string} | null}
 */
export function obterUsuario() {
  const token = obterToken();
  if (!token) return null;

  const payload = decodificarJwt(token);
  if (!payload) return null;

  if (!payload.exp || payload.exp * 1000 <= Date.now()) {
    logout();
    return null;
  }

  return {
    id: payload.nameid,
    nome: payload.unique_name,
    email: payload.email,
  };
}

/**
 * Atalho para o email do usuário logado.
 * Útil para associar pedidos de adoção, etc.
 * @returns {string | null}
 */
export function obterEmailUsuario() {
  return obterUsuario()?.email ?? null;
}
