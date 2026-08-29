import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import { api } from '@/api/index';

vi.mock('@/lib/captcha', () => ({
  requestCaptchaToken: vi.fn(),
}));

import { requestCaptchaToken } from '@/lib/captcha';

describe('api 420 captcha interceptor', () => {
  const calls: InternalAxiosRequestConfig[] = [];
  const mockAdapter = vi.fn();

  beforeEach(() => {
    calls.length = 0;
    mockAdapter.mockReset();
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) => {
      calls.push(config);
      if (config.__captchaRetried) {
        return Promise.resolve({
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      }
      return Promise.reject({
        config,
        response: {
          status: 420,
          statusText: 'Captcha error',
          data: { error_name: 'CaptchaError' },
          headers: {},
        },
      });
    });
    api.defaults.adapter = mockAdapter;
  });

  afterEach(() => {
    delete api.defaults.adapter;
    vi.clearAllMocks();
  });

  it('does not auto-retry the login endpoint (handled inline by the login form)', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');

    const err = await api
      .post('/profile/login', { login: 'a@b.c', password: 'secret', need_json: true })
      .catch((e: unknown) => e);

    expect(requestCaptchaToken).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
    expect((err as { response: { status: number } }).response.status).toBe(420);
  });

  it('repeats a password reset POST with the token under recaptcha_response on 420', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');

    const response = await api.post('/profile/reset-password', { email: 'a@b.c' });

    expect(requestCaptchaToken).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(2);
    expect(JSON.parse(calls[1].data as string)).toEqual({
      email: 'a@b.c',
      recaptcha_response: 'captcha-token',
    });
    expect(response.data).toEqual({ ok: true });
  });

  it('repeats a registration POST with the token under g-recaptcha-response on 420', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');

    const response = await api.post('/users', {
      email: 'a@b.c',
      nickname: 'user',
      password: 'secret',
    });

    expect(JSON.parse(calls[1].data as string)).toEqual({
      email: 'a@b.c',
      nickname: 'user',
      password: 'secret',
      'g-recaptcha-response': 'captcha-token',
    });
    expect(response.data).toEqual({ ok: true });
  });

  it('repeats the request when the captcha challenge arrives as error_code 5', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) => {
      calls.push(config);
      if (config.__captchaRetried) {
        return Promise.resolve({
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      }
      return Promise.reject({
        config,
        response: { status: 400, statusText: 'Bad request', data: { error_code: 5 }, headers: {} },
      });
    });

    const response = await api.post('/users', { email: 'a@b.c' });

    expect(requestCaptchaToken).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(2);
    expect(JSON.parse(calls[1].data as string)).toEqual({
      email: 'a@b.c',
      'g-recaptcha-response': 'captcha-token',
    });
    expect(response.data).toEqual({ ok: true });
  });

  it('does not retry GET requests on 420', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');

    const err = await api.get('/anime').catch((e: unknown) => e);

    expect(requestCaptchaToken).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
    expect((err as { response: { status: number } }).response.status).toBe(420);
  });

  it('rejects with the original error when the user dismisses the captcha', async () => {
    const originalError = {
      config: {} as InternalAxiosRequestConfig,
      response: { status: 420, statusText: 'Captcha error', data: { error_name: 'CaptchaError' }, headers: {} },
    };
    vi.mocked(requestCaptchaToken).mockRejectedValue(new Error('cancelled'));
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) => {
      calls.push(config);
      originalError.config = config;
      return Promise.reject(originalError);
    });

    const err = await api.post('/users', { email: 'a@b.c' }).catch((e: unknown) => e);

    expect(requestCaptchaToken).toHaveBeenCalledTimes(1);
    expect(err).toBe(originalError);
    expect((err as { response: { status: number } }).response.status).toBe(420);
  });

  it('does not loop forever when the retried request also fails with 420', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) => {
      calls.push(config);
      return Promise.reject({
        config,
        response: { status: 420, statusText: 'Captcha error', data: {}, headers: {} },
      });
    });

    const err = await api.post('/users', { email: 'a@b.c', password: 'b' }).catch((e: unknown) => e);

    expect(requestCaptchaToken).toHaveBeenCalledTimes(2);
    expect(calls).toHaveLength(3);
    expect((err as { response: { status: number } }).response.status).toBe(420);
  });

  it('does not retry when the body cannot carry a captcha field', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');

    const err = await api.post('/users', 'raw non-json body').catch((e: unknown) => e);

    expect(requestCaptchaToken).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
    expect((err as { response: { status: number } }).response.status).toBe(420);
  });

  it('does not treat a sub-path of the login endpoint as the login endpoint', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');

    await api.post('/profile/login/anything', { foo: 'bar' });

    expect(requestCaptchaToken).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(2);
    expect(JSON.parse(calls[1].data as string)).toEqual({
      foo: 'bar',
      'g-recaptcha-response': 'captcha-token',
    });
  });

  it('passes non-420 errors through untouched', async () => {
    vi.mocked(requestCaptchaToken).mockResolvedValue('captcha-token');
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) => {
      calls.push(config);
      return Promise.reject({
        config,
        response: { status: 500, statusText: 'Server error', data: {}, headers: {} },
      });
    });

    const err = await api.post('/users', { email: 'a@b.c' }).catch((e: unknown) => e);

    expect(requestCaptchaToken).not.toHaveBeenCalled();
    expect((err as { response: { status: number } }).response.status).toBe(500);
  });
});