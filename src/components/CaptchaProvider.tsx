import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CaptchaCancelledError,
  CaptchaError,
  registerCaptchaSolver,
} from '@/lib/captcha';
import {
  getHCaptchaErrorMessage,
  getHCaptchaTheme,
  getUnsupportedHostMessage,
  HCAPTCHA_SITE_KEY,
  loadHCaptcha,
  removeHCaptcha,
  resetHCaptcha,
} from '@/lib/hCaptcha';

/**
 * Renders the global captcha dialog and exposes a solver to the axios
 * interceptor via the captcha bridge. When the backend answers with a 420
 * error, the interceptor asks this provider for a token and repeats the
 * original request with it in the body.
 */
export function CaptchaProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const widgetIdRef = useRef<number | null>(null);
  const pendingRef = useRef<Array<{ resolve: (token: string) => void; reject: (err: Error) => void }>>(
    []
  );
  const renderSeqRef = useRef(0);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setError(null);
  }, []);

  // Two mutating requests can be challenged at the same time; both park on
  // `requestCaptchaToken()`, so a single pending slot would leave the first
  // one hanging forever. Resolve or reject every pending solver together.
  const settlePending = useCallback((token: string | null, err: Error | null) => {
    const pending = pendingRef.current;
    pendingRef.current = [];
    for (const { resolve, reject } of pending) {
      if (err) reject(err);
      else resolve(token as string);
    }
  }, []);

  const handleSolved = useCallback(
    (token: string) => {
      settlePending(token, null);
      closeDialog();
    },
    [settlePending, closeDialog]
  );

  // Recover in place instead of re-rendering the widget: hCaptcha is still
  // inside its own callback here, and destroying the container underneath an
  // open challenge is what made the captcha fail instantly on the first try.
  const resetWidget = useCallback(() => {
    setTimeout(() => {
      if (widgetIdRef.current == null) return;
      resetHCaptcha(widgetIdRef.current);
    }, 0);
  }, []);

  const handleFailed = useCallback(
    (code?: string) => {
      setError(getHCaptchaErrorMessage(code));
      resetWidget();
    },
    [resetWidget]
  );

  const handleChallengeExpired = useCallback(() => {
    setError('Время на решение капчи истекло. Попробуйте ещё раз.');
    resetWidget();
  }, [resetWidget]);

  const handleExpired = useCallback(() => {
    setError('Капча истекла. Пройдите её ещё раз.');
    resetWidget();
  }, [resetWidget]);

  const renderWidget = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    const seq = ++renderSeqRef.current;

    if (widgetIdRef.current != null) {
      removeHCaptcha(widgetIdRef.current);
      widgetIdRef.current = null;
    }
    container.replaceChildren();

    // Nothing below can succeed on an unsupported host, so say why instead of
    // rendering a widget that fails the moment it is clicked.
    const unsupportedHost = getUnsupportedHostMessage();
    if (unsupportedHost) {
      setError(unsupportedHost);
      return;
    }

    try {
      const hcaptcha = await loadHCaptcha();
      if (seq !== renderSeqRef.current) return;

      const widgetId = hcaptcha.render(container, {
        sitekey: HCAPTCHA_SITE_KEY,
        theme: getHCaptchaTheme(),
        callback: handleSolved,
        'open-callback': () => setError(null),
        'error-callback': handleFailed,
        'chalexpired-callback': handleChallengeExpired,
        'expired-callback': handleExpired,
      });

      if (seq !== renderSeqRef.current) {
        removeHCaptcha(widgetId);
        return;
      }
      widgetIdRef.current = widgetId;
    } catch (err) {
      if (seq !== renderSeqRef.current) return;
      settlePending(null, err instanceof Error ? err : new CaptchaError('Captcha failed to load'));
      setOpen(false);
    }
  }, [handleSolved, handleFailed, handleChallengeExpired, handleExpired, settlePending]);

  useEffect(() => {
    openRef.current = open;
    if (open) return;
    // The dialog closed: drop any pending render and destroy the widget.
    renderSeqRef.current += 1;
    if (widgetIdRef.current != null) {
      removeHCaptcha(widgetIdRef.current);
      widgetIdRef.current = null;
    }
  }, [open]);

  // The popup (and therefore the captcha container) mounts asynchronously
  // after `open` flips to true, so render the widget from a callback ref
  // instead of a plain effect to avoid racing the DOM mount.
  const handleContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (node && openRef.current) {
        void renderWidget();
      }
    },
    [renderWidget]
  );

  useEffect(() => {
    const unregister = registerCaptchaSolver(() => {
      setError(null);
      setOpen(true);
      return new Promise<string>((resolve, reject) => {
        pendingRef.current.push({ resolve, reject });
      });
    });
    return () => {
      unregister();
      // Nothing will ever solve the widget after the provider unmounts; let
      // any request still parked on `requestCaptchaToken()` fail instead of
      // leaving it hanging forever.
      settlePending(null, new CaptchaCancelledError());
    };
  }, [settlePending]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      settlePending(null, new CaptchaCancelledError());
      closeDialog();
    },
    [settlePending, closeDialog]
  );

  return (
    <>
      {children}
      {/*
        hCaptcha appends its challenge overlay to <body>, outside this dialog's
        portal. A modal dialog would trap focus inside itself and disable
        pointer events on everything outside it, so the challenge would be
        unusable; dismiss-on-outside-press would additionally close the dialog
        (cancelling the request) the moment the user clicks the challenge.
      */}
      <Dialog open={open} onOpenChange={handleOpenChange} modal={false} disablePointerDismissal>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </DialogTitle>
            <DialogDescription>
              Мы заметили подозрительную активность. Решите капчу, чтобы продолжить.
            </DialogDescription>
          </DialogHeader>
          <div
            ref={handleContainerRef}
            className="flex justify-center"
            data-testid="hcaptcha-container"
          />
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
