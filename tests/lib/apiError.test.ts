import { describe, it, expect } from 'vitest';
import { getApiErrorMessage, isCaptchaChallenge } from '@/lib/apiError';

describe('getApiErrorMessage', () => {
  it('returns the detail message from an axios-like error response', () => {
    const err = { response: { data: { detail: 'Неверный логин или пароль' } } };
    expect(getApiErrorMessage(err, 'Ошибка')).toBe('Неверный логин или пароль');
  });

  it('returns the error field when detail is absent', () => {
    const err = { response: { data: { error: 'Вы не прошли капчу' } } };
    expect(getApiErrorMessage(err, 'Ошибка')).toBe('Вы не прошли капчу');
  });

  it('returns the error_title field when both are absent', () => {
    const err = { response: { data: { error_title: 'Ошибка капчи' } } };
    expect(getApiErrorMessage(err, 'Ошибка')).toBe('Ошибка капчи');
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

describe('isCaptchaChallenge', () => {
  it('detects an HTTP 420 response', () => {
    expect(isCaptchaChallenge({ response: { status: 420, data: {} } })).toBe(true);
  });

  it('detects the captcha error_code 5', () => {
    expect(isCaptchaChallenge({ response: { status: 400, data: { error_code: 5 } } })).toBe(true);
  });

  it('detects the captcha error_code when it arrives as a string', () => {
    expect(isCaptchaChallenge({ response: { status: 400, data: { error_code: '5' } } })).toBe(true);
  });

  it('is false for other errors', () => {
    expect(isCaptchaChallenge({ response: { status: 400, data: { error_code: 7 } } })).toBe(false);
    expect(isCaptchaChallenge({ response: { status: 500, data: {} } })).toBe(false);
    expect(isCaptchaChallenge(new Error('network down'))).toBe(false);
    expect(isCaptchaChallenge(null)).toBe(false);
  });
});
