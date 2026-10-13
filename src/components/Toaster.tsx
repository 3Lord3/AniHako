import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  success: (description: string, title?: string) => string;
  error: (description: string, title?: string) => string;
  info: (description: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let externalToast: ((t: Omit<Toast, 'id'>) => string) | null = null;

export function toast(t: Omit<Toast, 'id'>) {
  if (externalToast) return externalToast(t);
  // Fallback: log to console if provider not mounted
  // eslint-disable-next-line no-console
  console.warn('[toast] Toaster not mounted:', t);
  return '';
}

toast.success = (description: string, title?: string) =>
  toast({ description, title, variant: 'success' });
toast.error = (description: string, title?: string) =>
  toast({ description, title, variant: 'error' });
toast.info = (description: string, title?: string) =>
  toast({ description, title, variant: 'info' });

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op API when outside provider; calling `toast` directly still works.
    return {
      toast,
      dismiss: () => {},
      success: toast.success,
      error: toast.error,
      info: toast.info,
    };
  }
  return ctx;
}

const VARIANT_ICON: Record<ToastVariant, ReactNode | null> = {
  default: null,
  success: <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />,
  error: <AlertCircle className="w-4 h-4 text-destructive" />,
  info: <Info className="w-4 h-4 text-primary" />,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const variant = toast.variant ?? 'default';
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 w-full max-w-sm rounded-xl bg-card text-card-foreground ring-1 ring-border shadow-soft-lg p-3.5',
        'transition-all duration-200'
      )}
    >
      <span className="mt-0.5 shrink-0">{VARIANT_ICON[variant]}</span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-medium">{toast.title}</p>}
        {toast.description && (
          <p className={cn('text-sm text-muted-foreground', toast.title && 'mt-0.5')}>
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 -m-1 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const next: Toast = { id, duration: 4000, variant: 'default', ...t };
      setToasts((list) => [...list, next]);
      if (next.duration && next.duration > 0) {
        const handle = window.setTimeout(() => dismiss(id), next.duration);
        timers.current.set(id, handle);
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    externalToast = show;
    return () => {
      externalToast = null;
      timers.current.forEach((h) => window.clearTimeout(h));
      timers.current.clear();
    };
  }, [show]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: show,
      dismiss,
      success: (description, title) => show({ description, title, variant: 'success' }),
      error: (description, title) => show({ description, title, variant: 'error' }),
      info: (description, title) => show({ description, title, variant: 'info' }),
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
