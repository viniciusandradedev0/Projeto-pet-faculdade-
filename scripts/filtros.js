/**
 * filtros.js
 * Sistema de filtros (espécie) + busca por nome com debounce.
 * Oculta/exibe seções inteiras (banner + grid) via classe .is-hidden.
 */

/**
 * Debounce: só executa após o usuário parar de digitar por X ms.
 * Evita filtragens desnecessárias a cada tecla pressionada.
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Normaliza string para busca: minúscula + remove acentos.
 * Permite buscar "topazio" e encontrar "Topázio".
 */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Inicializa o sistema de filtros e busca.
 * @param {Array} todosAnimais - Lista completa de animais
 * @param {Function} onFiltrar - Callback que recebe os animais filtrados
 */
export function inicializarFiltros(todosAnimais, onFiltrar) {
  const inputBusca = document.getElementById('busca');
  const botoes = document.querySelectorAll('.filtro-btn');
  const contador = document.getElementById('contador-resultados');
  const mensagemVazio = document.getElementById('mensagem-vazio');
  const btnLimpar = document.getElementById('limpar-filtros');

  const totaisPorEspecie = todosAnimais.reduce(
    (acc, animal) => {
      if (!acc[animal.especie]) acc[animal.especie] = 0;
      acc[animal.especie] += 1;
      return acc;
    },
    { gato: 0, cachorro: 0 }
  );

  let filtroAtivo = 'todos';
  let termoBusca = '';

  function aplicarFiltros() {
    const termo = normalizar(termoBusca.trim());

    const filtrados = todosAnimais.filter((animal) => {
      const passaEspecie =
        filtroAtivo === 'todos' || animal.especie === filtroAtivo;
      const passaBusca =
        termo === '' || normalizar(animal.nome).includes(termo);
      return passaEspecie && passaBusca;
    });

    onFiltrar(filtrados);

    const temGato = filtrados.some((a) => a.especie === 'gato');
    const temCachorro = filtrados.some((a) => a.especie === 'cachorro');

    document.querySelectorAll('[data-secao="gato"]').forEach((el) => {
      el.classList.toggle('is-hidden', !temGato);
    });
    document.querySelectorAll('[data-secao="cachorro"]').forEach((el) => {
      el.classList.toggle('is-hidden', !temCachorro);
    });

    if (filtrados.length === 0) {
      mensagemVazio.hidden = false;
      contador.textContent = 'Nenhum resultado encontrado';
      return;
    }

    mensagemVazio.hidden = true;

    const qtdGatos = filtrados.filter((a) => a.especie === 'gato').length;
    const qtdCaes = filtrados.filter((a) => a.especie === 'cachorro').length;

    let texto = `${filtrados.length} `;
    texto += filtrados.length === 1 ? 'animal encontrado' : 'animais encontrados';

    if (
      filtroAtivo === 'todos' &&
      (termo || qtdGatos !== totaisPorEspecie.gato || qtdCaes !== totaisPorEspecie.cachorro)
    ) {
      texto += ` (${qtdGatos} ${qtdGatos === 1 ? 'gato' : 'gatos'} e ${qtdCaes} ${qtdCaes === 1 ? 'cachorro' : 'cachorros'})`;
    }

    contador.textContent = texto;
  }

  botoes.forEach((btn) => {
    btn.addEventListener('click', () => {
      botoes.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      filtroAtivo = btn.dataset.filtro;
      aplicarFiltros();
    });
  });

  const buscarComDebounce = debounce((valor) => {
    termoBusca = valor;
    aplicarFiltros();
  }, 300);

  inputBusca.addEventListener('input', (e) => buscarComDebounce(e.target.value));

  btnLimpar?.addEventListener('click', () => {
    inputBusca.value = '';
    termoBusca = '';
    filtroAtivo = 'todos';
    botoes.forEach((b) => {
      const ativo = b.dataset.filtro === 'todos';
      b.classList.toggle('is-active', ativo);
      b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    aplicarFiltros();
    inputBusca.focus();
  });

  aplicarFiltros();
}
