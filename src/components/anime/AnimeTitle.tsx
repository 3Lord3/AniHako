import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AnimeTitleProps {
  title: ReactNode;
  className?: string;
}

export function AnimeTitle({ title, className }: AnimeTitleProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <h3 className={cn('line-clamp-2 cursor-default', className)}>
            {title}
          </h3>
        }
      />
      <TooltipContent side="top">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}
