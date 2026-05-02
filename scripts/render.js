/**
 * render.js
 * Responsável por renderizar os cards de animais no DOM.
 * Esta função é o "componente Card" em forma vanilla — quando migrar
 * para React/Angular, vira um <AnimalCard /> ou <app-animal-card>.
 */

/**
 * Cria o HTML de um único card de animal.
 * @param {Object} animal - Dados do animal
 * @returns {string} HTML do card
 */
function criarCardHTML(animal) {
  const linkDetalhes = animal.linkDetalhes
    ? `<p class="card-link">
         <a href="${animal.linkDetalhes}" target="_blank" rel="noopener noreferrer"
            aria-label="Conhecer ${animal.nome} no site oficial de adoção">
           Conhecer melhor →
         </a>
       </p>`
    : '';

  return `
    <article class="card" data-especie="${animal.especie}" data-id="${animal.id}">
      <img src="${animal.imagem}"
           alt="Foto de ${animal.nome}, ${animal.especie} para adoção"
           loading="lazy"
           decoding="async">
      <h3>${animal.nome}</h3>
      <p>${animal.idade}</p>
      <button type="button" class="btn-adotar"
              data-animal-id="${animal.id}"
              data-animal-nome="${animal.nome}">
        ADOTAR
      </button>
      ${linkDetalhes}
    </article>
  `;
}

/**
 * Renderiza a lista de animais em um container.
 * @param {Array} animais - Lista de animais a renderizar
 * @param {HTMLElement} container - Elemento onde os cards serão inseridos
 */
export function renderizarAnimais(animais, container) {
  if (!container) {
    console.error('Container não encontrado');
    return;
  }

  if (animais.length === 0) {
    container.innerHTML = `
      <p class="mensagem-vazia">
        Nenhum animal encontrado no momento. 🐾
      </p>
    `;
    return;
  }

  // Junta todos os HTMLs e injeta de uma vez (mais performático que appendChild em loop)
  const html = animais.map(criarCardHTML).join('');
  container.innerHTML = html;
}

/**
 * Filtra animais por espécie e renderiza no container correspondente.
 * @param {Array} todosAnimais - Lista completa de animais
 */
export function renderizarPorEspecie(todosAnimais) {
  const containerGatos = document.querySelector('[data-lista="gatos"]');
  const containerCachorros = document.querySelector('[data-lista="cachorros"]');

  const gatos = todosAnimais.filter(a => a.especie === 'gato');
  const cachorros = todosAnimais.filter(a => a.especie === 'cachorro');

  renderizarAnimais(gatos, containerGatos);
  renderizarAnimais(cachorros, containerCachorros);
}
