import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { HCaptcha } from '@/lib/hCaptcha';

const fakeHCaptcha = {
  render: vi.fn(() => 42),
  reset: vi.fn(),
  remove: vi.fn(),
  getResponse: vi.fn(() => ''),
  execute: vi.fn(),
} as unknown as HCaptcha;

function hCaptchaScripts(): HTMLScriptElement[] {
  return Array.from(document.head.querySelectorAll('script[src*="hcaptcha"]'));
}

function setFakeGlobal() {
  window.hcaptcha = fakeHCaptcha;
}

// jsdom serves pages from `localhost`, which is the one hostname hCaptcha
// refuses to work on, so point the tests at a host that behaves like production.
function setHost(hostname: string, port = '5173') {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, hostname, protocol: 'http:', port },
  });
}

beforeEach(() => {
  setHost('127.0.0.1');
  vi.resetModules();
  delete (window as unknown as { hcaptcha?: unknown }).hcaptcha;
  hCaptchaScripts().forEach((script) => script.remove());
  vi.clearAllMocks();
});

afterEach(() => {
  delete (window as unknown as { hcaptcha?: unknown }).hcaptcha;
  hCaptchaScripts().forEach((script) => script.remove());
});

describe('loadHCaptcha', () => {
  it('resolves immediately when hcaptcha is already present', async () => {
    const { loadHCaptcha } = await import('@/lib/hCaptcha');
    setFakeGlobal();

    await expect(loadHCaptcha()).resolves.toBe(fakeHCaptcha);
    expect(hCaptchaScripts()).toHaveLength(0);
  });

  it('injects the script once and resolves with the global after load', async () => {
    const { loadHCaptcha } = await import('@/lib/hCaptcha');
    const promise = loadHCaptcha();
    const scripts = hCaptchaScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toContain('js.hcaptcha.com/1/api.js');
    expect(scripts[0].async).toBe(true);

    setFakeGlobal();
    scripts[0].dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBe(fakeHCaptcha);
    expect(hCaptchaScripts()).toHaveLength(1);
  });

  it('rejects when the script fails to load and allows a retry', async () => {
    const { loadHCaptcha } = await import('@/lib/hCaptcha');
    const promise = loadHCaptcha();
    hCaptchaScripts()[0].dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load HCaptcha script');

    // The cached rejected promise is dropped, so the next call retries.
    const retry = loadHCaptcha();
    expect(hCaptchaScripts()).toHaveLength(2);
    setFakeGlobal();
    hCaptchaScripts()[1].dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBe(fakeHCaptcha);
  });
});

describe('renderHCaptcha / resetHCaptcha / removeHCaptcha', () => {
  it('renders the widget into the container with provided params', async () => {
    const { renderHCaptcha } = await import('@/lib/hCaptcha');
    setFakeGlobal();
    const container = document.createElement('div');

    const widgetId = await renderHCaptcha(container, {
      sitekey: 'site-key',
      theme: 'dark',
      callback: vi.fn(),
      'error-callback': vi.fn(),
      'expired-callback': vi.fn(),
    });

    expect(widgetId).toBe(42);
    expect(fakeHCaptcha.render).toHaveBeenCalledWith(container, {
      sitekey: 'site-key',
      theme: 'dark',
      callback: expect.any(Function),
      'error-callback': expect.any(Function),
      'expired-callback': expect.any(Function),
    });
  });

  it('replaces a widget previously rendered into the same container', async () => {
    const { renderHCaptcha } = await import('@/lib/hCaptcha');
    setFakeGlobal();
    const container = document.createElement('div');
    const params = { sitekey: 'site-key' };

    vi.mocked(fakeHCaptcha.render).mockReturnValueOnce(1).mockReturnValueOnce(2);
    await renderHCaptcha(container, params);
    await renderHCaptcha(container, params);

    // The first widget is destroyed instead of being left bound to the node,
    // so only one widget ever owns the container.
    expect(fakeHCaptcha.remove).toHaveBeenCalledTimes(1);
    expect(fakeHCaptcha.remove).toHaveBeenCalledWith(1);
    expect(fakeHCaptcha.render).toHaveBeenCalledTimes(2);
  });

  it('resetHCaptcha resets the widget and tolerates a missing global', async () => {
    const { resetHCaptcha } = await import('@/lib/hCaptcha');

    resetHCaptcha(1);
    expect(fakeHCaptcha.reset).not.toHaveBeenCalled();

    setFakeGlobal();
    resetHCaptcha(1);
    expect(fakeHCaptcha.reset).toHaveBeenCalledWith(1);
  });

  it('removeHCaptcha destroys the widget and falls back to reset', async () => {
    const { removeHCaptcha } = await import('@/lib/hCaptcha');

    removeHCaptcha(3);
    expect(fakeHCaptcha.remove).not.toHaveBeenCalled();

    setFakeGlobal();
    removeHCaptcha(3);
    expect(fakeHCaptcha.remove).toHaveBeenCalledWith(3);

    window.hcaptcha = { ...fakeHCaptcha, remove: undefined } as unknown as HCaptcha;
    removeHCaptcha(4);
    expect(fakeHCaptcha.reset).toHaveBeenCalledWith(4);
  });
});
describe('getUnsupportedHostMessage', () => {
  it('flags `localhost`, which hCaptcha rejects for every sitekey', async () => {
    const { getUnsupportedHostMessage } = await import('@/lib/hCaptcha');
    setHost('localhost');
    expect(getUnsupportedHostMessage()).toContain('http://127.0.0.1:5173');
    setHost('LocalHost');
    expect(getUnsupportedHostMessage()).not.toBeNull();
  });

  it('accepts 127.0.0.1 and real hostnames', async () => {
    const { getUnsupportedHostMessage } = await import('@/lib/hCaptcha');
    setHost('127.0.0.1');
    expect(getUnsupportedHostMessage()).toBeNull();
    setHost('anihako.netlify.app');
    expect(getUnsupportedHostMessage()).toBeNull();
    setHost('app.localhost');
    expect(getUnsupportedHostMessage()).toBeNull();
  });

  it('renderHCaptcha refuses to render on an unsupported host', async () => {
    const { renderHCaptcha, HCaptchaHostError } = await import('@/lib/hCaptcha');
    setFakeGlobal();
    setHost('localhost');

    await expect(renderHCaptcha(document.createElement('div'), { sitekey: 'k' })).rejects.toBeInstanceOf(
      HCaptchaHostError
    );
    expect(fakeHCaptcha.render).not.toHaveBeenCalled();
  });
});

describe('getHCaptchaErrorMessage', () => {
  it('stays silent when the user just closes the challenge', async () => {
    const { getHCaptchaErrorMessage } = await import('@/lib/hCaptcha');
    expect(getHCaptchaErrorMessage('challenge-closed')).toBeNull();
  });

  it('explains the codes worth acting on', async () => {
    const { getHCaptchaErrorMessage } = await import('@/lib/hCaptcha');
    expect(getHCaptchaErrorMessage('rate-limited')).toMatch(/Слишком много попыток/);
    expect(getHCaptchaErrorMessage('network-error')).toMatch(/Нет связи/);
    expect(getHCaptchaErrorMessage('invalid-data')).toMatch(/недоступна на этом домене/);
    expect(getHCaptchaErrorMessage(undefined)).toMatch(/Попробуйте ещё раз/);
  });
});
