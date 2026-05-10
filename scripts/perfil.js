/**
 * perfil.js
 * Controller da página de perfil do usuário logado.
 *
 * Responsabilidades:
 *  - Protege a rota (redireciona se não logado)
 *  - Exibe os dados do usuário na tela
 *  - Permite excluir a conta com confirmação via <dialog> nativo
 */

import { inicializarBootstrap, salvarMensagemRedirect } from './bootstrap.js';
import { protegerRota } from './proteger-rota.js';
import { obterUsuario, logout } from './auth.js';
import { storage, CHAVES } from './storage.js';

// ============================================
// INICIALIZAÇÃO
// ============================================

inicializarBootstrap();

const usuario = protegerRota({ mensagem: 'Faça login para acessar seu perfil. 🐾' });
if (!usuario) {
  // Rota protegida — o redirect já foi disparado, interrompe execução
  throw new Error('Usuário não autenticado. Redirecionando…');
}

// ============================================
// PREENCHE DADOS NA TELA
// ============================================

/**
 * Formata uma data ISO 8601 para o formato legível em pt-BR.
 * Ex.: "2024-03-15T10:00:00.000Z" → "15 de março de 2024"
 *
 * @param {string} dataISO
 * @returns {string}
 */
function formatarData(dataISO) {
  try {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dataISO;
  }
}

/**
 * Preenche os elementos de exibição com os dados do usuário.
 */
function preencherDados() {
  const seletor = (id) => document.getElementById(id);

  const nomeTitulo = seletor('perfil-nome-titulo');
  if (nomeTitulo) nomeTitulo.textContent = usuario.nome;

  const campoNome = seletor('perfil-nome');
  if (campoNome) campoNome.textContent = usuario.nome;

  const campoEmail = seletor('perfil-email');
  if (campoEmail) campoEmail.textContent = usuario.email;

  const campoTelefone = seletor('perfil-telefone');
  if (campoTelefone) campoTelefone.textContent = usuario.telefone || '—';

  const campoData = seletor('perfil-data');
  if (campoData) campoData.textContent = formatarData(usuario.dataCadastro);
}

preencherDados();

// ============================================
// EXCLUSÃO DE CONTA
// ============================================

const dialog = document.getElementById('dialog-confirmar-exclusao');
const btnExcluir = document.getElementById('btn-excluir-conta');
const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
const btnCancelar = document.getElementById('btn-cancelar-exclusao');

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
 * Executa a exclusão da conta:
 *  1. Remove o usuário da lista no storage
 *  2. Encerra a sessão
 *  3. Redireciona para a home com mensagem de despedida
 */
function confirmarExclusao() {
  const emailUsuario = usuario.email;

  // Lê lista atual, remove o usuário e salva de volta
  const lista = storage.ler(CHAVES.USUARIOS, []);
  const listaAtualizada = lista.filter((u) => u.email !== emailUsuario);
  storage.salvar(CHAVES.USUARIOS, listaAtualizada);

  // Encerra sessão
  logout();

  // Agenda mensagem de despedida e redireciona
  salvarMensagemRedirect('Sua conta foi excluída. Até logo! 👋', 'info');
  window.location.replace('index.html');
}

// Vincula eventos
if (btnExcluir) btnExcluir.addEventListener('click', abrirDialogExclusao);
if (btnConfirmar) btnConfirmar.addEventListener('click', confirmarExclusao);
if (btnCancelar) btnCancelar.addEventListener('click', fecharDialog);

// Fecha o dialog ao clicar fora (no backdrop nativo)
if (dialog) {
  dialog.addEventListener('click', (evento) => {
    // O clique é no backdrop quando o alvo é o próprio <dialog>
    if (evento.target === dialog) fecharDialog();
  });
}
