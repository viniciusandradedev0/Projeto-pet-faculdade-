/**
 * tema.js
 * Gerencia o tema claro/escuro com persistência em localStorage.
 * O tema inicial já foi aplicado no <head> (anti-flash).
 */

const STORAGE_KEY = 'paws-tema';

/**
 * Retorna o tema atualmente aplicado no <html>.
 */
function obterTemaAtual() {
  return document.documentElement.getAttribute('data-tema') || 'light';
}

/**
 * Aplica um tema, persiste e atualiza ARIA.
 */
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
  localStorage.setItem(STORAGE_KEY, tema);

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
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      aplicarTema(e.matches ? 'dark' : 'light');
    }
  });
}
