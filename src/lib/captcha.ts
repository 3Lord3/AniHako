export class CaptchaError extends Error {
  constructor(message = 'Captcha is not available') {
    super(message);
    this.name = 'CaptchaError';
  }
}

export class CaptchaCancelledError extends Error {
  constructor() {
    super('Captcha was cancelled');
    this.name = 'CaptchaCancelledError';
  }
}

type CaptchaSolver = () => Promise<string>;

let solver: CaptchaSolver | null = null;

/**
 * Registers the active captcha solver (implemented by <CaptchaProvider>).
 * Returns an unsubscribe function.
 */
export function registerCaptchaSolver(fn: CaptchaSolver): () => void {
  solver = fn;
  return () => {
    if (solver === fn) solver = null;
  };
}

export function hasCaptchaSolver(): boolean {
  return solver !== null;
}

/**
 * Requests a captcha token from the UI. Resolves with the hCaptcha response
 * token once the user solves the challenge, rejects when the widget is not
 * available or the user cancels.
 */
export function requestCaptchaToken(): Promise<string> {
  if (!solver) {
    return Promise.reject(new CaptchaError());
  }
  return solver();
}