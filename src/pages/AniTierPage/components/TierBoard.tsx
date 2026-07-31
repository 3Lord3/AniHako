import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { UNRANKED_TIER_ID } from '@/types/tier';
import { resolveDropTarget } from '@/lib/tierDragUtils';
import type { useTierList } from '@/hooks/useTierList';
import { TierRow } from './TierRow';
import { UnrankedPool } from './UnrankedPool';
import { buildMoveTargets } from './moveTargets';
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
  const [activeAnimeId, setActiveAnimeId] = useState<number | null>(null);

  const sensors = useSensors(
    // Mouse: small enough to feel immediate, big enough that a plain click on the corner button still registers.
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    // Touch: require a brief hold before a drag starts, so a quick swipe still scrolls the page
    // instead of being captured as a drag (paired with touch-pan-y on TierCard).
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const moveTargets = useMemo(() => buildMoveTargets(state.tiers), [state.tiers]);

  function handleDragStart(event: DragStartEvent) {
    setActiveAnimeId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveAnimeId(null);
    const { active, over } = event;
    if (!over) return;

    const animeId = Number(active.id);
    const overData = over.data.current as { tierId?: string; type?: string } | undefined;
    const { tierId, index } = resolveDropTarget(state.order, String(over.id), overData);
    if (index === -1) return;

    moveAnime(animeId, tierId, index);
  }

  const activeItem = activeAnimeId !== null ? state.items[activeAnimeId] : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveAnimeId(null)}
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
