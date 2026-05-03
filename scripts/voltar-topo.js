/**
 * ============================================
 * MÓDULO: Botão "Voltar ao Topo"
 * ============================================
 * Responsabilidades:
 * - Mostrar/ocultar o botão conforme o scroll
 * - Atualizar o anel de progresso de leitura
 * - Rolar suavemente ao topo ao clicar
 * - Respeitar prefers-reduced-motion
 *
 * Uso:
 *   import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
 *   inicializarBotaoVoltarTopo();
 * ============================================
 */

// === CONSTANTES ===

/** Distância (em px) que o usuário precisa rolar pra o botão aparecer */
const SCROLL_MINIMO_PARA_EXIBIR = 300;

/** Circunferência do círculo SVG (2 × π × raio, com r=20) */
const CIRCUNFERENCIA_ANEL = 2 * Math.PI * 20; // ≈ 125.66

/**
 * Inicializa o botão "voltar ao topo".
 * Deve ser chamado uma única vez, após o DOM estar pronto.
 */
export function inicializarBotaoVoltarTopo() {
  const botao = document.getElementById('btn-voltar-topo');

  // Guarda de segurança: se a página não tem o botão, sai silenciosamente
  if (!botao) return;

  const anelProgresso = botao.querySelector('.btn-voltar-topo__progresso-fill');

  // Remove o atributo 'hidden' agora que o JS está controlando o botão
  botao.removeAttribute('hidden');

  // Detecta preferência por menos animação (acessibilidade)
  const prefereMenosMovimento = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // === FLAG DE THROTTLING ===
  // Evita executar o cálculo a cada pixel de scroll (performance)
  let aguardandoFrame = false;

  /**
   * Atualiza o estado visual do botão conforme o scroll.
   * - Mostra/esconde via classe 'is-visivel'
   * - Atualiza o anel de progresso
   */
  function atualizarBotao() {
    const scrollAtual = window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;

    // Calcula o percentual rolado (0 a 1)
    // Math.max evita divisão por zero em páginas curtas
    const percentualRolado = alturaTotal > 0
      ? Math.min(scrollAtual / alturaTotal, 1)
      : 0;

    // === CONTROLE DE VISIBILIDADE ===
    if (scrollAtual > SCROLL_MINIMO_PARA_EXIBIR) {
      botao.classList.add('is-visivel');
    } else {
      botao.classList.remove('is-visivel');
    }

    // === ATUALIZAÇÃO DO ANEL DE PROGRESSO ===
    // O 'dashoffset' começa em CIRCUNFERENCIA (anel vazio)
    // e diminui até 0 (anel completo)
    const offset = CIRCUNFERENCIA_ANEL * (1 - percentualRolado);
    anelProgresso.style.strokeDashoffset = offset.toFixed(2);

    aguardandoFrame = false;
  }

  /**
   * Handler do evento de scroll com throttling via requestAnimationFrame.
   * Garante que atualizamos o botão no máximo uma vez por frame (~60fps),
   * sem travar a thread principal.
   */
  function aoRolar() {
    if (!aguardandoFrame) {
      window.requestAnimationFrame(atualizarBotao);
      aguardandoFrame = true;
    }
  }

  /**
   * Handler do clique: rola suavemente ao topo.
   * Se o usuário preferir menos movimento, faz scroll instantâneo.
   */
  function aoClicar() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefereMenosMovimento ? 'auto' : 'smooth',
    });

    // Devolve o foco para o início da página (boa prática a11y)
    // Pequeno delay pra esperar o scroll terminar
    setTimeout(() => {
      const primeiroFocavel = document.querySelector('header a, header button, main');
      if (primeiroFocavel) {
        primeiroFocavel.focus({ preventScroll: true });
      }
    }, 600);
  }

  // === REGISTRO DOS EVENTOS ===

  // 'passive: true' = informa ao navegador que NÃO vamos chamar preventDefault,
  // permitindo otimizações de scroll (ganho real de performance em mobile)
  window.addEventListener('scroll', aoRolar, { passive: true });

  // Atualiza ao redimensionar (altura da página pode mudar)
  window.addEventListener('resize', aoRolar, { passive: true });

  // Clique do botão
  botao.addEventListener('click', aoClicar);

  // === EXECUÇÃO INICIAL ===
  // Garante o estado correto se a página já carregar com scroll
  // (ex.: usuário deu refresh no meio da página)
  atualizarBotao();
}
