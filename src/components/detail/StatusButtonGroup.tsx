import { Button } from '@/components/ui/button';
import { TooltipWrap } from '@/components/ui/tooltip';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_ICONS } from '@/types/constants';
import { mapStatusToListId } from '@/types';
import type { AnimeStatus } from '@/types';

interface StatusButtonGroupProps {
  isFavorite: boolean;
  userListId: number | null;
  onToggleFavorite: () => void;
  onAddToList: (status: AnimeStatus) => void;
  disabled?: boolean;
}

export function StatusButtonGroup({
  isFavorite,
  userListId,
  onToggleFavorite,
  onAddToList,
  disabled,
}: StatusButtonGroupProps) {
  const statusOptions: AnimeStatus[] = ['watching', 'planned', 'completed', 'paused', 'dropped'];
  const favoriteLabel = isFavorite ? 'В любимом' : 'В любимое';

  return (
    <div className="flex gap-2">
      <TooltipWrap content={favoriteLabel}>
        <Button
          variant={isFavorite ? 'default' : 'outline'}
          size="icon"
          onClick={onToggleFavorite}
          className="cursor-pointer"
          aria-label={favoriteLabel}
          disabled={disabled}
        >
          <Heart className={cn(
            'w-5 h-5',
            isFavorite ? 'fill-current text-primary-foreground' : 'text-foreground'
          )} />
        </Button>
      </TooltipWrap>
      {statusOptions.map((status) => {
        const statusId = mapStatusToListId(status);
        const isActive = userListId === statusId;
        const label = STATUS_LABELS[status];
        return (
          <TooltipWrap key={status} content={label}>
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              onClick={() => onAddToList(status)}
              className="cursor-pointer"
              aria-label={label}
              disabled={disabled}
            >
              <span className={cn(isActive && 'text-primary-foreground')}>
                {STATUS_ICONS[status]}
              </span>
            </Button>
          </TooltipWrap>
        );
      })}
    </div>
  );
}
