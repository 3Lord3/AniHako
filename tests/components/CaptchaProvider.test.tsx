import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { CaptchaProvider } from '@/components/CaptchaProvider';
import { hasCaptchaSolver, requestCaptchaToken } from '@/lib/captcha';
import type { HCaptcha } from '@/lib/hCaptcha';

vi.mock('@/lib/hCaptcha', async () => {
  const actual = await vi.importActual<typeof import('@/lib/hCaptcha')>('@/lib/hCaptcha');
  return {
    getHCaptchaErrorMessage: actual.getHCaptchaErrorMessage,
    getUnsupportedHostMessage: vi.fn(() => null),
    loadHCaptcha: vi.fn(),
    resetHCaptcha: vi.fn(),
    removeHCaptcha: vi.fn(),
    getHCaptchaTheme: vi.fn(() => 'light'),
    HCAPTCHA_SITE_KEY: 'b1847961-208e-4a90-9671-1e6bba9e0b36',
  };
});

import {
  getUnsupportedHostMessage,
  loadHCaptcha,
  removeHCaptcha,
  resetHCaptcha,
} from '@/lib/hCaptcha';

const fakeHCaptcha = {
  render: vi.fn(() => 7),
  reset: vi.fn(),
  remove: vi.fn(),
  getResponse: vi.fn(() => ''),
  execute: vi.fn(),
} as unknown as HCaptcha;

const SITE_KEY = 'b1847961-208e-4a90-9671-1e6bba9e0b36';

function Host() {
  const [status, setStatus] = useState('idle');
  return (
    <div>
      <button
        onClick={() => {
          setStatus('pending');
          requestCaptchaToken()
            .then((token) => setStatus(`ok:${token}`))
            .catch((err: Error) => setStatus(`err:${err.message}`));
        }}
      >
        request
      </button>
      <span data-testid="status">{status}</span>
    </div>
  );
}

function DualHost() {
  const [results, setResults] = useState<string[]>([]);
  return (
    <div>
      <button
        onClick={() => {
          for (const id of [1, 2]) {
            requestCaptchaToken()
              .then((token) => setResults((r) => [...r, `ok${id}:${token}`]))
              .catch((err: Error) => setResults((r) => [...r, `err${id}:${err.message}`]));
          }
        }}
      >
        fire two
      </button>
      <span data-testid="results">{results.join(',')}</span>
    </div>
  );
}

function renderProvider() {
  return render(
    <CaptchaProvider>
      <Host />
    </CaptchaProvider>
  );
}

function captchaParams() {
  return fakeHCaptcha.render.mock.calls[0]?.[1] as {
    sitekey: string;
    theme: string;
    callback: (token: string) => void;
    'error-callback'?: (code?: string) => void;
    'chalexpired-callback'?: () => void;
    'expired-callback'?: () => void;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getUnsupportedHostMessage).mockReturnValue(null);
  vi.mocked(loadHCaptcha).mockResolvedValue(fakeHCaptcha);
});

describe('CaptchaProvider', () => {
  it('registers the solver on mount and unregisters on unmount', () => {
    const { unmount } = render(
      <CaptchaProvider>
        <div />
      </CaptchaProvider>
    );
    expect(hasCaptchaSolver()).toBe(true);
    unmount();
    expect(hasCaptchaSolver()).toBe(false);
  });

  it('opens the dialog and renders the widget with the site key', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));

    await waitFor(() => expect(fakeHCaptcha.render).toHaveBeenCalledTimes(1));
    const params = captchaParams();
    expect(params.sitekey).toBe(SITE_KEY);
    expect(params.theme).toBe('light');
  });

  it('resolves the pending token when the user solves the captcha', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));
    await waitFor(() => expect(fakeHCaptcha.render).toHaveBeenCalledTimes(1));

    act(() => captchaParams().callback('solved-token'));

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('ok:solved-token')
    );
    await waitFor(() =>
      expect(screen.queryByTestId('hcaptcha-container')).not.toBeInTheDocument()
    );
  });

  it('rejects with CaptchaCancelledError when the user cancels', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));
    await screen.findByTestId('hcaptcha-container');

    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('err:Captcha was cancelled')
    );
    await waitFor(() =>
      expect(screen.queryByTestId('hcaptcha-container')).not.toBeInTheDocument()
    );
  });

  it('resolves every pending solver when the captcha is solved once', async () => {
    const user = userEvent.setup();
    render(
      <CaptchaProvider>
        <DualHost />
      </CaptchaProvider>
    );

    await user.click(screen.getByRole('button', { name: 'fire two' }));
    await waitFor(() => expect(fakeHCaptcha.render).toHaveBeenCalledTimes(1));

    act(() => captchaParams().callback('solved-token'));

    await waitFor(() =>
      expect(screen.getByTestId('results')).toHaveTextContent('ok1:solved-token,ok2:solved-token')
    );
  });

  it('rejects every pending solver when the captcha is cancelled', async () => {
    const user = userEvent.setup();
    render(
      <CaptchaProvider>
        <DualHost />
      </CaptchaProvider>
    );

    await user.click(screen.getByRole('button', { name: 'fire two' }));
    await screen.findByTestId('hcaptcha-container');

    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    await waitFor(() =>
      expect(screen.getByTestId('results')).toHaveTextContent(
        'err1:Captcha was cancelled,err2:Captcha was cancelled'
      )
    );
  });

  it('rejects and closes the dialog when the widget fails to load', async () => {
    vi.mocked(loadHCaptcha).mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('err:network down')
    );
    await waitFor(() =>
      expect(screen.queryByTestId('hcaptcha-container')).not.toBeInTheDocument()
    );
  });

  it('removes the previous widget before rendering a new one', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));
    await waitFor(() => expect(fakeHCaptcha.render).toHaveBeenCalledTimes(1));
    act(() => captchaParams().callback('token'));
    await waitFor(() =>
      expect(screen.queryByTestId('hcaptcha-container')).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'request' }));
    await waitFor(() => expect(fakeHCaptcha.render).toHaveBeenCalledTimes(2));
    expect(removeHCaptcha).toHaveBeenCalledWith(7);
  });

  it('recovers the widget in place when the captcha errors', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));
    await waitFor(() => expect(fakeHCaptcha.render).toHaveBeenCalledTimes(1));

    act(() => captchaParams()['error-callback']?.());

    expect(
      screen.getByText('Не удалось проверить капчу. Попробуйте ещё раз.')
    ).toBeInTheDocument();
    expect(loadHCaptcha).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(resetHCaptcha).toHaveBeenCalledWith(7));
    // The widget is reset, never destroyed and re-rendered underneath an open
    // challenge — that teardown is what made the first solve fail instantly.
    expect(fakeHCaptcha.render).toHaveBeenCalledTimes(1);
    expect(removeHCaptcha).not.toHaveBeenCalled();
  });

  it('explains an unsupported host instead of rendering a doomed widget', async () => {
    vi.mocked(getUnsupportedHostMessage).mockReturnValue(
      'hCaptcha не поддерживает хост localhost. Откройте http://127.0.0.1:5173.'
    );
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'request' }));

    await screen.findByText(/не поддерживает хост localhost/);
    expect(loadHCaptcha).not.toHaveBeenCalled();
    expect(fakeHCaptcha.render).not.toHaveBeenCalled();
  });
});