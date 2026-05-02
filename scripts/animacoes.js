/**
 * animacoes.js
 * Aplica fade-in progressivo nos cards quando entram na viewport.
 * Usa IntersectionObserver (performático, não escuta scroll).
 */

/**
 * Detecta se o usuário prefere menos animação.
 */
function prefereMenosAnimacao() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let observer = null;

/**
 * Cria (ou retorna) o observer singleton.
 */
function obterObserver() {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visivel');
          observer.unobserve(entry.target); // anima 1x só
        }
      });
    },
    {
      threshold: 0.01,                    // dispara assim que 1% aparece
      rootMargin: '300px 0px 300px 0px',  // pré-carrega 300px antes (topo e base)
    }
  );

  return observer;
}

/**
 * Observa todos os cards atualmente no DOM.
 * Chame esta função SEMPRE após renderizar (filtros, busca etc.).
 */
export function observarCards() {
  // Se o usuário pediu menos animação, mostra tudo direto
  if (prefereMenosAnimacao()) {
    document.querySelectorAll('.card').forEach((card) => {
      card.classList.add('is-visivel');
    });
    return;
  }

  const obs = obterObserver();
  document.querySelectorAll('.card:not(.is-visivel)').forEach((card, index) => {
    // Delay escalonado para efeito cascata (max 6 cards = 300ms)
    card.style.setProperty('--delay-fade', `${Math.min(index, 6) * 50}ms`);
    obs.observe(card);
  });
}
