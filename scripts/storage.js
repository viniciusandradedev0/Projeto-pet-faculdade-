/**
 * storage.js
 * Módulo central de persistência (localStorage + sessionStorage).
 *
 * Por que existe?
 * - Centraliza todas as chaves de armazenamento (sem strings mágicas espalhadas)
 * - Trata erros uma vez só (modo anônimo, cookies bloqueados, quota cheia)
 * - Faz JSON.stringify/parse automaticamente
 * - Facilita migração futura (cookies, IndexedDB, backend, etc.)
 *
 * USO:
 *   import { storage, sessao, CHAVES } from './storage.js';
 *
 *   storage.salvar(CHAVES.TEMA, 'dark');
 *   const tema = storage.ler(CHAVES.TEMA, 'light'); // 'light' = fallback
 *   storage.remover(CHAVES.TEMA);
 *
 *   sessao.salvar(CHAVES.MENSAGEM_REDIRECT, { texto: 'Olá', tipo: 'info' });
 *   const msg = sessao.ler(CHAVES.MENSAGEM_REDIRECT);
 *   sessao.remover(CHAVES.MENSAGEM_REDIRECT);
 */

// ============================================
// CHAVES (todas em um lugar só)
// ============================================

/**
 * Prefixo único do projeto. Evita colisão com outros sites/projetos
 * que possam estar no mesmo domínio (ex.: localhost durante dev).
 */
const PREFIXO = 'paws-';

/**
 * Todas as chaves de storage do projeto.
 * Use SEMPRE essas constantes — nunca strings literais.
 *
 * Etapa 14: USUARIOS, SESSAO e PEDIDOS removidos (migrados para o backend).
 * JWT substitui SESSAO — salvo em localStorage (lembrar=true) ou sessionStorage.
 */
export const CHAVES = Object.freeze({
  // === Preferências locais (permanecem client-side) ===
  TEMA: `${PREFIXO}tema`,

  // === Autenticação via JWT (Etapa 14) ===
  JWT: `${PREFIXO}jwt`,

  // === Fluxo de navegação ===
  MENSAGEM_REDIRECT:  `${PREFIXO}mensagem-redirect`,
  REDIRECT_POS_LOGIN: `${PREFIXO}redirect-pos-login`,
});


// ============================================
// FACTORY: cria uma API uniforme para qualquer Storage
// ============================================

/**
 * Cria um wrapper seguro em volta de localStorage ou sessionStorage.
 *
 * @param {Storage} backend - localStorage ou sessionStorage
 * @param {string}  rotulo  - apenas para logs ('local' | 'session')
 * @returns {{
 *   salvar: (chave: string, valor: any) => boolean,
 *   ler:    (chave: string, padrao?: any) => any,
 *   remover:(chave: string) => boolean,
 *   limpar: () => boolean,
 *   disponivel: () => boolean
 * }}
 */
function criarStorage(backend, rotulo) {
  /**
   * Verifica se o backend está realmente disponível.
   * Em modo anônimo do Safari, por exemplo, localStorage existe
   * mas LANÇA erro ao tentar escrever. Por isso testamos com escrita real.
   */
  function disponivel() {
    try {
      const teste = '__paws_teste__';
      backend.setItem(teste, '1');
      backend.removeItem(teste);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Salva qualquer valor serializável (objeto, array, string, number, bool).
   * @returns {boolean} true se conseguiu salvar
   */
  function salvar(chave, valor) {
    try {
      backend.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (err) {
      console.warn(`[storage:${rotulo}] Falha ao salvar "${chave}":`, err);
      return false;
    }
  }

  /**
   * Lê e desserializa um valor.
   * Se a chave não existir OU o JSON estiver corrompido, retorna `padrao`.
   *
   * @param {string} chave
   * @param {*}      padrao - valor de fallback (default: null)
   */
  function ler(chave, padrao = null) {
    try {
      const raw = backend.getItem(chave);
      if (raw === null) return padrao;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[storage:${rotulo}] Valor corrompido em "${chave}", usando padrão:`, err);
      // Auto-limpeza: se o JSON está quebrado, remove pra não dar erro de novo
      try { backend.removeItem(chave); } catch { /* noop */ }
      return padrao;
    }
  }

  /**
   * Remove uma chave específica.
   * @returns {boolean} true se conseguiu remover
   */
  function remover(chave) {
    try {
      backend.removeItem(chave);
      return true;
    } catch (err) {
      console.warn(`[storage:${rotulo}] Falha ao remover "${chave}":`, err);
      return false;
    }
  }

  /**
   * Remove TODAS as chaves do projeto (apenas as com prefixo PAWS).
   * Não toca em chaves de outros sistemas no mesmo domínio.
   *
   * Útil em: logout completo, "esquecer de mim", debug.
   */
  function limpar() {
    try {
      // Coleta antes de remover (evita mexer no índice durante iteração)
      const chavesParaRemover = [];
      for (let i = 0; i < backend.length; i++) {
        const chave = backend.key(i);
        if (chave?.startsWith(PREFIXO)) {
          chavesParaRemover.push(chave);
        }
      }
      chavesParaRemover.forEach((c) => backend.removeItem(c));
      return true;
    } catch (err) {
      console.warn(`[storage:${rotulo}] Falha ao limpar:`, err);
      return false;
    }
  }

  return { salvar, ler, remover, limpar, disponivel };
}

// ============================================
// API PÚBLICA — duas instâncias prontas
// ============================================

/**
 * Persistência de longo prazo (sobrevive a fechar o navegador).
 * Use para: tema, preferências, dados do usuário logado.
 */
export const storage = criarStorage(window.localStorage, 'local');

/**
 * Persistência de sessão (some ao fechar a aba).
 * Use para: mensagens-redirect, dados temporários de fluxo.
 */
export const sessao = criarStorage(window.sessionStorage, 'session');
