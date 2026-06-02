import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex gap-2">
      <Button
        variant={isFavorite ? 'default' : 'outline'}
        size="icon"
        onClick={onToggleFavorite}
        className="cursor-pointer"
        title={isFavorite ? 'В любимом' : 'В любимое'}
        disabled={disabled}
      >
        <Heart className={cn(
          'w-5 h-5',
          isFavorite ? 'fill-current text-primary-foreground' : 'text-foreground'
        )} />
      </Button>
      {statusOptions.map((status) => {
        const statusId = mapStatusToListId(status);
        const isActive = userListId === statusId;
        return (
          <Button
            key={status}
            variant={isActive ? 'default' : 'outline'}
            size="icon"
            onClick={() => onAddToList(status)}
            className="cursor-pointer"
            title={STATUS_LABELS[status]}
            disabled={disabled}
          >
            <span className={cn(isActive && 'text-primary-foreground')}>
              {STATUS_ICONS[status]}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
