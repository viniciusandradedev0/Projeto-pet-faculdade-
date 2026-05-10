import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inicializarFiltros } from '../scripts/filtros.js';

// ============================================
// DADOS DE TESTE
// ============================================

const animais = [
  { id: 'nespresso',  nome: 'Nespresso',  especie: 'gato'     },
  { id: 'topazio',    nome: 'Topázio',    especie: 'cachorro' },
  { id: 'lady-gaga',  nome: 'Lady Gaga',  especie: 'gato'     },
  { id: 'stallone',   nome: 'Stallone',   especie: 'cachorro' },
  { id: 'batman',     nome: 'Batman',     especie: 'cachorro' },
];

// ============================================
// SETUP DO DOM (jsdom)
// ============================================

function montarDOM() {
  document.body.innerHTML = `
    <input id="busca" type="search" />
    <button class="filtro-btn is-active" data-filtro="todos"     aria-pressed="true">Todos</button>
    <button class="filtro-btn"           data-filtro="gato"      aria-pressed="false">Gatos</button>
    <button class="filtro-btn"           data-filtro="cachorro"  aria-pressed="false">Cachorros</button>
    <p id="contador-resultados"></p>
    <div id="mensagem-vazio" hidden></div>
    <button id="limpar-filtros">Limpar</button>
    <section data-secao="gato"></section>
    <section data-secao="cachorro"></section>
  `;
}

// ============================================
// TESTES
// ============================================

describe('inicializarFiltros', () => {
  let callback;

  beforeEach(() => {
    montarDOM();
    callback = vi.fn();
    vi.useFakeTimers();
    inicializarFiltros(animais, callback);
    vi.runAllTimers(); // dispara o aplicarFiltros() inicial
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('inicialização', () => {
    it('chama o callback com todos os animais ao inicializar', () => {
      expect(callback).toHaveBeenCalledWith(animais);
    });

    it('exibe o contador com o total de animais', () => {
      const contador = document.getElementById('contador-resultados');
      expect(contador.textContent).toContain('5');
    });

    it('mantém mensagem-vazio oculta quando há animais', () => {
      expect(document.getElementById('mensagem-vazio').hidden).toBe(true);
    });
  });

  describe('filtro por espécie', () => {
    it('filtra apenas gatos ao clicar no botão Gatos', () => {
      document.querySelector('[data-filtro="gato"]').click();
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada.every(a => a.especie === 'gato')).toBe(true);
      expect(ultimaChamada).toHaveLength(2);
    });

    it('filtra apenas cachorros ao clicar no botão Cachorros', () => {
      document.querySelector('[data-filtro="cachorro"]').click();
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada.every(a => a.especie === 'cachorro')).toBe(true);
      expect(ultimaChamada).toHaveLength(3);
    });

    it('volta para todos ao clicar no botão Todos', () => {
      document.querySelector('[data-filtro="cachorro"]').click();
      vi.runAllTimers();
      document.querySelector('[data-filtro="todos"]').click();
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada).toHaveLength(5);
    });

    it('marca aria-pressed corretamente no botão ativo', () => {
      document.querySelector('[data-filtro="gato"]').click();
      vi.runAllTimers();

      expect(document.querySelector('[data-filtro="gato"]').getAttribute('aria-pressed')).toBe('true');
      expect(document.querySelector('[data-filtro="todos"]').getAttribute('aria-pressed')).toBe('false');
      expect(document.querySelector('[data-filtro="cachorro"]').getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('busca por nome', () => {
    it('encontra animal pelo nome exato', () => {
      const input = document.getElementById('busca');
      input.value = 'Batman';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada).toHaveLength(1);
      expect(ultimaChamada[0].nome).toBe('Batman');
    });

    it('busca sem acento encontra animal com acento (normalização)', () => {
      const input = document.getElementById('busca');
      input.value = 'topazio';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada).toHaveLength(1);
      expect(ultimaChamada[0].nome).toBe('Topázio');
    });

    it('busca em minúscula encontra animal cadastrado com maiúscula', () => {
      const input = document.getElementById('busca');
      input.value = 'stallone';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada[0].nome).toBe('Stallone');
    });

    it('busca parcial retorna todos os que contêm o trecho', () => {
      const input = document.getElementById('busca');
      input.value = 'a';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      const nomes = ultimaChamada.map(a => a.nome);
      expect(nomes).toContain('Lady Gaga');
      expect(nomes).toContain('Batman');
      expect(nomes).toContain('Stallone');
    });

    it('busca sem resultado exibe mensagem-vazio e texto correto no contador', () => {
      const input = document.getElementById('busca');
      input.value = 'xyzinexistente';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      expect(document.getElementById('mensagem-vazio').hidden).toBe(false);
      expect(document.getElementById('contador-resultados').textContent)
        .toBe('Nenhum resultado encontrado');
    });
  });

  describe('debounce', () => {
    it('não chama o callback imediatamente ao digitar', () => {
      const chamdasAntes = callback.mock.calls.length;
      const input = document.getElementById('busca');
      input.value = 'Bat';
      input.dispatchEvent(new Event('input'));

      // Sem avançar o timer: callback NÃO deve ter sido chamado novamente
      expect(callback.mock.calls.length).toBe(chamdasAntes);
    });

    it('chama o callback apenas uma vez após 300ms', () => {
      const input = document.getElementById('busca');
      input.value = 'B';
      input.dispatchEvent(new Event('input'));
      input.value = 'Ba';
      input.dispatchEvent(new Event('input'));
      input.value = 'Bat';
      input.dispatchEvent(new Event('input'));

      const chamdasAntes = callback.mock.calls.length;
      vi.advanceTimersByTime(300);

      expect(callback.mock.calls.length).toBe(chamdasAntes + 1);
    });
  });

  describe('botão limpar', () => {
    it('restaura todos os animais após limpar filtro de espécie', () => {
      document.querySelector('[data-filtro="gato"]').click();
      vi.runAllTimers();
      document.getElementById('limpar-filtros').click();
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada).toHaveLength(5);
    });

    it('restaura todos os animais após limpar busca por texto', () => {
      const input = document.getElementById('busca');
      input.value = 'Batman';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      document.getElementById('limpar-filtros').click();
      vi.runAllTimers();

      const ultimaChamada = callback.mock.calls.at(-1)[0];
      expect(ultimaChamada).toHaveLength(5);
    });

    it('limpa o campo de busca visualmente', () => {
      const input = document.getElementById('busca');
      input.value = 'Batman';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();

      document.getElementById('limpar-filtros').click();
      vi.runAllTimers();

      expect(input.value).toBe('');
    });

    it('reativa o botão Todos com aria-pressed true', () => {
      document.querySelector('[data-filtro="gato"]').click();
      vi.runAllTimers();
      document.getElementById('limpar-filtros').click();
      vi.runAllTimers();

      expect(document.querySelector('[data-filtro="todos"]').getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('visibilidade das seções', () => {
    it('oculta seção de cachorros ao filtrar só gatos', () => {
      document.querySelector('[data-filtro="gato"]').click();
      vi.runAllTimers();

      const secaoCachorro = document.querySelector('[data-secao="cachorro"]');
      expect(secaoCachorro.classList.contains('is-hidden')).toBe(true);
    });

    it('exibe ambas as seções ao voltar para Todos', () => {
      document.querySelector('[data-filtro="gato"]').click();
      vi.runAllTimers();
      document.querySelector('[data-filtro="todos"]').click();
      vi.runAllTimers();

      expect(document.querySelector('[data-secao="gato"]').classList.contains('is-hidden')).toBe(false);
      expect(document.querySelector('[data-secao="cachorro"]').classList.contains('is-hidden')).toBe(false);
    });
  });
});
