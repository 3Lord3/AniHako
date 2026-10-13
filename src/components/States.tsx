import type { ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  } | ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3 py-16 px-4 rounded-2xl border border-dashed border-border',
        className
      )}
    >
      <div className="flex items-center justify-center size-12 rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="w-5 h-5" aria-hidden />}
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div>
          {action && typeof action === 'object' && 'label' in action ? (
            <Button onClick={action.onClick} variant="outline" size="sm">
              {action.label}
            </Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = 'Retry',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3 py-16 px-4 rounded-2xl border border-destructive/30 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-center justify-center size-12 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="w-5 h-5" aria-hidden />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
