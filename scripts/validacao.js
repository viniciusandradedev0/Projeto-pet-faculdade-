/**
 * validacao.js
 * Módulo central de validação de formulários.
 *
 * Exporta:
 * - validadores: objeto com regras reutilizáveis (PT-BR)
 * - validarCampo(form, campo): valida 1 campo, atualiza ARIA + erro visível
 * - validarFormulario(form, nomesCampos): valida múltiplos, retorna { ok, primeiroInvalido }
 *
 * Cada validador é uma função (valor, campo) => true | string-de-erro
 * Retorna `true` se válido, ou a mensagem de erro se inválido.
 */

// ============================================
// VALIDADORES (PT-BR)
// ============================================

export const validadores = {
  // === Identidade ===
  nome: (v) =>
    v.trim().length >= 3 || 'Informe seu nome completo (mínimo 3 letras).',

  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Digite um e-mail válido.',

  telefone: (v) =>
    v.replace(/\D/g, '').length >= 10 ||
    'Telefone deve ter DDD + número (mín. 10 dígitos).',

  // === Mensagens ===
  assunto: (v) =>
    v.trim().length >= 3 || 'Informe o assunto da mensagem (mínimo 3 letras).',

  mensagem: (v) =>
    v.trim().length >= 10 || 'Sua mensagem precisa ter ao menos 10 caracteres.',

  // === Senhas (preparação para Fase 2) ===
  senha: (v) => {
    if (v.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (!/[A-Za-z]/.test(v)) return 'A senha deve conter ao menos 1 letra.';
    if (!/[0-9]/.test(v)) return 'A senha deve conter ao menos 1 número.';
    return true;
  },

  // === Aceites ===
  consentimento: (_, campo) =>
    campo.checked ||
    'Você precisa concordar com a Política de Privacidade para continuar.',

  termos: (_, campo) =>
    campo.checked ||
    'Você precisa aceitar os termos de responsabilidade para continuar.',
};

// ============================================
// API PÚBLICA
// ============================================

/**
 * Valida um único campo, atualizando ARIA e a mensagem de erro visível.
 * Procura o elemento de erro via [data-erro="<name>"] dentro do form.
 *
 * @param {HTMLFormElement} form  - formulário pai
 * @param {HTMLElement}     campo - input/textarea/checkbox a validar
 * @returns {boolean} true se válido
 */
export function validarCampo(form, campo) {
  const validador = validadores[campo.name];
  if (!validador) return true; // sem regra = passa

  const valor = campo.type === 'checkbox' ? campo.checked : campo.value;
  const resultado = validador(valor, campo);
  const erroEl = form.querySelector(`[data-erro="${campo.name}"]`);

  if (resultado === true) {
    campo.removeAttribute('aria-invalid');
    if (erroEl) erroEl.textContent = '';
    return true;
  }

  campo.setAttribute('aria-invalid', 'true');
  if (erroEl) erroEl.textContent = resultado;
  return false;
}

/**
 * Valida vários campos de um formulário.
 *
 * @param {HTMLFormElement} form         - formulário
 * @param {string[]}        nomesCampos  - nomes dos campos (atributo `name`)
 * @returns {{ ok: boolean, primeiroInvalido: HTMLElement | null }}
 */
export function validarFormulario(form, nomesCampos) {
  let ok = true;
  let primeiroInvalido = null;

  nomesCampos.forEach((nome) => {
    const campo = form.elements[nome];
    if (!campo) return;
    if (!validarCampo(form, campo)) {
      ok = false;
      if (!primeiroInvalido) primeiroInvalido = campo;
    }
  });

  return { ok, primeiroInvalido };
}

/**
 * Atalho: conecta validação on-blur (e on-change pra checkbox)
 * em todos os inputs/textarea de um formulário.
 *
 * @param {HTMLFormElement} form
 */
export function conectarValidacaoAoVivo(form) {
  form.querySelectorAll('input, textarea').forEach((campo) => {
    const evento = campo.type === 'checkbox' ? 'change' : 'blur';
    campo.addEventListener(evento, () => validarCampo(form, campo));
  });
}

/**
 * Atalho: limpa todos os estados de erro de um formulário.
 * Útil após reset() ou submit bem-sucedido.
 *
 * @param {HTMLFormElement} form
 */
export function limparErros(form) {
  form.querySelectorAll('[aria-invalid="true"]').forEach((el) =>
    el.removeAttribute('aria-invalid')
  );
  form.querySelectorAll('.campo__erro').forEach((el) => (el.textContent = ''));
}
