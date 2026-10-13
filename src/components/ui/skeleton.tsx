import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'relative overflow-hidden rounded-md bg-muted dark:bg-muted/50',
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer"
      />
    </div>
  );
}
