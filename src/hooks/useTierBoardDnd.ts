import { useMemo, useState } from 'react';
import {
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { resolveDropTarget } from '@/lib/tierDragUtils';
import { buildMoveTargets } from '@/pages/AniTierPage/components/moveTargets';
import type { TierListState } from '@/types/tier';

export function useTierBoardDnd(
  state: TierListState,
  moveAnime: (animeId: number, toTierId: string, toIndex: number) => void
) {
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveAnimeId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveAnimeId(null);
    const { active, over } = event;
    if (!over) return;

    const animeId = Number(active.id);
    const overData = over.data.current as { tierId?: string; type?: string } | undefined;
    const { tierId, index } = resolveDropTarget(state.order, String(over.id), overData);
    if (index === -1) return;

    moveAnime(animeId, tierId, index);
  };

  const handleDragCancel = () => setActiveAnimeId(null);

  const activeItem = activeAnimeId !== null ? state.items[activeAnimeId] : undefined;

  return {
    sensors,
    activeItem,
    moveTargets,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
