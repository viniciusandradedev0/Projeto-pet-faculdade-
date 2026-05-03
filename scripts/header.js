/**
 * header.js
 * Atualiza dinamicamente o <nav> conforme o estado de login.
 *
 * - Deslogado: mostra "Entrar" + "Cadastrar"
 * - Logado:    mostra "Olá, Nome 👋" + "Sair"
 *
 * Funciona em TODAS as páginas — basta o <nav> ter a estrutura padrão
 * (com <ul class="menu-links">). Não exige mudanças no HTML existente:
 * os itens são INJETADOS via JS antes do botão de tema.
 *
 * USO (chamado automaticamente pelo bootstrap.js):
 *   import { atualizarHeader } from './header.js';
 *   atualizarHeader();
 */

import { estaLogado, obterUsuario, logout } from './auth.js';
import { salvarMensagemRedirect } from './bootstrap.js';

/**
 * Pega o primeiro nome (até o primeiro espaço).
 * "Vinicius Teste" → "Vinicius"
 */
function primeiroNome(nomeCompleto) {
  return String(nomeCompleto || '').trim().split(/\s+/)[0] || 'amigo';
}

/**
 * Remove os itens de auth previamente injetados, se existirem.
 * Garante idempotência: pode ser chamado N vezes sem duplicar.
 */
function limparItensAuth(menuLinks) {
  menuLinks.querySelectorAll('[data-auth-item]').forEach((el) => el.remove());
}

/**
 * Cria um <li> de menu com link.
 */
function criarItemLink(href, texto, extras = {}) {
  const li = document.createElement('li');
  li.dataset.authItem = 'true';

  const a = document.createElement('a');
  a.href = href;
  a.textContent = texto;
  if (extras.classe) a.className = extras.classe;
  if (extras.ariaLabel) a.setAttribute('aria-label', extras.ariaLabel);

  li.appendChild(a);
  return li;
}

/**
 * Cria um <li> de menu com botão (ex.: "Sair").
 */
function criarItemBotao(texto, onClick, extras = {}) {
  const li = document.createElement('li');
  li.dataset.authItem = 'true';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = texto;
  btn.className = extras.classe || 'menu-btn-link';
  if (extras.ariaLabel) btn.setAttribute('aria-label', extras.ariaLabel);
  btn.addEventListener('click', onClick);

  li.appendChild(btn);
  return li;
}

/**
 * Cria o cumprimento "Olá, Nome 👋".
 */
function criarSaudacao(nome) {
  const li = document.createElement('li');
  li.dataset.authItem = 'true';
  li.className = 'menu-saudacao';
  li.setAttribute('aria-label', `Você está logado como ${nome}`);
  li.innerHTML = `<span class="menu-saudacao__texto">Olá, <strong>${nome}</strong> 👋</span>`;
  return li;
}

/**
 * Handler do logout: limpa sessão, agenda toast e redireciona pra home.
 */
function aoClicarSair() {
  const usuario = obterUsuario();
  const nome = primeiroNome(usuario?.nome);

  logout();
  salvarMensagemRedirect(`Até logo, ${nome}! 👋`, 'sucesso');
  window.location.href = 'index.html';
}

/**
 * Atualiza o header conforme o estado de autenticação.
 * Chamado automaticamente pelo bootstrap.js em toda página.
 */
export function atualizarHeader() {
  const menuLinks = document.querySelector('.menu-links');
  if (!menuLinks) return; // página sem menu padrão (raro)

  // Limpa itens de auth anteriores (idempotência)
  limparItensAuth(menuLinks);

  // O botão de tema é o "âncora" — inserimos os itens ANTES dele
  const itemTema = menuLinks.querySelector('#toggle-tema')?.closest('li');

  const fragmento = document.createDocumentFragment();

  if (estaLogado()) {
    const usuario = obterUsuario();
    const nome = primeiroNome(usuario?.nome);

    fragmento.appendChild(criarSaudacao(nome));
    fragmento.appendChild(
      criarItemBotao('Sair', aoClicarSair, {
        classe: 'menu-btn-link menu-btn-link--sair',
        ariaLabel: 'Encerrar sessão',
      })
    );
  } else {
    fragmento.appendChild(
      criarItemLink('login.html', 'Entrar', { ariaLabel: 'Acessar minha conta' })
    );
    fragmento.appendChild(
      criarItemLink('cadastro.html', 'Cadastrar', {
        classe: 'menu-link-destaque',
        ariaLabel: 'Criar uma nova conta',
      })
    );
  }

  // Insere ANTES do botão de tema (se existir) ou no final
  if (itemTema) {
    menuLinks.insertBefore(fragmento, itemTema);
  } else {
    menuLinks.appendChild(fragmento);
  }
}