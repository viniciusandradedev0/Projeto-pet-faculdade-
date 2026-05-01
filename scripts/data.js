/**
 * data.js
 * Responsável por carregar os dados dos animais do JSON.
 */

const URL_DADOS = './data/animais.json';

/**
 * Carrega a lista de animais do arquivo JSON.
 * @returns {Promise<Array>} Lista de animais
 */
export async function carregarAnimais() {
  try {
    const resposta = await fetch(URL_DADOS);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}: não foi possível carregar ${URL_DADOS}`);
    }

    const animais = await resposta.json();

    if (!Array.isArray(animais)) {
      throw new Error('JSON inválido: esperado um array de animais');
    }

    return animais;
  } catch (erro) {
    console.error('❌ Falha ao carregar animais:', erro.message);
    console.error('Verifique:');
    console.error('1. O arquivo data/animais.json existe?');
    console.error('2. O JSON é válido? (use https://jsonlint.com)');
    console.error('3. O Live Server está rodando?');

    document.querySelectorAll('[data-lista]').forEach(container => {
      container.innerHTML = `
        <p class="mensagem-vazia" style="color: #c0392b;">
          ⚠️ Erro ao carregar animais. Verifique o console (F12) para mais detalhes.
        </p>
      `;
    });

    return [];
  }
}
