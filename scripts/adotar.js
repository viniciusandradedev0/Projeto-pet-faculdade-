/**
 * adotar.js
 * Controlador da página /adotar.html
 *
 * Responsabilidades:
 * - Proteger a rota (requer login)
 * - Ler ?id= da URL e carregar os dados do animal
 * - Preencher a página com as informações do animal
 * - Gerenciar o formulário de adoção com validação
 * - Salvar pedido em paws-pedidos e redirecionar com toast de sucesso
 */

import { carregarAnimais } from './data.js';
import { protegerRota } from './proteger-rota.js';
import { obterEmailUsuario, obterUsuario } from './auth.js';
import { storage, CHAVES } from './storage.js';
import { validarCampo, validarFormulario, conectarValidacaoAoVivo } from './validacao.js';
import { inicializarBootstrap, salvarMensagemRedirect } from './bootstrap.js';
import { mostrarToast } from './modal.js';

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  inicializarBootstrap();

  const usuario = protegerRota({
    mensagem: 'Faça login para iniciar um pedido de adoção. 🐾',
  });
  if (!usuario) return;

  const id = obterIdDaUrl();
  if (!id) {
    redirecionarParaAnimais('Animal não encontrado. Escolha um da lista.');
    return;
  }

  const animal = await carregarAnimal(id);
  if (!animal) {
    redirecionarParaAnimais('Animal não encontrado. Escolha um da lista.');
    return;
  }

  preencherPagina(animal);
  preencherDadosUsuario(usuario);
  configurarFormulario(animal);
}

// ============================================
// HELPERS
// ============================================

function obterIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || null;
}

async function carregarAnimal(id) {
  try {
    const animais = await carregarAnimais();
    return animais.find((a) => a.id === id) || null;
  } catch {
    return null;
  }
}

function redirecionarParaAnimais(mensagem) {
  salvarMensagemRedirect(mensagem, 'erro');
  window.location.replace('animais.html');
}

// ============================================
// PREENCHER PÁGINA
// ============================================

function preencherPagina(animal) {
  document.title = `Adotar ${animal.nome} — PAWS PLACE`;

  const img = document.getElementById('animal-img');
  const nome = document.getElementById('animal-nome');
  const especie = document.getElementById('animal-especie');
  const idade = document.getElementById('animal-idade');
  const linkEl = document.getElementById('animal-link');
  const tituloForm = document.getElementById('titulo-form');

  if (img) {
    img.src = animal.imagem;
    img.alt = `Foto de ${animal.nome}`;
    img.addEventListener('error', () => {
      img.parentElement?.classList.add('is-error');
    });
  }
  if (nome) nome.textContent = animal.nome;
  if (especie) especie.textContent = animal.especie === 'gato' ? '🐱 Gato' : '🐶 Cachorro';
  if (idade) idade.textContent = animal.idade;
  if (tituloForm) tituloForm.textContent = `Quero adotar ${animal.nome}`;

  if (linkEl && animal.linkDetalhes) {
    linkEl.href = animal.linkDetalhes;
    linkEl.removeAttribute('hidden');
  }
}

function preencherDadosUsuario(usuario) {
  const campoNome = document.querySelector('#form-adocao [name="nome"]');
  const campoEmail = document.querySelector('#form-adocao [name="email"]');

  if (campoNome && usuario.nome) campoNome.value = usuario.nome;
  if (campoEmail && usuario.email) campoEmail.value = usuario.email;
}

// ============================================
// FORMULÁRIO
// ============================================

function configurarFormulario(animal) {
  const form = document.getElementById('form-adocao');
  if (!form) return;

  conectarValidacaoAoVivo(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { ok, primeiroInvalido } = validarFormulario(form, [
      'nome',
      'email',
      'telefone',
      'consentimento',
    ]);

    if (!ok) {
      primeiroInvalido?.focus();
      mostrarToast('Verifique os campos destacados.', 'erro');
      return;
    }

    salvarPedido(form, animal);

    salvarMensagemRedirect(
      `Pedido de adoção de ${animal.nome} enviado! Entraremos em contato em breve. 🐾`,
      'sucesso'
    );
    window.location.replace('meus-pedidos.html');
  });
}

function salvarPedido(form, animal) {
  const dados = Object.fromEntries(new FormData(form));
  const pedidos = storage.ler(CHAVES.PEDIDOS, []);

  const novoPedido = {
    id: Date.now().toString(36),
    animalId: animal.id,
    animalNome: animal.nome,
    animalEspecie: animal.especie,
    usuarioEmail: obterEmailUsuario(),
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    mensagem: dados.mensagem || '',
    status: 'pendente',
    dataPedido: new Date().toISOString(),
    consentimentoTimestamp: new Date().toISOString(),
    consentimentoVersao: '1.0',
  };

  pedidos.push(novoPedido);
  storage.salvar(CHAVES.PEDIDOS, pedidos);
}

// ============================================
// BOOTSTRAP
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
