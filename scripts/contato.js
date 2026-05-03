/**
 * contato.js
 * Controlador da página /contato.html
 */

import { inicializarBootstrap } from './bootstrap.js';
import { mostrarToast } from './modal.js';
import {
  validarFormulario,
  conectarValidacaoAoVivo,
  limparErros,
} from './validacao.js';

/**
 * Conecta o submit + validação do formulário de contato.
 */
function inicializarFormularioContato() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  // === Validação on-blur ===
  conectarValidacaoAoVivo(form);

  // === Submit ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { ok, primeiroInvalido } = validarFormulario(form, [
      'nome',
      'email',
      'telefone',
      'assunto',
      'mensagem',
      'consentimento',
    ]);

    if (!ok) {
      primeiroInvalido?.focus();
      mostrarToast('⚠️ Verifique os campos destacados.', 'erro');
      return;
    }

    const dados = Object.fromEntries(new FormData(form));

    // 🔒 Evidência LGPD
    dados.consentimentoTimestamp = new Date().toISOString();
    dados.consentimentoVersao = '1.0';

    console.log('[contato] Mensagem com evidência de consentimento:', dados);

    mostrarToast(
      `Obrigado, ${dados.nome.split(' ')[0]}! Sua mensagem foi enviada. 💛`,
      'sucesso'
    );

    form.reset();
    limparErros(form);
  });
}

function init() {
  inicializarBootstrap();
  inicializarFormularioContato();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
