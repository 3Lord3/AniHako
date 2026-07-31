import { useDroppable } from '@dnd-kit/core';
import { getTierColorPreset } from '@/types/tier';
import type { TierDefinition, TierAnimeItem } from '@/types/tier';
import { TierCardGrid } from './TierCardGrid';
import type { MoveTarget } from './moveTargets';
import { cn } from '@/lib/utils';

interface TierRowProps {
  tier: TierDefinition;
  animeIds: number[];
  items: Record<number, TierAnimeItem>;
  moveTargets: MoveTarget[];
  onMoveAnimeToTier: (animeId: number, toTierId: string) => void;
}

export function TierRow({ tier, animeIds, items, moveTargets, onMoveAnimeToTier }: TierRowProps) {
  const color = getTierColorPreset(tier.color);
  // Droppable spans the whole block (header + cards), not just the card grid.
  const { setNodeRef } = useDroppable({ id: tier.id, data: { tierId: tier.id, type: 'container' } });

  return (
    <div ref={setNodeRef} className="flex overflow-hidden rounded-lg border border-border">
      <div
        className={cn(
          'flex w-16 shrink-0 items-center justify-center break-words p-2 text-center text-sm font-bold sm:w-24 sm:text-base',
          color.bg,
          color.text
        )}
      >
        {tier.label}
      </div>
      <TierCardGrid
        tierId={tier.id}
        animeIds={animeIds}
        items={items}
        moveTargets={moveTargets}
        cardSize="compact"
        onMoveAnimeToTier={onMoveAnimeToTier}
      />
    </div>
  );
}
