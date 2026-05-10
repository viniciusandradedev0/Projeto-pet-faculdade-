// tests/storage.test.js
import { storage, sessao, CHAVES } from '../scripts/storage.js';

// ============================================================
// Limpa ambos os storages antes de cada teste
// ============================================================
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// ============================================================
// CHAVES
// ============================================================
describe('CHAVES', () => {
  it('exporta as chaves esperadas', () => {
    expect(CHAVES.TEMA).toBeDefined();
    expect(CHAVES.USUARIOS).toBeDefined();
    expect(CHAVES.SESSAO).toBeDefined();
    expect(CHAVES.PEDIDOS).toBeDefined();
    expect(CHAVES.MENSAGEM_REDIRECT).toBeDefined();
  });

  it('todas as chaves contêm o prefixo paws-', () => {
    for (const chave of Object.values(CHAVES)) {
      expect(chave.startsWith('paws-')).toBe(true);
    }
  });

  it('é um objeto congelado (imutável)', () => {
    expect(Object.isFrozen(CHAVES)).toBe(true);
  });
});

// ============================================================
// storage.disponivel
// ============================================================
describe('storage.disponivel', () => {
  it('retorna true no ambiente jsdom', () => {
    expect(storage.disponivel()).toBe(true);
  });
});

// ============================================================
// storage.salvar e storage.ler
// ============================================================
describe('storage.salvar / storage.ler', () => {
  it('salva e lê uma string corretamente', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    expect(storage.ler(CHAVES.TEMA)).toBe('dark');
  });

  it('salva e lê um objeto', () => {
    const dados = { nome: 'Ana', email: 'ana@exemplo.com' };
    storage.salvar(CHAVES.USUARIOS, dados);
    expect(storage.ler(CHAVES.USUARIOS)).toEqual(dados);
  });

  it('salva e lê um array', () => {
    const lista = [1, 2, 3];
    storage.salvar(CHAVES.PEDIDOS, lista);
    expect(storage.ler(CHAVES.PEDIDOS)).toEqual(lista);
  });

  it('salva e lê um booleano', () => {
    storage.salvar(CHAVES.TEMA, true);
    expect(storage.ler(CHAVES.TEMA)).toBe(true);
  });

  it('salva e lê um número', () => {
    storage.salvar(CHAVES.TEMA, 42);
    expect(storage.ler(CHAVES.TEMA)).toBe(42);
  });

  it('retorna null para chave inexistente por padrão', () => {
    expect(storage.ler(CHAVES.TEMA)).toBeNull();
  });

  it('retorna o valor padrão fornecido para chave inexistente', () => {
    expect(storage.ler(CHAVES.TEMA, 'light')).toBe('light');
  });

  it('retorna o valor padrão quando chave não existe (array)', () => {
    expect(storage.ler(CHAVES.USUARIOS, [])).toEqual([]);
  });

  it('retorna true ao salvar com sucesso', () => {
    expect(storage.salvar(CHAVES.TEMA, 'dark')).toBe(true);
  });
});

// ============================================================
// storage.remover
// ============================================================
describe('storage.remover', () => {
  it('remove uma chave existente', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    storage.remover(CHAVES.TEMA);
    expect(storage.ler(CHAVES.TEMA)).toBeNull();
  });

  it('retorna true ao remover (mesmo que a chave não exista)', () => {
    expect(storage.remover(CHAVES.TEMA)).toBe(true);
  });

  it('não afeta outras chaves', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    storage.salvar(CHAVES.SESSAO, { email: 'x@y.com' });
    storage.remover(CHAVES.TEMA);
    expect(storage.ler(CHAVES.SESSAO)).toEqual({ email: 'x@y.com' });
  });
});

// ============================================================
// storage.limpar
// ============================================================
describe('storage.limpar', () => {
  it('remove todas as chaves com prefixo paws-', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    storage.salvar(CHAVES.SESSAO, { email: 'a@b.com' });
    storage.limpar();
    expect(storage.ler(CHAVES.TEMA)).toBeNull();
    expect(storage.ler(CHAVES.SESSAO)).toBeNull();
  });

  it('retorna true ao limpar com sucesso', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    expect(storage.limpar()).toBe(true);
  });

  it('não remove chaves sem o prefixo paws-', () => {
    localStorage.setItem('outra-app-config', 'valor');
    storage.salvar(CHAVES.TEMA, 'dark');
    storage.limpar();
    expect(localStorage.getItem('outra-app-config')).toBe('valor');
  });

  it('funciona mesmo quando não há chaves paws- para remover', () => {
    expect(storage.limpar()).toBe(true);
  });
});

// ============================================================
// sessao (sessionStorage)
// ============================================================
describe('sessao.disponivel', () => {
  it('retorna true no ambiente jsdom', () => {
    expect(sessao.disponivel()).toBe(true);
  });
});

describe('sessao.salvar / sessao.ler', () => {
  it('salva e lê dados no sessionStorage', () => {
    sessao.salvar(CHAVES.MENSAGEM_REDIRECT, { texto: 'Bem-vindo!', tipo: 'info' });
    expect(sessao.ler(CHAVES.MENSAGEM_REDIRECT)).toEqual({ texto: 'Bem-vindo!', tipo: 'info' });
  });

  it('retorna null para chave inexistente por padrão', () => {
    expect(sessao.ler(CHAVES.MENSAGEM_REDIRECT)).toBeNull();
  });

  it('retorna valor padrão para chave inexistente', () => {
    expect(sessao.ler(CHAVES.MENSAGEM_REDIRECT, 'fallback')).toBe('fallback');
  });

  it('não confunde dados entre localStorage e sessionStorage', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    expect(sessao.ler(CHAVES.TEMA)).toBeNull();

    sessao.salvar(CHAVES.TEMA, 'light');
    expect(storage.ler(CHAVES.TEMA)).toBe('dark');
    expect(sessao.ler(CHAVES.TEMA)).toBe('light');
  });
});

describe('sessao.remover', () => {
  it('remove uma chave do sessionStorage', () => {
    sessao.salvar(CHAVES.SESSAO, { email: 'x@y.com' });
    sessao.remover(CHAVES.SESSAO);
    expect(sessao.ler(CHAVES.SESSAO)).toBeNull();
  });
});

describe('sessao.limpar', () => {
  it('remove todas as chaves paws- do sessionStorage', () => {
    sessao.salvar(CHAVES.SESSAO, { email: 'a@b.com' });
    sessao.salvar(CHAVES.MENSAGEM_REDIRECT, 'teste');
    sessao.limpar();
    expect(sessao.ler(CHAVES.SESSAO)).toBeNull();
    expect(sessao.ler(CHAVES.MENSAGEM_REDIRECT)).toBeNull();
  });

  it('não afeta o localStorage', () => {
    storage.salvar(CHAVES.TEMA, 'dark');
    sessao.limpar();
    expect(storage.ler(CHAVES.TEMA)).toBe('dark');
  });
});
