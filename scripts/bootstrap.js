/**
 * bootstrap.js
 */

import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
import { mostrarToast } from './modal.js';
import { sessao, CHAVES } from './storage.js';
import { atualizarHeader } from './header.js';

export { mostrarToast };

// ============================================
// MENSAGEM-REDIRECT
// ============================================

export function salvarMensagemRedirect(texto, tipo = 'info') {
  sessao.salvar(CHAVES.MENSAGEM_REDIRECT, { texto, tipo });
}

function exibirMensagemRedirectPendente() {
  const mensagem = sessao.ler(CHAVES.MENSAGEM_REDIRECT);
  if (!mensagem?.texto) return;

  // Consome (lê + remove) atomicamente
  sessao.remover(CHAVES.MENSAGEM_REDIRECT);

  // Pequeno delay garante que #toast-container já foi parseado
  setTimeout(() => {
    mostrarToast(mensagem.texto, mensagem.tipo || 'info');
  }, 100);
}

// ============================================
// API PÚBLICA
// ============================================

export function inicializarBootstrap() {
  try { inicializarTema(); }
  catch (e) { console.error('[bootstrap] tema:', e); }

  try { inicializarBotaoVoltarTopo(); }
  catch (e) { console.error('[bootstrap] voltar-topo:', e); }

  try { atualizarHeader(); }
  catch (e) { console.error('[bootstrap] header:', e); }

  try { exibirMensagemRedirectPendente(); }
  catch (e) { console.error('[bootstrap] mensagem-redirect:', e); }
}
