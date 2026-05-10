/**
 * render.js
 * Responsável por renderizar os cards de animais no DOM.
 */

function criarCardElemento(animal) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.especie = animal.especie;
  card.dataset.id = animal.id;

  const wrapper = document.createElement('div');
  wrapper.className = 'card-img-wrapper is-loading';

  const img = document.createElement('img');
  img.src = animal.imagem;
  img.alt = `Foto de ${animal.nome}, ${animal.especie} para adoção`;
  img.loading = 'lazy';
  img.decoding = 'async';

  img.addEventListener('load', () => wrapper.classList.remove('is-loading'));
  img.addEventListener('error', () => {
    wrapper.classList.remove('is-loading');
    wrapper.classList.add('is-error');
  });

  wrapper.appendChild(img);
  card.appendChild(wrapper);

  const title = document.createElement('h3');
  title.textContent = animal.nome;
  card.appendChild(title);

  const age = document.createElement('p');
  age.textContent = animal.idade;
  card.appendChild(age);

  const link = document.createElement('a');
  link.href = `adotar.html?id=${encodeURIComponent(animal.id)}`;
  link.className = 'btn-adotar';
  link.textContent = 'ADOTAR';
  card.appendChild(link);

  if (animal.linkDetalhes) {
    const linkWrapper = document.createElement('p');
    linkWrapper.className = 'card-link';

    const link = document.createElement('a');
    link.href = animal.linkDetalhes;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Conhecer ${animal.nome} no site oficial de adoção`);
    link.textContent = 'Conhecer melhor →';

    linkWrapper.appendChild(link);
    card.appendChild(linkWrapper);
  }

  // Botão de favorito (coração)
  const btnFav = document.createElement('button');
  btnFav.type = 'button';
  btnFav.className = 'btn-favorito';
  btnFav.dataset.animalId = animal.id; // animal.id é o slug
  btnFav.setAttribute('aria-label', `Adicionar ${animal.nome} aos favoritos`);
  btnFav.setAttribute('aria-pressed', 'false');
  btnFav.textContent = '🤍';
  card.appendChild(btnFav);

  return card;
}

function criarMensagemVazia() {
  const mensagem = document.createElement('p');
  mensagem.className = 'mensagem-vazia';
  mensagem.textContent = 'Nenhum animal encontrado no momento. 🐾';
  return mensagem;
}

export function renderizarAnimais(animais, container) {
  if (!container) {
    console.error('Container não encontrado');
    return;
  }

  container.innerHTML = '';

  if (animais.length === 0) {
    container.appendChild(criarMensagemVazia());
    return;
  }

  const fragment = document.createDocumentFragment();
  animais.forEach((animal) => fragment.appendChild(criarCardElemento(animal)));
  container.appendChild(fragment);
}

export function renderizarPorEspecie(todosAnimais) {
  const containerGatos = document.querySelector('[data-lista="gatos"]');
  const containerCachorros = document.querySelector('[data-lista="cachorros"]');

  const gatos = todosAnimais.filter((a) => a.especie === 'gato');
  const cachorros = todosAnimais.filter((a) => a.especie === 'cachorro');

  renderizarAnimais(gatos, containerGatos);
  renderizarAnimais(cachorros, containerCachorros);
}
