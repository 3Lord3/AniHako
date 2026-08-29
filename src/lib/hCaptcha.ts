// `render=explicit` keeps hCaptcha from auto-rendering anything, `onload`
// gives us the documented "API is ready" signal (the `hcaptcha` global is
// assigned slightly before the API finishes booting, and rendering into that
// window produces widgets that fail as soon as they are clicked), and
// `recaptchacompat=off` stops hCaptcha from installing its `grecaptcha` shim.
const H_CAPTCHA_ONLOAD_CALLBACK = '__anihakoHCaptchaOnLoad';
const H_CAPTCHA_API_URL =
  `https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=${H_CAPTCHA_ONLOAD_CALLBACK}`;
const H_CAPTCHA_INIT_TIMEOUT_MS = 15_000;

export const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || 'b1847961-208e-4a90-9671-1e6bba9e0b36';

export class HCaptchaHostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HCaptchaHostError';
  }
}

/**
 * hCaptcha refuses to serve a challenge on the literal hostname `localhost`:
 * its `checksiteconfig` endpoint answers "Invalid Data" for every sitekey
 * there. The widget still renders, so the failure only shows up as an instant
 * `error-callback` the moment the user clicks the checkbox. Every other host
 * works, including 127.0.0.1 — which is why the dev server binds to that.
 *
 * Returns an explanation when the current host cannot work, `null` otherwise.
 */
export function getUnsupportedHostMessage(): string | null {
  const { hostname, protocol, port } = window.location;
  if (hostname.toLowerCase() !== 'localhost') return null;
  const url = `${protocol}//127.0.0.1${port ? `:${port}` : ''}`;
  return `hCaptcha не поддерживает хост localhost. Откройте приложение по адресу ${url}.`;
}

/**
 * Turns an hCaptcha `error-callback` code into a message for the user.
 * Returns `null` for codes that are not failures (the user simply closed the
 * challenge window), so nothing is shown in that case.
 */
export function getHCaptchaErrorMessage(code?: string): string | null {
  switch (code) {
    case 'challenge-closed':
      return null;
    case 'rate-limited':
      return 'Слишком много попыток. Подождите немного и попробуйте снова.';
    case 'network-error':
      return 'Нет связи с сервисом капчи. Проверьте подключение.';
    case 'invalid-data':
    case 'missing-captcha':
    case 'invalid-captcha-id':
      return 'Капча недоступна на этом домене.';
    default:
      return 'Не удалось проверить капчу. Попробуйте ещё раз.';
  }
}

export function getHCaptchaTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export interface HCaptcha {
  render: (container: HTMLElement | string, params: HCaptchaRenderParams) => number;
  reset: (widgetId: number) => void;
  remove?: (widgetId: number) => void;
  getResponse: (widgetId: number) => string;
  execute: (widgetId: number) => void;
}

export interface HCaptchaRenderParams {
  sitekey: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
  callback?: (token: string) => void;
  'open-callback'?: () => void;
  'close-callback'?: () => void;
  'error-callback'?: (error?: string) => void;
  /** The challenge timed out before the user completed it. */
  'chalexpired-callback'?: () => void;
  /** A solved token expired and can no longer be submitted. */
  'expired-callback'?: () => void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptcha;
    [H_CAPTCHA_ONLOAD_CALLBACK]?: () => void;
  }
}

let loadPromise: Promise<HCaptcha> | null = null;

/**
 * Loads the hCaptcha script once and resolves with the `hcaptcha` global.
 * Rejects if the script fails to load or never becomes available.
 */
export function loadHCaptcha(): Promise<HCaptcha> {
  if (loadPromise) return loadPromise;
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);

  loadPromise = new Promise<HCaptcha>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = H_CAPTCHA_API_URL;
    script.async = true;
    script.defer = true;

    let settled = false;
    const cleanup = () => {
      settled = true;
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
      delete window[H_CAPTCHA_ONLOAD_CALLBACK];
    };
    const succeed = (hcaptcha: HCaptcha) => {
      if (settled) return;
      cleanup();
      resolve(hcaptcha);
    };
    const fail = (message: string) => {
      if (settled) return;
      cleanup();
      loadPromise = null;
      reject(new Error(message));
    };

    // api.js is a bootstrapper: its `load` event fires while the API is still
    // starting up, so waiting for the `onload` callback is what actually tells
    // us `hcaptcha.render()` is safe to call. Poll for the global as a fallback
    // in case the callback never arrives.
    const onScriptLoad = () => {
      const startedAt = Date.now();
      const tick = () => {
        if (settled) return;
        if (window.hcaptcha) {
          succeed(window.hcaptcha);
          return;
        }
        if (Date.now() - startedAt > H_CAPTCHA_INIT_TIMEOUT_MS) {
          fail('HCaptcha did not initialize in time');
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    };
    const onScriptError = () => fail('Failed to load HCaptcha script');

    window[H_CAPTCHA_ONLOAD_CALLBACK] = () => {
      if (window.hcaptcha) succeed(window.hcaptcha);
    };
    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);
    document.head.appendChild(script);
  });

  return loadPromise;
}

// hCaptcha binds a widget to the DOM node it was rendered into and keeps that
// binding until the widget is removed. Rendering twice into the same node —
// which React does on every StrictMode mount, since effects run twice — leaves
// two widgets fighting over one element, and the challenge then errors out the
// moment the user clicks the checkbox. Track what we rendered where so a
// second render replaces the first instead of stacking on top of it.
const widgetsByContainer = new WeakMap<HTMLElement, number>();

/**
 * Explicitly renders an hCaptcha widget inside `container`, replacing any
 * widget previously rendered into the same element.
 */
export async function renderHCaptcha(
  container: HTMLElement,
  params: HCaptchaRenderParams
): Promise<number> {
  const unsupportedHost = getUnsupportedHostMessage();
  if (unsupportedHost) throw new HCaptchaHostError(unsupportedHost);

  const hcaptcha = await loadHCaptcha();

  const previous = widgetsByContainer.get(container);
  if (previous !== undefined) {
    widgetsByContainer.delete(container);
    removeHCaptcha(previous);
  }
  container.replaceChildren();

  const widgetId = hcaptcha.render(container, params);
  widgetsByContainer.set(container, widgetId);
  return widgetId;
}

/**
 * Returns an existing widget to its initial (unchecked) state without touching
 * the DOM, so the user can retry in place after a failed challenge.
 */
export function resetHCaptcha(widgetId: number): void {
  try {
    window.hcaptcha?.reset(widgetId);
  } catch {
    // ignore reset failures
  }
}

/**
 * Destroys a widget and releases the DOM node it owned. Use this — not
 * `resetHCaptcha` — when the widget is going away for good, otherwise hCaptcha
 * keeps the dead widget registered against a detached element.
 */
export function removeHCaptcha(widgetId: number): void {
  try {
    const hcaptcha = window.hcaptcha;
    if (hcaptcha?.remove) {
      hcaptcha.remove(widgetId);
    } else {
      hcaptcha?.reset(widgetId);
    }
  } catch {
    // ignore removal failures
  }
}
