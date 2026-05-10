// tests/auth.test.js

// Garante que crypto.subtle esteja disponível (jsdom tem suporte parcial)
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto?.subtle) {
  globalThis.crypto = webcrypto;
}

import { cadastrar, login, logout, obterUsuario, estaLogado, obterEmailUsuario } from '../scripts/auth.js';

// ============================================================
// Limpa o localStorage antes de cada teste para isolamento
// ============================================================
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// ============================================================
// cadastrar
// ============================================================
describe('cadastrar', () => {
  const dadosValidos = {
    nome: 'Maria Silva',
    email: 'maria@exemplo.com',
    senha: 'Senha123',
    telefone: '(11) 91234-5678',
  };

  it('cadastra um usuário com dados válidos', async () => {
    const usuario = await cadastrar(dadosValidos);
    expect(usuario).toBeDefined();
    expect(usuario.email).toBe('maria@exemplo.com');
    expect(usuario.nome).toBe('Maria Silva');
  });

  it('não expõe a senhaHash no retorno', async () => {
    const usuario = await cadastrar(dadosValidos);
    expect(usuario.senhaHash).toBeUndefined();
  });

  it('persiste o usuário no localStorage', async () => {
    await cadastrar(dadosValidos);
    const raw = localStorage.getItem('paws-usuarios');
    expect(raw).not.toBeNull();
    const lista = JSON.parse(raw);
    expect(lista).toHaveLength(1);
    expect(lista[0].email).toBe('maria@exemplo.com');
  });

  it('a senhaHash armazenada é diferente da senha em texto puro', async () => {
    await cadastrar(dadosValidos);
    const lista = JSON.parse(localStorage.getItem('paws-usuarios'));
    expect(lista[0].senhaHash).not.toBe(dadosValidos.senha);
    expect(lista[0].senhaHash).toHaveLength(64); // SHA-256 hex = 64 chars
  });

  it('inclui a data de cadastro no registro', async () => {
    const usuario = await cadastrar(dadosValidos);
    expect(usuario.dataCadastro).toBeDefined();
    expect(new Date(usuario.dataCadastro).toISOString()).toBe(usuario.dataCadastro);
  });

  it('lança erro ao tentar cadastrar e-mail já existente', async () => {
    await cadastrar(dadosValidos);
    await expect(cadastrar(dadosValidos)).rejects.toThrow();
  });

  it('normaliza o e-mail para minúsculas ao cadastrar', async () => {
    const usuario = await cadastrar({ ...dadosValidos, email: 'Maria@Exemplo.COM' });
    expect(usuario.email).toBe('maria@exemplo.com');
  });

  it('lança erro para nome inválido (muito curto)', async () => {
    await expect(cadastrar({ ...dadosValidos, nome: 'A' })).rejects.toThrow();
  });

  it('lança erro para e-mail inválido', async () => {
    await expect(cadastrar({ ...dadosValidos, email: 'nao-e-email' })).rejects.toThrow();
  });

  it('lança erro para senha muito curta', async () => {
    await expect(cadastrar({ ...dadosValidos, senha: '123' })).rejects.toThrow();
  });

  it('lança erro para telefone inválido (poucos dígitos)', async () => {
    await expect(cadastrar({ ...dadosValidos, telefone: '123' })).rejects.toThrow();
  });
});

// ============================================================
// login
// ============================================================
describe('login', () => {
  const dados = {
    nome: 'João Costa',
    email: 'joao@exemplo.com',
    senha: 'Senha456',
    telefone: '(21) 98765-4321',
  };

  beforeEach(async () => {
    // Cadastra o usuário antes de cada teste de login
    await cadastrar(dados);
  });

  it('faz login com credenciais corretas', async () => {
    const usuario = await login({ email: dados.email, senha: dados.senha });
    expect(usuario).toBeDefined();
    expect(usuario.email).toBe(dados.email);
    expect(usuario.nome).toBe(dados.nome);
  });

  it('não expõe a senhaHash no retorno do login', async () => {
    const usuario = await login({ email: dados.email, senha: dados.senha });
    expect(usuario.senhaHash).toBeUndefined();
  });

  it('lança erro com e-mail inexistente', async () => {
    await expect(login({ email: 'inexistente@exemplo.com', senha: dados.senha })).rejects.toThrow();
  });

  it('lança erro com senha errada', async () => {
    await expect(login({ email: dados.email, senha: 'SenhaErrada99' })).rejects.toThrow();
  });

  it('lança erro quando e-mail não é fornecido', async () => {
    await expect(login({ email: '', senha: dados.senha })).rejects.toThrow();
  });

  it('lança erro quando senha não é fornecida', async () => {
    await expect(login({ email: dados.email, senha: '' })).rejects.toThrow();
  });

  it('com lembrar=false salva sessão no sessionStorage', async () => {
    await login({ email: dados.email, senha: dados.senha, lembrar: false });
    expect(sessionStorage.getItem('paws-sessao')).not.toBeNull();
    expect(localStorage.getItem('paws-sessao')).toBeNull();
  });

  it('com lembrar=true salva sessão no localStorage', async () => {
    await login({ email: dados.email, senha: dados.senha, lembrar: true });
    expect(localStorage.getItem('paws-sessao')).not.toBeNull();
    expect(sessionStorage.getItem('paws-sessao')).toBeNull();
  });

  it('aceita e-mail em caixa alta (normaliza antes de comparar)', async () => {
    const usuario = await login({ email: 'JOAO@EXEMPLO.COM', senha: dados.senha });
    expect(usuario.email).toBe(dados.email);
  });
});

// ============================================================
// logout
// ============================================================
describe('logout', () => {
  const dados = {
    nome: 'Ana Lima',
    email: 'ana@exemplo.com',
    senha: 'Senha789',
    telefone: '(31) 98888-7777',
  };

  it('encerra a sessão do sessionStorage', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha, lembrar: false });
    logout();
    expect(sessionStorage.getItem('paws-sessao')).toBeNull();
  });

  it('encerra a sessão do localStorage', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha, lembrar: true });
    logout();
    expect(localStorage.getItem('paws-sessao')).toBeNull();
  });

  it('não lança erro ao chamar logout sem sessão ativa', () => {
    expect(() => logout()).not.toThrow();
  });

  it('estaLogado() retorna false após logout', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    logout();
    expect(estaLogado()).toBe(false);
  });
});

// ============================================================
// estaLogado
// ============================================================
describe('estaLogado', () => {
  const dados = {
    nome: 'Pedro Rocha',
    email: 'pedro@exemplo.com',
    senha: 'Senha111',
    telefone: '(41) 97777-6666',
  };

  it('retorna false quando não há sessão', () => {
    expect(estaLogado()).toBe(false);
  });

  it('retorna true após login bem-sucedido', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    expect(estaLogado()).toBe(true);
  });

  it('retorna false após logout', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    logout();
    expect(estaLogado()).toBe(false);
  });
});

// ============================================================
// obterUsuario
// ============================================================
describe('obterUsuario', () => {
  const dados = {
    nome: 'Carla Souza',
    email: 'carla@exemplo.com',
    senha: 'Senha222',
    telefone: '(51) 96666-5555',
  };

  it('retorna null quando não há sessão', () => {
    expect(obterUsuario()).toBeNull();
  });

  it('retorna os dados do usuário logado', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    const usuario = obterUsuario();
    expect(usuario).not.toBeNull();
    expect(usuario.email).toBe(dados.email);
    expect(usuario.nome).toBe(dados.nome);
  });

  it('não expõe a senhaHash', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    const usuario = obterUsuario();
    expect(usuario.senhaHash).toBeUndefined();
  });

  it('retorna null após logout', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    logout();
    expect(obterUsuario()).toBeNull();
  });
});

// ============================================================
// obterEmailUsuario
// ============================================================
describe('obterEmailUsuario', () => {
  const dados = {
    nome: 'Lucas Fernandes',
    email: 'lucas@exemplo.com',
    senha: 'Senha333',
    telefone: '(61) 95555-4444',
  };

  it('retorna null quando não há sessão', () => {
    expect(obterEmailUsuario()).toBeNull();
  });

  it('retorna o e-mail do usuário logado', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    expect(obterEmailUsuario()).toBe(dados.email);
  });

  it('retorna null após logout', async () => {
    await cadastrar(dados);
    await login({ email: dados.email, senha: dados.senha });
    logout();
    expect(obterEmailUsuario()).toBeNull();
  });
});
