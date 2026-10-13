import { Button } from '@/components/ui/button';
import { TooltipWrap } from '@/components/ui/tooltip';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_ICONS } from '@/types/constants';
import { mapStatusToListId } from '@/types';
import { useT, type TranslationKey } from '@/i18n';
import type { AnimeStatus } from '@/types';

interface StatusButtonGroupProps {
  isFavorite: boolean;
  userListId: number | null;
  onToggleFavorite: () => void;
  onAddToList: (status: AnimeStatus) => void;
  disabled?: boolean;
}

const ROW_STATUSES: AnimeStatus[] = ['watching', 'planned', 'completed', 'paused', 'dropped'];

export function StatusButtonGroup({
  isFavorite,
  userListId,
  onToggleFavorite,
  onAddToList,
  disabled,
}: StatusButtonGroupProps) {
  const { t } = useT();
  const favoriteLabel = isFavorite ? t('status.inFavorites') : t('status.addToFavorites');

  return (
    <>
      {/* Mobile: compact 2×3 grid with icon + label in each cell */}
      <div className="md:hidden grid grid-cols-2 gap-2 w-full">
        <Button
          variant={isFavorite ? 'default' : 'outline'}
          onClick={onToggleFavorite}
          className="w-full min-w-0 justify-center gap-1.5 cursor-pointer px-2"
          aria-label={favoriteLabel}
          disabled={disabled}
        >
          <Heart
            className={cn(
              'w-4 h-4 shrink-0',
              isFavorite && 'fill-current text-primary-foreground'
            )}
          />
          <span className="truncate min-w-0 text-xs sm:text-sm">{favoriteLabel}</span>
        </Button>

        {ROW_STATUSES.map((status) => {
          const statusId = mapStatusToListId(status);
          const isActive = userListId === statusId;
          const label = t(STATUS_LABELS[status] as TranslationKey);
          return (
            <Button
              key={status}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onAddToList(status)}
              className="w-full min-w-0 justify-center gap-1.5 cursor-pointer px-2"
              aria-label={label}
              disabled={disabled}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center shrink-0 [&_svg]:!w-4 [&_svg]:!h-4',
                  isActive && 'text-primary-foreground'
                )}
                aria-hidden
              >
                {STATUS_ICONS[status]}
              </span>
              <span className="truncate min-w-0 text-xs sm:text-sm">{label}</span>
            </Button>
          );
        })}
      </div>

      {/* Desktop: original layout — single row of 6 icon buttons with tooltips */}
      <div className="hidden md:flex md:gap-2 md:w-full md:justify-center">
        <TooltipWrap content={favoriteLabel}>
          <Button
            variant={isFavorite ? 'default' : 'outline'}
            size="icon"
            onClick={onToggleFavorite}
            className="cursor-pointer"
            aria-label={favoriteLabel}
            disabled={disabled}
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite ? 'fill-current text-primary-foreground' : 'text-foreground'
              )}
            />
          </Button>
        </TooltipWrap>

        {ROW_STATUSES.map((status) => {
          const statusId = mapStatusToListId(status);
          const isActive = userListId === statusId;
          const label = t(STATUS_LABELS[status] as TranslationKey);
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
    </>
  );
}
