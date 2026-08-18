import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '@/lib/apiError';

describe('getApiErrorMessage', () => {
  it('returns the detail message from an axios-like error response', () => {
    const err = { response: { data: { detail: 'Неверный логин или пароль' } } };
    expect(getApiErrorMessage(err, 'Ошибка')).toBe('Неверный логин или пароль');
  });

  it('falls back when detail is missing', () => {
    expect(getApiErrorMessage({ response: { data: {} } }, 'Ошибка входа')).toBe('Ошибка входа');
  });

  it('falls back when response is missing', () => {
    expect(getApiErrorMessage({}, 'Ошибка входа')).toBe('Ошибка входа');
  });

  it('falls back for non-object errors', () => {
    expect(getApiErrorMessage(new Error('network down'), 'Ошибка входа')).toBe('Ошибка входа');
    expect(getApiErrorMessage(null, 'Ошибка входа')).toBe('Ошибка входа');
  });
});
