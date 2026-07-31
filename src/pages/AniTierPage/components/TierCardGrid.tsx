import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TierAnimeItem } from '@/types/tier';
import { TierCard, type TierCardSize } from './TierCard';
import type { MoveTarget } from './moveTargets';
import { cn } from '@/lib/utils';

interface TierCardGridProps {
  tierId: string;
  animeIds: number[];
  items: Record<number, TierAnimeItem>;
  moveTargets: MoveTarget[];
  emptyMessage?: string;
  /** When false, the grid grows to fit all cards instead of scrolling internally. */
  scrollable?: boolean;
  cardSize?: TierCardSize;
  onMoveAnimeToTier: (animeId: number, toTierId: string) => void;
}

// Matches each TierCard size + padding, so a tier is card-sized even when empty.
const MIN_HEIGHT_CLASSES: Record<TierCardSize, string> = {
  compact: 'min-h-28 sm:min-h-36',
  large: 'min-h-40 sm:min-h-52',
};

export function TierCardGrid({
  tierId,
  animeIds,
  items,
  moveTargets,
  emptyMessage,
  scrollable = true,
  cardSize = 'large',
  onMoveAnimeToTier,
}: TierCardGridProps) {
  const cardMoveTargets = moveTargets.filter((target) => target.id !== tierId);

  const grid = (
    <SortableContext items={animeIds.map(String)} strategy={rectSortingStrategy}>
      <div className={cn('flex flex-wrap items-center gap-2 p-2', MIN_HEIGHT_CLASSES[cardSize])}>
        {animeIds.length === 0 && emptyMessage && (
          <p className="text-xs text-muted-foreground sm:text-sm">{emptyMessage}</p>
        )}
        {animeIds.map((animeId) => {
          const anime = items[animeId];
          if (!anime) return null;
          return (
            <TierCard
              key={animeId}
              anime={anime}
              tierId={tierId}
              size={cardSize}
              moveTargets={cardMoveTargets}
              onMoveToTier={(toTierId) => onMoveAnimeToTier(animeId, toTierId)}
            />
          );
        })}
      </div>
    </SortableContext>
  );

  if (!scrollable) {
    return <div className="flex-1">{grid}</div>;
  }

  return <ScrollArea className="max-h-56 flex-1">{grid}</ScrollArea>;
}
