import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRightLeft } from 'lucide-react';
import { TooltipWrap } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { TierAnimeItem } from '@/types/tier';
import type { MoveTarget } from '@/lib/tierMoveTargets';
import { cn } from '@/lib/utils';

export type TierCardSize = 'compact' | 'large';

export const TIER_CARD_SIZE_CLASSES: Record<TierCardSize, string> = {
  compact: 'w-16 sm:w-20',
  large: 'w-24 sm:w-32',
};

interface TierCardProps {
  anime: TierAnimeItem;
  tierId: string;
  moveTargets: MoveTarget[];
  onMoveToTier: (tierId: string) => void;
  size?: TierCardSize;
}

export function TierCard({ anime, tierId, moveTargets, onMoveToTier, size = 'large' }: TierCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(anime.animeId),
    data: { type: 'card', tierId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative aspect-2/3 shrink-0 touch-pan-y select-none overflow-hidden rounded-md border border-border bg-muted [-webkit-touch-callout:none] [-webkit-user-drag:none]',
        TIER_CARD_SIZE_CLASSES[size],
        isDragging && 'opacity-40'
      )}
    >
      <TooltipWrap content={anime.title}>
        <img
          src={anime.posterUrl}
          alt=""
          className="h-full w-full select-none object-cover [-webkit-touch-callout:none] [-webkit-user-drag:none]"
          draggable={false}
        />
      </TooltipWrap>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Переместить в тир"
          className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        >
          <ArrowRightLeft className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {moveTargets.map((target) => (
            <DropdownMenuItem key={target.id} onClick={() => onMoveToTier(target.id)}>
              {target.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
