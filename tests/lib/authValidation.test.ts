import { describe, it, expect } from 'vitest';
import { validateRegisterForm, type RegisterFormValues } from '@/lib/authValidation';

const valid: RegisterFormValues = {
  password: 'secret1',
  confirmPassword: 'secret1',
  username: 'user',
  acceptRules: true,
  acceptPrivacy: true,
};

describe('validateRegisterForm', () => {
  it('returns empty string when all fields are valid', () => {
    expect(validateRegisterForm(valid)).toBe('');
  });

  it('rejects mismatched passwords', () => {
    expect(validateRegisterForm({ ...valid, confirmPassword: 'other' })).toBe('Пароли не совпадают');
  });

  it('rejects short passwords', () => {
    expect(validateRegisterForm({ ...valid, password: '123', confirmPassword: '123' })).toBe(
      'Пароль должен быть не менее 6 символов'
    );
  });

  it('rejects short usernames', () => {
    expect(validateRegisterForm({ ...valid, username: 'ab' })).toBe(
      'Имя пользователя должно быть не менее 3 символов'
    );
  });

  it('requires accepting the rules', () => {
    expect(validateRegisterForm({ ...valid, acceptRules: false })).toBe(
      'Необходимо принять правила сайта и политику конфиденциальности'
    );
  });

  it('requires accepting the privacy policy', () => {
    expect(validateRegisterForm({ ...valid, acceptPrivacy: false })).toBe(
      'Необходимо принять правила сайта и политику конфиденциальности'
    );
  });
});
