import { isValidCnpj } from './cnpj.validator';

describe('isValidCnpj', () => {
  it('aceita CNPJ válido', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('19131243000197')).toBe(true);
  });

  it('rejeita CNPJ inválido', () => {
    expect(isValidCnpj('11111111111111')).toBe(false);
    expect(isValidCnpj('123')).toBe(false);
  });
});
