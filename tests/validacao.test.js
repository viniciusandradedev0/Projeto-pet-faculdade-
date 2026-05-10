// tests/validacao.test.js
import { validadores, validarCampo, validarFormulario } from '../scripts/validacao.js';

// ============================================================
// Utilitário: cria um input DOM simples para os testes
// ============================================================
function criarInput({ name, type = 'text', value = '', checked = false, form = null } = {}) {
  const el = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  if (type !== 'textarea') el.type = type;
  el.name = name;
  el.value = value;
  if (type === 'checkbox') el.checked = checked;
  if (form) form.appendChild(el);
  return el;
}

function criarFormulario(campos = []) {
  const form = document.createElement('form');
  campos.forEach(({ name, type = 'text', value = '', checked = false }) => {
    const el = criarInput({ name, type, value, checked, form });
    // Cria elemento de erro associado
    const erroEl = document.createElement('span');
    erroEl.setAttribute('data-erro', name);
    form.appendChild(erroEl);
  });
  return form;
}

// ============================================================
// validadores.nome
// ============================================================
describe('validadores.nome', () => {
  it('aceita nome com 3 ou mais caracteres', () => {
    expect(validadores.nome('Ana')).toBe(true);
    expect(validadores.nome('João Silva')).toBe(true);
  });

  it('rejeita nome com menos de 3 caracteres', () => {
    const resultado = validadores.nome('Jo');
    expect(typeof resultado).toBe('string');
    expect(resultado.length).toBeGreaterThan(0);
  });

  it('rejeita nome vazio', () => {
    expect(typeof validadores.nome('')).toBe('string');
  });

  it('rejeita nome só com espaços', () => {
    expect(typeof validadores.nome('   ')).toBe('string');
  });
});

// ============================================================
// validadores.email
// ============================================================
describe('validadores.email', () => {
  it('aceita e-mails válidos', () => {
    expect(validadores.email('usuario@exemplo.com')).toBe(true);
    expect(validadores.email('nome.sobrenome@dominio.org')).toBe(true);
    expect(validadores.email('user+tag@mail.co')).toBe(true);
  });

  it('rejeita e-mails sem @', () => {
    expect(typeof validadores.email('invalido.com')).toBe('string');
  });

  it('rejeita e-mails sem domínio', () => {
    expect(typeof validadores.email('invalido@')).toBe('string');
  });

  it('rejeita e-mails vazios', () => {
    expect(typeof validadores.email('')).toBe('string');
  });

  it('rejeita e-mails com espaços', () => {
    expect(typeof validadores.email('user @mail.com')).toBe('string');
  });
});

// ============================================================
// validadores.telefone
// ============================================================
describe('validadores.telefone', () => {
  it('aceita telefone com DDD e 10+ dígitos numéricos', () => {
    expect(validadores.telefone('(11) 91234-5678')).toBe(true);
    expect(validadores.telefone('11912345678')).toBe(true);
    expect(validadores.telefone('(31) 3456-7890')).toBe(true);
  });

  it('rejeita telefone com menos de 10 dígitos', () => {
    expect(typeof validadores.telefone('123456789')).toBe('string');
  });

  it('rejeita telefone vazio', () => {
    expect(typeof validadores.telefone('')).toBe('string');
  });

  it('rejeita telefone com apenas letras/símbolos', () => {
    expect(typeof validadores.telefone('abcdefghij')).toBe('string');
  });
});

// ============================================================
// validadores.assunto
// ============================================================
describe('validadores.assunto', () => {
  it('aceita assunto com 3 ou mais caracteres', () => {
    expect(validadores.assunto('Adoção')).toBe(true);
    expect(validadores.assunto('Dúvida sobre o processo')).toBe(true);
  });

  it('rejeita assunto com menos de 3 caracteres', () => {
    expect(typeof validadores.assunto('Oi')).toBe('string');
  });

  it('rejeita assunto vazio', () => {
    expect(typeof validadores.assunto('')).toBe('string');
  });

  it('rejeita assunto só com espaços', () => {
    expect(typeof validadores.assunto('  ')).toBe('string');
  });
});

// ============================================================
// validadores.mensagem
// ============================================================
describe('validadores.mensagem', () => {
  it('aceita mensagem com 10 ou mais caracteres', () => {
    expect(validadores.mensagem('Olá, gostaria de adotar um pet.')).toBe(true);
    expect(validadores.mensagem('1234567890')).toBe(true);
  });

  it('rejeita mensagem com menos de 10 caracteres', () => {
    expect(typeof validadores.mensagem('Oi!')).toBe('string');
  });

  it('rejeita mensagem vazia', () => {
    expect(typeof validadores.mensagem('')).toBe('string');
  });

  it('rejeita mensagem só com espaços', () => {
    expect(typeof validadores.mensagem('   ')).toBe('string');
  });
});

// ============================================================
// validadores.senha
// ============================================================
describe('validadores.senha', () => {
  it('aceita senha válida com letras e números', () => {
    expect(validadores.senha('Senha123')).toBe(true);
    expect(validadores.senha('abc12345')).toBe(true);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const resultado = validadores.senha('abc123');
    expect(typeof resultado).toBe('string');
  });

  it('rejeita senha sem letras', () => {
    expect(typeof validadores.senha('12345678')).toBe('string');
  });

  it('rejeita senha sem números', () => {
    expect(typeof validadores.senha('abcdefgh')).toBe('string');
  });

  it('rejeita senha vazia', () => {
    expect(typeof validadores.senha('')).toBe('string');
  });
});

// ============================================================
// validadores.senhaConfirmar
// ============================================================
describe('validadores.senhaConfirmar', () => {
  it('aceita quando confirmação coincide com a senha original', () => {
    const form = criarFormulario([
      { name: 'senha', value: 'Senha123' },
    ]);
    const confirmar = criarInput({ name: 'senhaConfirmar', value: 'Senha123', form });
    expect(validadores.senhaConfirmar('Senha123', confirmar)).toBe(true);
  });

  it('rejeita quando confirmação não coincide', () => {
    const form = criarFormulario([
      { name: 'senha', value: 'Senha123' },
    ]);
    const confirmar = criarInput({ name: 'senhaConfirmar', value: 'Outra456', form });
    expect(typeof validadores.senhaConfirmar('Outra456', confirmar)).toBe('string');
  });

  it('rejeita quando confirmação está vazia', () => {
    const form = criarFormulario([{ name: 'senha', value: 'Senha123' }]);
    const confirmar = criarInput({ name: 'senhaConfirmar', value: '', form });
    expect(typeof validadores.senhaConfirmar('', confirmar)).toBe('string');
  });
});

// ============================================================
// validadores.consentimento
// ============================================================
describe('validadores.consentimento', () => {
  it('aceita quando checkbox está marcado', () => {
    const campo = criarInput({ name: 'consentimento', type: 'checkbox', checked: true });
    expect(validadores.consentimento(true, campo)).toBe(true);
  });

  it('rejeita quando checkbox não está marcado', () => {
    const campo = criarInput({ name: 'consentimento', type: 'checkbox', checked: false });
    expect(typeof validadores.consentimento(false, campo)).toBe('string');
  });
});

// ============================================================
// validadores.termos
// ============================================================
describe('validadores.termos', () => {
  it('aceita quando checkbox está marcado', () => {
    const campo = criarInput({ name: 'termos', type: 'checkbox', checked: true });
    expect(validadores.termos(true, campo)).toBe(true);
  });

  it('rejeita quando checkbox não está marcado', () => {
    const campo = criarInput({ name: 'termos', type: 'checkbox', checked: false });
    expect(typeof validadores.termos(false, campo)).toBe('string');
  });
});

// ============================================================
// validarCampo
// ============================================================
describe('validarCampo', () => {
  it('retorna true e remove aria-invalid para campo válido', () => {
    const form = criarFormulario([{ name: 'nome', value: 'João Silva' }]);
    const campo = form.elements['nome'];
    const resultado = validarCampo(form, campo);
    expect(resultado).toBe(true);
    expect(campo.getAttribute('aria-invalid')).toBeNull();
  });

  it('retorna false e define aria-invalid para campo inválido', () => {
    const form = criarFormulario([{ name: 'email', value: 'invalido' }]);
    const campo = form.elements['email'];
    const resultado = validarCampo(form, campo);
    expect(resultado).toBe(false);
    expect(campo.getAttribute('aria-invalid')).toBe('true');
  });

  it('preenche o elemento de erro com a mensagem', () => {
    const form = criarFormulario([{ name: 'nome', value: 'A' }]);
    const campo = form.elements['nome'];
    validarCampo(form, campo);
    const erroEl = form.querySelector('[data-erro="nome"]');
    expect(erroEl.textContent.length).toBeGreaterThan(0);
  });

  it('limpa o elemento de erro para campo válido', () => {
    const form = criarFormulario([{ name: 'nome', value: '' }]);
    const campo = form.elements['nome'];
    validarCampo(form, campo); // primeira vez: inválido

    campo.value = 'João Silva';
    validarCampo(form, campo); // segunda vez: válido

    const erroEl = form.querySelector('[data-erro="nome"]');
    expect(erroEl.textContent).toBe('');
  });

  it('retorna true para campo sem validador definido', () => {
    const form = criarFormulario([{ name: 'campoSemValidador', value: '' }]);
    const campo = form.elements['campoSemValidador'];
    expect(validarCampo(form, campo)).toBe(true);
  });
});

// ============================================================
// validarFormulario
// ============================================================
describe('validarFormulario', () => {
  it('retorna ok=true quando todos os campos são válidos', () => {
    const form = criarFormulario([
      { name: 'nome', value: 'Maria Costa' },
      { name: 'email', value: 'maria@email.com' },
    ]);
    const { ok, primeiroInvalido } = validarFormulario(form, ['nome', 'email']);
    expect(ok).toBe(true);
    expect(primeiroInvalido).toBeNull();
  });

  it('retorna ok=false e primeiroInvalido quando há campo inválido', () => {
    const form = criarFormulario([
      { name: 'nome', value: '' },
      { name: 'email', value: 'usuario@email.com' },
    ]);
    const { ok, primeiroInvalido } = validarFormulario(form, ['nome', 'email']);
    expect(ok).toBe(false);
    expect(primeiroInvalido).not.toBeNull();
    expect(primeiroInvalido.name).toBe('nome');
  });

  it('identifica o PRIMEIRO campo inválido corretamente', () => {
    const form = criarFormulario([
      { name: 'nome', value: '' },
      { name: 'email', value: 'invalido' },
    ]);
    const { primeiroInvalido } = validarFormulario(form, ['nome', 'email']);
    expect(primeiroInvalido.name).toBe('nome');
  });

  it('ignora campos que não existem no formulário', () => {
    const form = criarFormulario([{ name: 'nome', value: 'Carlos Lima' }]);
    const { ok } = validarFormulario(form, ['nome', 'campoInexistente']);
    expect(ok).toBe(true);
  });

  it('valida formulário com vários campos inválidos e retorna o primeiro', () => {
    const form = criarFormulario([
      { name: 'nome', value: 'A' },
      { name: 'email', value: '' },
      { name: 'mensagem', value: 'curta' },
    ]);
    const { ok, primeiroInvalido } = validarFormulario(form, ['nome', 'email', 'mensagem']);
    expect(ok).toBe(false);
    expect(primeiroInvalido.name).toBe('nome');
  });
});
