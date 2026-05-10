/**
 * header.js
 * Atualiza dinamicamente o <nav> conforme o estado de login.
 *
 * - Deslogado: mostra "Entrar" + "Cadastrar"
 * - Logado:    mostra "Olá, Nome 👋" + "Sair"
 *
 * Layout: nav primária à ESQUERDA (Início, Animais, Sobre, Contato),
 * ações à DIREITA (Tema, Entrar/Cadastrar ou Saudação/Sair).
 * O separador <li class="menu-separador"> empurra tudo pra direita via flex.
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
 * Garante que o <li> separador exista (empurra ações pra direita via flex).
 * Inserido ANTES do botão de tema.
 */
function garantirSeparador(menuLinks) {
  let separador = menuLinks.querySelector('.menu-separador');
  if (separador) return separador;

  separador = document.createElement('li');
  separador.className = 'menu-separador';
  separador.setAttribute('aria-hidden', 'true');

  const itemTema = menuLinks.querySelector('#toggle-tema')?.closest('li');
  if (itemTema) {
    menuLinks.insertBefore(separador, itemTema);
  } else {
    menuLinks.appendChild(separador);
  }
  return separador;
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

  // Garante o separador que empurra ações pra direita
  garantirSeparador(menuLinks);

  // Botão de tema = âncora; itens auth são inseridos ANTES dele
  // (mas DEPOIS do separador, naturalmente)
  const itemTema = menuLinks.querySelector('#toggle-tema')?.closest('li');

  const fragmento = document.createDocumentFragment();

  if (estaLogado()) {
    const usuario = obterUsuario();
    const nome = primeiroNome(usuario?.nome);

    fragmento.appendChild(criarSaudacao(nome));
    fragmento.appendChild(
      criarItemLink('perfil.html', 'Perfil', {
        ariaLabel: 'Acessar meu perfil',
      })
    );
    fragmento.appendChild(
      criarItemLink('favoritos.html', 'Favoritos', {
        ariaLabel: 'Meus animais favoritos',
      })
    );
    fragmento.appendChild(
      criarItemLink('meus-pedidos.html', 'Meus Pedidos', {
        ariaLabel: 'Ver meus pedidos de adoção',
      })
    );
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
