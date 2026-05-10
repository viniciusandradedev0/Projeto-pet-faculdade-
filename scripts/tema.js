/**
 * tema.js
 * Gerencia o tema claro/escuro com persistência via storage.js.
 * O tema inicial já foi aplicado no <head> (anti-flash).
 */

import { storage, CHAVES } from './storage.js';

/**
 * Retorna o tema atualmente aplicado.
 * Prefere o valor do storage (já parseado) para evitar dupla serialização
 * entre o anti-flash (lê raw) e o storage.salvar (faz JSON.stringify).
 */
function obterTemaAtual() {
  const doStorage = storage.ler(CHAVES.TEMA);
  if (doStorage === 'dark' || doStorage === 'light') return doStorage;
  const doAtributo = document.documentElement.getAttribute('data-tema') || 'light';
  return doAtributo.replace(/"/g, '').trim() || 'light';
}

/**
 * Aplica um tema, persiste e atualiza ARIA.
 */
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
  storage.salvar(CHAVES.TEMA, tema);

  const botao = document.getElementById('toggle-tema');
  if (botao) {
    const ehDark = tema === 'dark';
    botao.setAttribute('aria-pressed', String(ehDark));
    botao.setAttribute(
      'aria-label',
      ehDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'
    );
  }
}

/**
 * Inicializa o sistema de tema.
 */
export function inicializarTema() {
  const botao = document.getElementById('toggle-tema');
  if (!botao) return;

  // Sincroniza ARIA com o tema já aplicado pelo script anti-flash
  aplicarTema(obterTemaAtual());

  botao.addEventListener('click', () => {
    const novoTema = obterTemaAtual() === 'dark' ? 'light' : 'dark';
    aplicarTema(novoTema);
  });

  // Acompanha mudanças do SO (apenas se usuário NUNCA escolheu manualmente)
  const preferenciaCor = window.matchMedia('(prefers-color-scheme: dark)');
  const atualizarTemaDoSO = (e) => {
    // Se ainda não há preferência salva, segue o SO
    if (storage.ler(CHAVES.TEMA) === null) {
      aplicarTema(e.matches ? 'dark' : 'light');
    }
  };

  if (typeof preferenciaCor.addEventListener === 'function') {
    preferenciaCor.addEventListener('change', atualizarTemaDoSO);
  } else if (typeof preferenciaCor.addListener === 'function') {
    preferenciaCor.addListener(atualizarTemaDoSO);
  }
}
