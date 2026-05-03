/**
 * auth.js
 * Módulo central de autenticação (cadastro, login, logout, sessão).
 *
 * ⚠️ AVISO DIDÁTICO:
 * Este módulo armazena usuários no localStorage do navegador, com senha
 * hasheada (SHA-256). É adequado para fins de aprendizado/portfólio,
 * mas NÃO é seguro para produção real.
 *
 * Em produção, autenticação deve ser feita no backend, com:
 *  - HTTPS obrigatório
 *  - bcrypt/argon2 (e não SHA-256, que é rápido demais)
 *  - tokens JWT ou sessões server-side
 *  - rate limiting, 2FA, etc.
 *
 * USO:
 *   import { cadastrar, login, logout, obterUsuario, estaLogado } from './auth.js';
 *
 *   await cadastrar({ nome, email, senha, telefone });
 *   await login({ email, senha, lembrar });
 *   logout();
 *
 *   if (estaLogado()) {
 *     const usuario = obterUsuario();
 *   }
 */

import { storage, sessao, CHAVES } from './storage.js';

// ============================================
// CONSTANTES E TIPOS
// ============================================

/**
 * Estrutura de um usuário cadastrado:
 * @typedef {Object} Usuario
 * @property {string} nome
 * @property {string} email          - chave única (lowercase)
 * @property {string} senhaHash      - SHA-256 hex
 * @property {string} telefone
 * @property {string} dataCadastro   - ISO 8601
 */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;

// ============================================
// HELPERS PRIVADOS
// ============================================

/**
 * Gera hash SHA-256 de uma string usando a Web Crypto API (nativa).
 * Retorna hex (64 caracteres).
 */
async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Lê a lista de usuários cadastrados.
 * @returns {Usuario[]}
 */
function lerUsuarios() {
  return storage.ler(CHAVES.USUARIOS, []);
}

/**
 * Salva a lista de usuários.
 */
function salvarUsuarios(lista) {
  return storage.salvar(CHAVES.USUARIOS, lista);
}

/**
 * Normaliza email: trim + lowercase. Email é a chave única do sistema.
 */
function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// ============================================
// VALIDAÇÃO
// ============================================

/**
 * Valida os dados de cadastro. Lança Error com mensagem amigável se inválido.
 * @param {{nome:string, email:string, senha:string, telefone:string}} dados
 */
function validarDadosCadastro({ nome, email, senha, telefone }) {
  if (!nome || nome.trim().length < 2) {
    throw new Error('Informe um nome válido (mínimo 2 caracteres).');
  }
  if (!REGEX_EMAIL.test(String(email || '').trim())) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!senha || senha.length < SENHA_MIN) {
    throw new Error(`A senha deve ter no mínimo ${SENHA_MIN} caracteres.`);
  }
  if (!telefone || telefone.replace(/\D/g, '').length < 10) {
    throw new Error('Informe um telefone válido com DDD.');
  }
}

// ============================================
// API PÚBLICA — CADASTRO
// ============================================

/**
 * Cadastra um novo usuário.
 *
 * @param {{nome:string, email:string, senha:string, telefone:string}} dados
 * @returns {Promise<Usuario>} usuário criado (sem a senhaHash exposta no retorno)
 * @throws {Error} se dados inválidos ou email já cadastrado
 */
export async function cadastrar(dados) {
  validarDadosCadastro(dados);

  const email = normalizarEmail(dados.email);
  const usuarios = lerUsuarios();

  if (usuarios.some((u) => u.email === email)) {
    throw new Error('Este e-mail já está cadastrado. Faça login.');
  }

  /** @type {Usuario} */
  const novoUsuario = {
    nome: dados.nome.trim(),
    email,
    senhaHash: await gerarHash(dados.senha),
    telefone: dados.telefone.trim(),
    dataCadastro: new Date().toISOString(),
  };

  usuarios.push(novoUsuario);
  if (!salvarUsuarios(usuarios)) {
    throw new Error('Não foi possível salvar o cadastro. Verifique o armazenamento do navegador.');
  }

  // Retorna sem a senhaHash (não vaza dado sensível pra UI)
  const { senhaHash, ...publico } = novoUsuario;
  return publico;
}

// ============================================
// API PÚBLICA — LOGIN / LOGOUT
// ============================================

/**
 * Autentica um usuário pelo email + senha.
 *
 * @param {{email:string, senha:string, lembrar?:boolean}} credenciais
 *   - email:    e-mail do usuário (será normalizado)
 *   - senha:    senha em texto puro (será hasheada e comparada)
 *   - lembrar:  true = persiste em localStorage; false = só sessionStorage
 * @returns {Promise<Omit<Usuario,'senhaHash'>>} dados públicos do usuário
 * @throws {Error} se credenciais inválidas
 */
export async function login({ email, senha, lembrar = false } = {}) {
  const emailNorm = normalizarEmail(email);
  if (!emailNorm || !senha) {
    throw new Error('Informe e-mail e senha.');
  }

  const usuarios = lerUsuarios();
  const usuario = usuarios.find((u) => u.email === emailNorm);
  if (!usuario) {
    // Mensagem genérica de propósito (não revelar se email existe ou não)
    throw new Error('E-mail ou senha incorretos.');
  }

  const senhaHash = await gerarHash(senha);
  if (senhaHash !== usuario.senhaHash) {
    throw new Error('E-mail ou senha incorretos.');
  }

  // Salva a sessão no backend escolhido. Sempre LIMPA o outro pra não dar conflito.
  if (lembrar) {
    storage.salvar(CHAVES.SESSAO, { email: emailNorm });
    sessao.remover(CHAVES.SESSAO);
  } else {
    sessao.salvar(CHAVES.SESSAO, { email: emailNorm });
    storage.remover(CHAVES.SESSAO);
  }

  const { senhaHash: _omit, ...publico } = usuario;
  return publico;
}

/**
 * Encerra a sessão (limpa de ambos os storages, por garantia).
 */
export function logout() {
  storage.remover(CHAVES.SESSAO);
  sessao.remover(CHAVES.SESSAO);
}

// ============================================
// API PÚBLICA — CONSULTAS
// ============================================

/**
 * Lê a sessão ativa (de localStorage OU sessionStorage).
 * Prioriza localStorage (lembrar-de-mim) se ambos existirem.
 *
 * @returns {{email:string} | null}
 */
function obterSessao() {
  return storage.ler(CHAVES.SESSAO) || sessao.ler(CHAVES.SESSAO) || null;
}

/**
 * Verifica se há um usuário logado no momento.
 * @returns {boolean}
 */
export function estaLogado() {
  return obterSessao() !== null;
}

/**
 * Retorna os dados públicos do usuário logado, ou null.
 * @returns {Omit<Usuario,'senhaHash'> | null}
 */
export function obterUsuario() {
  const sessaoAtiva = obterSessao();
  if (!sessaoAtiva) return null;

  const usuarios = lerUsuarios();
  const usuario = usuarios.find((u) => u.email === sessaoAtiva.email);
  if (!usuario) {
    // Sessão órfã (usuário foi deletado mas a sessão sobrou). Limpa.
    logout();
    return null;
  }

  const { senhaHash, ...publico } = usuario;
  return publico;
}

/**
 * Atalho para o email do usuário logado.
 * Útil pra associar pedidos de adoção, etc.
 * @returns {string | null}
 */
export function obterEmailUsuario() {
  return obterSessao()?.email ?? null;
}
