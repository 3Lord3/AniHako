import {
  DndContext,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { UNRANKED_TIER_ID } from '@/types/tier';
import type { useTierList } from '@/hooks/useTierList';
import { useTierBoardDnd } from '@/hooks/useTierBoardDnd';
import { TierRow } from './TierRow';
import { UnrankedPool } from './UnrankedPool';
import { TIER_CARD_SIZE_CLASSES } from './TierCard';
import { cn } from '@/lib/utils';

interface TierBoardProps {
  tierList: ReturnType<typeof useTierList>;
}

// Stable reference so a missing order entry doesn't allocate a new array (and break
// downstream memoization) on every render.
const EMPTY_ORDER: number[] = [];

export function TierBoard({ tierList }: TierBoardProps) {
  const { state, moveAnime } = tierList;
  const { sensors, activeItem, moveTargets, handleDragStart, handleDragEnd, handleDragCancel } =
    useTierBoardDnd(state, moveAnime);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-2">
        {state.tiers.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Нет ни одного тира. Откройте «Тиры» и создайте первый.
          </div>
        )}

        {state.tiers.map((tier) => (
          <TierRow
            key={tier.id}
            tier={tier}
            animeIds={state.order[tier.id] ?? EMPTY_ORDER}
            items={state.items}
            moveTargets={moveTargets}
            onMoveAnimeToTier={(animeId, toTierId) =>
              moveAnime(animeId, toTierId, (state.order[toTierId] ?? EMPTY_ORDER).length)
            }
          />
        ))}

        <UnrankedPool
          animeIds={state.order[UNRANKED_TIER_ID] ?? EMPTY_ORDER}
          items={state.items}
          moveTargets={moveTargets}
          onMoveAnimeToTier={(animeId, toTierId) =>
            moveAnime(animeId, toTierId, (state.order[toTierId] ?? EMPTY_ORDER).length)
          }
        />
      </div>

      <DragOverlay>
        {activeItem ? (
          <div
            className={cn(
              'aspect-2/3 overflow-hidden rounded-md border border-border shadow-lg',
              TIER_CARD_SIZE_CLASSES.large
            )}
          >
            <img
              src={activeItem.posterUrl}
              alt=""
              className="h-full w-full select-none object-cover [-webkit-touch-callout:none] [-webkit-user-drag:none]"
              draggable={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
