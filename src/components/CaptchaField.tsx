import { useEffect, useRef, useState } from 'react';
import {
  getHCaptchaErrorMessage,
  getHCaptchaTheme,
  HCAPTCHA_SITE_KEY,
  HCaptchaHostError,
  removeHCaptcha,
  renderHCaptcha,
  resetHCaptcha,
} from '@/lib/hCaptcha';

interface CaptchaFieldProps {
  onSolved: (token: string) => void;
  className?: string;
}

/**
 * Inline HCaptcha widget for embedding directly into a form (e.g. the login
 * form when the backend answers with a 420 captcha challenge).
 *
 * The widget is rendered exactly once per mount and recovered in place with
 * `hcaptcha.reset()` when a challenge fails. Tearing the container down and
 * re-rendering on failure would pull the widget out from under an open
 * challenge, which is what made the captcha fail instantly on the first try.
 */
export function CaptchaField({ onSolved, className }: CaptchaFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onSolvedRef = useRef(onSolved);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSolvedRef.current = onSolved;
  }, [onSolved]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    // hCaptcha is still inside its own callback when these fire, so defer the
    // reset to the next task rather than re-entering the widget.
    const resetWidget = () => {
      setTimeout(() => {
        if (cancelled || widgetIdRef.current == null) return;
        resetHCaptcha(widgetIdRef.current);
      }, 0);
    };

    const render = async () => {
      try {
        const widgetId = await renderHCaptcha(container, {
          sitekey: HCAPTCHA_SITE_KEY,
          theme: getHCaptchaTheme(),
          callback: (token) => {
            setError(null);
            onSolvedRef.current(token);
          },
          'open-callback': () => setError(null),
          'error-callback': (code) => {
            setError(getHCaptchaErrorMessage(code));
            resetWidget();
          },
          'chalexpired-callback': () => {
            setError('Время на решение капчи истекло. Попробуйте ещё раз.');
            resetWidget();
          },
          'expired-callback': () => {
            setError('Капча истекла. Пройдите её ещё раз.');
            resetWidget();
          },
        });
        if (cancelled) {
          removeHCaptcha(widgetId);
          return;
        }
        widgetIdRef.current = widgetId;
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof HCaptchaHostError
            ? err.message
            : 'Не удалось загрузить капчу. Попробуйте позже.'
        );
      }
    };

    void render();

    return () => {
      cancelled = true;
      if (widgetIdRef.current != null) {
        removeHCaptcha(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className={className} data-testid="captcha-field">
      <div ref={containerRef} className="flex justify-center" />
      {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
