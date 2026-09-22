import { describe, it, expect } from 'vitest';
import { validateRegisterForm, type RegisterFormValues } from '@/lib/authValidation';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

const valid: RegisterFormValues = {
  password: 'secret1',
  confirmPassword: 'secret1',
  username: 'user',
  acceptRules: true,
  acceptPrivacy: true,
};

describe('validateRegisterForm', () => {
  it('returns empty string when all fields are valid', () => {
    expect(validateRegisterForm(valid, t)).toBe('');
  });

  it('rejects mismatched passwords', () => {
    expect(validateRegisterForm({ ...valid, confirmPassword: 'other' }, t)).toBe('Пароли не совпадают');
  });

  it('rejects short passwords', () => {
    expect(validateRegisterForm({ ...valid, password: '123', confirmPassword: '123' }, t)).toBe(
      'Пароль должен быть не менее 6 символов'
    );
  });

  it('rejects short usernames', () => {
    expect(validateRegisterForm({ ...valid, username: 'ab' }, t)).toBe(
      'Имя пользователя должно быть не менее 3 символов'
    );
  });

  it('requires accepting the rules', () => {
    expect(validateRegisterForm({ ...valid, acceptRules: false }, t)).toBe(
      'Необходимо принять правила сайта и политику конфиденциальности'
    );
  });

  it('requires accepting the privacy policy', () => {
    expect(validateRegisterForm({ ...valid, acceptPrivacy: false }, t)).toBe(
      'Необходимо принять правила сайта и политику конфиденциальности'
    );
  });
});
