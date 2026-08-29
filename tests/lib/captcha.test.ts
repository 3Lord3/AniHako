import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  CaptchaCancelledError,
  CaptchaError,
  hasCaptchaSolver,
  registerCaptchaSolver,
  requestCaptchaToken,
} from '@/lib/captcha';

const unsubscribers: (() => void)[] = [];

afterEach(() => {
  for (let i = unsubscribers.length - 1; i >= 0; i -= 1) {
    unsubscribers[i]();
  }
  unsubscribers.length = 0;
});

describe('captcha bridge', () => {
  it('reports no solver by default', () => {
    expect(hasCaptchaSolver()).toBe(false);
  });

  it('registers and unregisters a solver', () => {
    const solver = vi.fn();
    const unsubscribe = registerCaptchaSolver(solver);
    unsubscribers.push(unsubscribe);

    expect(hasCaptchaSolver()).toBe(true);
    unsubscribe();
    expect(hasCaptchaSolver()).toBe(false);
  });

  it('requestCaptchaToken resolves with the token produced by the solver', async () => {
    const solver = vi.fn(() => Promise.resolve('token-123'));
    unsubscribers.push(registerCaptchaSolver(solver));

    await expect(requestCaptchaToken()).resolves.toBe('token-123');
    expect(solver).toHaveBeenCalledTimes(1);
  });

  it('requestCaptchaToken rejects with CaptchaError when no solver is registered', async () => {
    await expect(requestCaptchaToken()).rejects.toBeInstanceOf(CaptchaError);
  });

  it('propagates a rejection coming from the solver', async () => {
    const solver = vi.fn(() => Promise.reject(new CaptchaCancelledError()));
    unsubscribers.push(registerCaptchaSolver(solver));

    await expect(requestCaptchaToken()).rejects.toBeInstanceOf(CaptchaCancelledError);
  });

  it('replacing the solver makes the previous registration a no-op unsubscribe', () => {
    const first = vi.fn(() => Promise.resolve('a'));
    const second = vi.fn(() => Promise.resolve('b'));
    const unsubscribeFirst = registerCaptchaSolver(first);
    const unsubscribeSecond = registerCaptchaSolver(second);

    // Only the most recent solver is active; unsubscribing an older one is a no-op.
    unsubscribeFirst();
    expect(hasCaptchaSolver()).toBe(true);

    unsubscribeSecond();
    expect(hasCaptchaSolver()).toBe(false);
  });
});