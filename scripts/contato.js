/**
 * contato.js
 * Controlador da página /contato.html
 *
 * Responsabilidades:
 * - Inicializar componentes globais (tema + voltar-ao-topo)
 * - Validar e enviar formulário de contato (demo, sem backend)
 * - Registrar evidência de consentimento LGPD (timestamp + versão)
 *
 * Reusa módulos compartilhados:
 * - tema.js          → toggle dark/light
 * - voltar-topo.js   → botão flutuante com anel de progresso
 * - modal.js         → mostrarToast() pra feedback
 *
 * Padrão de validação espelha o do modal.js (consistência).
 */

import { inicializarTema } from './tema.js';
import { inicializarBotaoVoltarTopo } from './voltar-topo.js';
import { mostrarToast } from './modal.js';

// ============================================
// VALIDADORES (PT-BR)
// Mesmo padrão do modal.js — fácil de manter consistente
// ============================================

const validadores = {
  nome: (v) =>
    v.trim().length >= 3 || 'Informe seu nome completo (mínimo 3 letras).',
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Digite um e-mail válido.',
  assunto: (v) =>
    v.trim().length >= 3 || 'Informe o assunto da mensagem (mínimo 3 letras).',
  mensagem: (v) =>
    v.trim().length >= 10 || 'Sua mensagem precisa ter ao menos 10 caracteres.',
  consentimento: (_, campo) =>
    campo.checked ||
    'Você precisa concordar com a Política de Privacidade para continuar.',
};

/**
 * Valida um único campo, atualizando ARIA e a mensagem de erro visível.
 */
function validarCampo(form, campo) {
  const validador = validadores[campo.name];
  if (!validador) return true;

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
 * Conecta o submit + validação do formulário de contato.
 */
function inicializarFormularioContato() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  // === Validação on-blur (ou on-change pra checkbox) ===
  form.querySelectorAll('input, textarea').forEach((campo) => {
    const evento = campo.type === 'checkbox' ? 'change' : 'blur';
    campo.addEventListener(evento, () => validarCampo(form, campo));
  });

  // === Submit ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const camposObrigatorios = ['nome', 'email', 'assunto', 'mensagem', 'consentimento'];
    let tudoOk = true;
    let primeiroInvalido = null;

    camposObrigatorios.forEach((nome) => {
      const campo = form.elements[nome];
      if (!campo) return;
      if (!validarCampo(form, campo)) {
        tudoOk = false;
        if (!primeiroInvalido) primeiroInvalido = campo;
      }
    });

    if (!tudoOk) {
      primeiroInvalido?.focus();
      mostrarToast('⚠️ Verifique os campos destacados.', 'erro');
      return;
    }

    // Captura dados (em produção: enviaria pra um endpoint)
    const dados = Object.fromEntries(new FormData(form));

    // 🔒 Evidência LGPD (mesmo padrão do modal.js)
    dados.consentimentoTimestamp = new Date().toISOString();
    dados.consentimentoVersao = '1.0';

    console.log('[contato] Mensagem com evidência de consentimento:', dados);

    mostrarToast(
      `Obrigado, ${dados.nome.split(' ')[0]}! Sua mensagem foi enviada. 💛`,
      'sucesso'
    );

    form.reset();
    // Limpa erros visuais que possam ter ficado de submits anteriores
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) =>
      el.removeAttribute('aria-invalid')
    );
    form.querySelectorAll('.campo__erro').forEach((el) => (el.textContent = ''));
  });
}

/**
 * Bootstrap da página Contato.
 */
function init() {
  inicializarTema();
  inicializarBotaoVoltarTopo();
  inicializarFormularioContato();
}

// === Bootstrap idempotente ===
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
