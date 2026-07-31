import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TierRow } from '@/pages/AniTierPage/components/TierRow';
import type { TierDefinition, TierAnimeItem } from '@/types/tier';
import { buildMoveTargets } from '@/pages/AniTierPage/components/moveTargets';

const tier: TierDefinition = { id: 'tier-s', label: 'S', color: 'rose' };
const items: Record<number, TierAnimeItem> = {
  1: { animeId: 1, title: 'One', posterUrl: 'one.jpg', url: 'one' },
  2: { animeId: 2, title: 'Two', posterUrl: 'two.jpg', url: 'two' },
};

function renderRow(overrides: Partial<React.ComponentProps<typeof TierRow>> = {}) {
  const handlers = {
    onMoveAnimeToTier: vi.fn(),
  };
  render(
    <TooltipProvider>
      <DndContext>
        <TierRow
          tier={tier}
          animeIds={[1, 2]}
          items={items}
          moveTargets={buildMoveTargets([tier])}
          {...handlers}
          {...overrides}
        />
      </DndContext>
    </TooltipProvider>
  );
  return handlers;
}

describe('TierRow', () => {
  it('renders the tier label (read-only) and one card per anime id', () => {
    renderRow();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getAllByAltText('')).toHaveLength(2);
  });

  it('does not offer inline label editing (moved to the manage-tiers dialog)', () => {
    renderRow();
    fireEvent.click(screen.getByText('S'));
    expect(screen.queryByDisplayValue('S')).not.toBeInTheDocument();
  });

  it('moves a card to another tier via its move-to-tier menu', async () => {
    const { onMoveAnimeToTier } = renderRow();

    const [firstMoveButton] = screen.getAllByLabelText('Переместить в тир');
    fireEvent.click(firstMoveButton);
    const option = await screen.findByText('Не оценено');
    fireEvent.click(option);

    expect(onMoveAnimeToTier).toHaveBeenCalledWith(1, 'unranked');
  });
});
