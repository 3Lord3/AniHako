import { useDroppable } from '@dnd-kit/core';
import { UNRANKED_TIER_ID } from '@/types/tier';
import type { TierAnimeItem } from '@/types/tier';
import { TierCardGrid } from './TierCardGrid';
import type { MoveTarget } from './moveTargets';

interface UnrankedPoolProps {
  animeIds: number[];
  items: Record<number, TierAnimeItem>;
  moveTargets: MoveTarget[];
  onMoveAnimeToTier: (animeId: number, toTierId: string) => void;
}

export function UnrankedPool({ animeIds, items, moveTargets, onMoveAnimeToTier }: UnrankedPoolProps) {
  // Droppable spans the whole block (label + cards), not just the card grid.
  const { setNodeRef } = useDroppable({
    id: UNRANKED_TIER_ID,
    data: { tierId: UNRANKED_TIER_ID, type: 'container' },
  });

  return (
    <div ref={setNodeRef} className="flex flex-col overflow-hidden rounded-lg border border-dashed border-border">
      <div className="flex w-full shrink-0 items-center justify-center p-2 text-center text-xs font-medium text-muted-foreground sm:text-sm">
        Не оценено
      </div>
      <TierCardGrid
        tierId={UNRANKED_TIER_ID}
        animeIds={animeIds}
        items={items}
        moveTargets={moveTargets}
        scrollable={false}
        cardSize="large"
        emptyMessage="Нет аниме — добавьте через поиск"
        onMoveAnimeToTier={onMoveAnimeToTier}
      />
    </div>
  );
}
