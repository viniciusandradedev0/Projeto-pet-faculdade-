/**
 * perfil.js
 * Controller da página de perfil do usuário logado.
 *
 * Responsabilidades:
 *  - Protege a rota (redireciona se não logado)
 *  - Busca os dados do usuário via GET /api/usuarios/me
 *  - Exibe os dados na tela
 *  - Permite excluir a conta com confirmação via <dialog> nativo
 */

import { inicializarBootstrap, salvarMensagemRedirect, mostrarToast } from './bootstrap.js';
import { protegerRota } from './proteger-rota.js';
import { apiFetch } from './config.js';
import { validarFormulario, conectarValidacaoAoVivo, limparErros } from './validacao.js';

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  inicializarBootstrap();

  const usuario = protegerRota({ mensagem: 'Faça login para acessar seu perfil. 🐾' });
  if (!usuario) {
    // Rota protegida — o redirect já foi disparado, interrompe execução
    return;
  }

  let usuarioAtual = null;

  try {
    usuarioAtual = await preencherPagina();
  } catch (erro) {
    console.error('[perfil] Erro ao carregar dados:', erro);
    mostrarToast('Não foi possível carregar seu perfil. Tente novamente.', 'erro');
  }

  if (usuarioAtual) configurarFormEdicao(usuarioAtual);
  configurarDialogExclusao();
}

// ============================================
// PREENCHE DADOS NA TELA
// ============================================

/**
 * Formata uma data ISO 8601 para o formato legível em pt-BR.
 * Ex.: "2024-03-15T10:00:00.000Z" → "15 de março de 2024"
 *
 * @param {string} iso
 * @returns {string}
 */
function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Busca os dados do usuário na API e preenche os elementos de exibição.
 */
async function preencherPagina() {
  const res = await apiFetch('/api/usuarios/me');
  if (!res.ok) throw new Error('Sessão inválida.');
  const usuario = await res.json(); // { id, nome, email, telefone, dataCadastro }

  const nomeEl = document.getElementById('perfil-nome-titulo');
  if (nomeEl) nomeEl.textContent = usuario.nome;

  const campos = {
    'perfil-nome':     usuario.nome,
    'perfil-email':    usuario.email,
    'perfil-telefone': usuario.telefone || '—',
    'perfil-data':     formatarData(usuario.dataCadastro),
  };
  Object.entries(campos).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  return usuario;
}

// ============================================
// EDIÇÃO DE PERFIL
// ============================================

/**
 * Configura o formulário de edição de nome e telefone.
 * Preenche os campos com os valores atuais, conecta validação ao vivo,
 * trata cancelamento e submissão via PUT /api/usuarios/me.
 *
 * @param {{ nome: string, telefone: string }} usuarioAtual - dados vindos da API
 */
function configurarFormEdicao(usuarioAtual) {
  const form        = document.getElementById('form-editar-perfil');
  const inputNome   = document.getElementById('edit-nome');
  const inputTelefone = document.getElementById('edit-telefone');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');

  if (!form || !inputNome || !inputTelefone) return;

  // Preenche os campos com os valores atuais do usuário
  inputNome.value     = usuarioAtual.nome     || '';
  inputTelefone.value = usuarioAtual.telefone || '';

  // Conecta validação ao vivo (blur)
  conectarValidacaoAoVivo(form);

  // Botão cancelar: restaura valores originais e limpa erros
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      inputNome.value     = usuarioAtual.nome     || '';
      inputTelefone.value = usuarioAtual.telefone || '';
      limparErros(form);
    });
  }

  // Submissão do formulário
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // 1. Valida os campos
    const { ok, primeiroInvalido } = validarFormulario(form, ['nome', 'telefone']);
    if (!ok) {
      if (primeiroInvalido) primeiroInvalido.focus();
      return;
    }

    const btnSalvar = form.querySelector('[type="submit"]');
    const textoOriginal = btnSalvar ? btnSalvar.textContent : '';
    if (btnSalvar) {
      btnSalvar.disabled = true;
      btnSalvar.textContent = 'Salvando…';
    }

    try {
      // 2. Envia a requisição para a API
      const res = await apiFetch('/api/usuarios/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:     inputNome.value.trim(),
          telefone: inputTelefone.value.trim(),
        }),
      });

      if (res.ok) {
        // 3. Atualiza os dados exibidos no <dl> e o estado interno do form
        const usuarioAtualizado = await res.json();

        const nomeEl = document.getElementById('perfil-nome-titulo');
        if (nomeEl) nomeEl.textContent = usuarioAtualizado.nome;

        const exibidos = {
          'perfil-nome':     usuarioAtualizado.nome,
          'perfil-telefone': usuarioAtualizado.telefone || '—',
        };
        Object.entries(exibidos).forEach(([id, val]) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        });

        // Sincroniza os campos do form com os novos valores
        inputNome.value     = usuarioAtualizado.nome     || '';
        inputTelefone.value = usuarioAtualizado.telefone || '';

        // Atualiza o objeto de referência para o cancelar funcionar corretamente
        usuarioAtual.nome     = usuarioAtualizado.nome;
        usuarioAtual.telefone = usuarioAtualizado.telefone;

        limparErros(form);
        mostrarToast('Perfil atualizado com sucesso! ✅', 'sucesso');
      } else {
        // Tenta exibir a mensagem de erro do backend (status 400)
        let mensagemErro = 'Não foi possível atualizar o perfil. Tente novamente.';
        try {
          const dados = await res.json();
          if (dados?.mensagem) mensagemErro = dados.mensagem;
        } catch { /* silencia erros de parse */ }
        mostrarToast(mensagemErro, 'erro');
      }
    } catch {
      // Erro de rede
      mostrarToast('Erro de conexão. Verifique sua internet e tente novamente.', 'erro');
    } finally {
      if (btnSalvar) {
        btnSalvar.disabled = false;
        btnSalvar.textContent = textoOriginal;
      }
    }
  });
}

// ============================================
// EXCLUSÃO DE CONTA
// ============================================

/**
 * Configura os eventos do dialog de confirmação de exclusão.
 */
function configurarDialogExclusao() {
  const dialog     = document.getElementById('dialog-confirmar-exclusao');
  const btnExcluir  = document.getElementById('btn-excluir-conta');
  const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
  const btnCancelar  = document.getElementById('btn-cancelar-exclusao');

  /**
   * Abre o dialog nativo de confirmação.
   */
  function abrirDialogExclusao() {
    if (dialog) dialog.showModal();
  }

  /**
   * Fecha o dialog sem fazer nada.
   */
  function fecharDialog() {
    if (dialog) dialog.close();
  }

  /**
   * Executa a exclusão da conta via API:
   *  1. DELETE /api/usuarios/me
   *  2. Remove o JWT do storage
   *  3. Redireciona para a home com mensagem de despedida
   */
  async function confirmarExclusao() {
    try {
      const res = await apiFetch('/api/usuarios/me', { method: 'DELETE' });

      if (res.ok) {
        // Remove o JWT de ambos os storages
        localStorage.removeItem('paws-jwt');
        sessionStorage.removeItem('paws-jwt');

        salvarMensagemRedirect('Sua conta foi excluída. Até logo! 👋', 'info');
        window.location.replace('index.html');
      } else {
        mostrarToast('Não foi possível excluir sua conta. Tente novamente.', 'erro');
        fecharDialog();
      }
    } catch {
      mostrarToast('Erro de conexão. Verifique sua internet e tente novamente.', 'erro');
      fecharDialog();
    }
  }

  // Vincula eventos
  if (btnExcluir)   btnExcluir.addEventListener('click', abrirDialogExclusao);
  if (btnConfirmar) btnConfirmar.addEventListener('click', confirmarExclusao);
  if (btnCancelar)  btnCancelar.addEventListener('click', fecharDialog);

  // Fecha o dialog ao clicar fora (no backdrop nativo)
  if (dialog) {
    dialog.addEventListener('click', (evento) => {
      // O clique é no backdrop quando o alvo é o próprio <dialog>
      if (evento.target === dialog) fecharDialog();
    });
  }
}

// ============================================
// PONTO DE ENTRADA
// ============================================

init();
