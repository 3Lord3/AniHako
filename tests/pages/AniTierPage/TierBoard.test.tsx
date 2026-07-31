import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TierBoard } from '@/pages/AniTierPage/components/TierBoard';
import { createEmptyTierList, UNRANKED_TIER_ID } from '@/types/tier';
import type { useTierList } from '@/hooks/useTierList';

function buildTierList(): ReturnType<typeof useTierList> {
  const state = createEmptyTierList();
  state.items[1] = { animeId: 1, title: 'Ranked', posterUrl: 'ranked.jpg', url: 'ranked' };
  state.items[2] = { animeId: 2, title: 'Pooled', posterUrl: 'pooled.jpg', url: 'pooled' };
  state.order['tier-s'] = [1];
  state.order[UNRANKED_TIER_ID] = [2];

  return {
    state,
    addTier: vi.fn(),
    renameTier: vi.fn(),
    recolorTier: vi.fn(),
    removeTier: vi.fn(),
    reorderTiers: vi.fn(),
    addAnime: vi.fn(),
    removeAnime: vi.fn(),
    moveAnime: vi.fn(),
    reset: vi.fn(),
  };
}

function renderBoard(tierList: ReturnType<typeof useTierList>) {
  render(
    <MemoryRouter>
      <TooltipProvider>
        <TierBoard tierList={tierList} />
      </TooltipProvider>
    </MemoryRouter>
  );
}

describe('TierBoard', () => {
  it('renders every default tier row and the unranked pool', () => {
    renderBoard(buildTierList());

    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Не оценено')).toBeInTheDocument();
  });

  it('places each anime card recorded in state.order somewhere on the board', () => {
    renderBoard(buildTierList());

    const images = screen.getAllByAltText('');
    expect(images.map((img) => img.getAttribute('src')).sort()).toEqual([
      'pooled.jpg',
      'ranked.jpg',
    ]);
  });

  it('does not render a drag overlay preview while idle', () => {
    renderBoard(buildTierList());
    // Only the two placed cards' posters should exist; no extra overlay image.
    expect(screen.getAllByAltText('')).toHaveLength(2);
  });

  it('shows a prompt to create the first tier when all tiers are deleted', () => {
    const tierList = buildTierList();
    tierList.state.tiers = [];

    renderBoard(tierList);

    expect(screen.getByText('Нет ни одного тира. Откройте «Тиры» и создайте первый.')).toBeInTheDocument();
    expect(screen.getByText('Не оценено')).toBeInTheDocument();
  });
});
