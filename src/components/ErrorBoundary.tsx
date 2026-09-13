import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-8">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Что-то пошло не так</h2>
        <p className="text-muted-foreground">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
      </div>
      <pre className="text-xs bg-muted text-foreground border border-border p-4 rounded-lg max-w-md overflow-auto text-left">
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <Button onClick={resetErrorBoundary} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Попробовать снова
      </Button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}