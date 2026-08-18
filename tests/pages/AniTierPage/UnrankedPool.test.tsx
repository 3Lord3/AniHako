import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UnrankedPool } from '@/pages/AniTierPage/components/UnrankedPool';
import type { TierAnimeItem } from '@/types/tier';
import { DEFAULT_TIERS } from '@/types/tier';
import { buildMoveTargets } from '@/lib/tierMoveTargets';

const items: Record<number, TierAnimeItem> = {
  1: { animeId: 1, title: 'One', posterUrl: 'one.jpg', url: 'one' },
};

function renderPool(animeIds: number[]) {
  const { container } = render(
    <TooltipProvider>
      <DndContext>
        <UnrankedPool
          animeIds={animeIds}
          items={items}
          moveTargets={buildMoveTargets(DEFAULT_TIERS)}
          onMoveAnimeToTier={vi.fn()}
        />
      </DndContext>
    </TooltipProvider>
  );
  return container;
}

describe('UnrankedPool', () => {
  it('shows a fixed "Не оценено" label', () => {
    renderPool([1]);
    expect(screen.getByText('Не оценено')).toBeInTheDocument();
  });

  it('renders a card for every anime id', () => {
    renderPool([1]);
    expect(screen.getAllByAltText('')).toHaveLength(1);
  });

  it('shows an empty-state hint when there is nothing to rank', () => {
    renderPool([]);
    expect(screen.getByText('Нет аниме — добавьте через поиск')).toBeInTheDocument();
  });

  it('stacks the label above the cards on every breakpoint', () => {
    const container = renderPool([1]);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex-col');
    expect(wrapper.className).not.toContain('sm:flex-row');
  });
});
