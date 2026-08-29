import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { CaptchaField } from '@/components/CaptchaField';

vi.mock('@/lib/hCaptcha', async () => {
  const actual = await vi.importActual<typeof import('@/lib/hCaptcha')>('@/lib/hCaptcha');
  return {
    HCaptchaHostError: actual.HCaptchaHostError,
    getHCaptchaErrorMessage: actual.getHCaptchaErrorMessage,
    renderHCaptcha: vi.fn(),
    resetHCaptcha: vi.fn(),
    removeHCaptcha: vi.fn(),
    getHCaptchaTheme: vi.fn(() => 'light'),
    HCAPTCHA_SITE_KEY: 'test-site-key',
  };
});

import { HCaptchaHostError, renderHCaptcha, removeHCaptcha, resetHCaptcha } from '@/lib/hCaptcha';

const onSolved = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(renderHCaptcha).mockResolvedValue(5);
});

describe('CaptchaField', () => {
  it('renders the widget into the container with the site key', async () => {
    render(<CaptchaField onSolved={onSolved} />);

    await waitFor(() => expect(renderHCaptcha).toHaveBeenCalledTimes(1));
    const [container, params] = renderHCaptcha.mock.calls[0];
    expect(container).toBeInstanceOf(HTMLElement);
    expect(params.sitekey).toBe('test-site-key');
    expect(params.theme).toBe('light');
  });

  it('calls onSolved when the widget callback fires', async () => {
    render(<CaptchaField onSolved={onSolved} />);

    await waitFor(() => expect(renderHCaptcha).toHaveBeenCalledTimes(1));
    const params = renderHCaptcha.mock.calls[0][1];
    act(() => params.callback('token-xyz'));

    expect(onSolved).toHaveBeenCalledWith('token-xyz');
  });

  it('shows an error message when the widget fails to load', async () => {
    vi.mocked(renderHCaptcha).mockRejectedValue(new Error('network down'));
    render(<CaptchaField onSolved={onSolved} />);

    await waitFor(() =>
      expect(screen.getByText(/Не удалось загрузить капчу/)).toBeInTheDocument()
    );
  });

  it('explains an unsupported host instead of a generic load failure', async () => {
    vi.mocked(renderHCaptcha).mockRejectedValue(
      new HCaptchaHostError('hCaptcha не поддерживает хост localhost. Откройте http://127.0.0.1:5173.')
    );
    render(<CaptchaField onSolved={onSolved} />);

    await waitFor(() =>
      expect(screen.getByText(/не поддерживает хост localhost/)).toBeInTheDocument()
    );
  });

  it('says nothing when the user simply closes the challenge window', async () => {
    render(<CaptchaField onSolved={onSolved} />);
    await waitFor(() => expect(renderHCaptcha).toHaveBeenCalledTimes(1));

    act(() => renderHCaptcha.mock.calls[0][1]['error-callback']('challenge-closed'));

    expect(screen.queryByText(/капч/i)).not.toBeInTheDocument();
  });

  it('recovers in place instead of re-rendering when the challenge errors', async () => {
    vi.useFakeTimers();
    try {
      render(<CaptchaField onSolved={onSolved} />);
      await vi.waitFor(() => expect(renderHCaptcha).toHaveBeenCalledTimes(1));
      const params = renderHCaptcha.mock.calls[0][1];

      act(() => params['error-callback']('rate-limited'));
      expect(screen.getByText(/Слишком много попыток/)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      // The widget is reset in place; tearing the container down and rendering
      // a second widget is what broke the first solve attempt.
      expect(resetHCaptcha).toHaveBeenCalledWith(5);
      expect(renderHCaptcha).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('removes the widget on unmount', async () => {
    const { unmount } = render(<CaptchaField onSolved={onSolved} />);
    await waitFor(() => expect(renderHCaptcha).toHaveBeenCalledTimes(1));

    unmount();
    expect(removeHCaptcha).toHaveBeenCalledWith(5);
  });
});