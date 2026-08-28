import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TierCard } from '@/pages/AniTierPage/components/TierCard';
import type { TierAnimeItem } from '@/types/tier';
import type { MoveTarget } from '@/lib/tierMoveTargets';

const anime: TierAnimeItem = { animeId: 1, title: 'My Anime', posterUrl: 'poster.jpg', url: 'my-anime' };
const moveTargets: MoveTarget[] = [
  { id: 'unranked', label: 'Не оценено' },
  { id: 'tier-a', label: 'A' },
];

function renderCard(overrides: Partial<React.ComponentProps<typeof TierCard>> = {}) {
  const onMoveToTier = vi.fn();
  render(
    <TooltipProvider>
      <DndContext>
        <TierCard anime={anime} tierId="tier-s" moveTargets={moveTargets} onMoveToTier={onMoveToTier} {...overrides} />
      </DndContext>
    </TooltipProvider>
  );
  return { onMoveToTier };
}

describe('TierCard', () => {
  it('renders only the poster image, with no visible title text', () => {
    renderCard();
    expect(screen.getByAltText('')).toHaveAttribute('src', 'poster.jpg');
    expect(screen.queryByText('My Anime')).not.toBeInTheDocument();
  });

  it('defaults to the large size', () => {
    renderCard();
    const card = screen.getByAltText('').parentElement as HTMLElement;
    expect(card.className).toContain('w-24');
  });

  it('renders smaller when size="compact" (used inside tier rows)', () => {
    renderCard({ size: 'compact' });
    const card = screen.getByAltText('').parentElement as HTMLElement;
    expect(card.className).toContain('w-16');
    expect(card.className).not.toContain('w-24');
  });

  it('does not navigate anywhere on click (no link)', () => {
    renderCard();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('reveals the title in a tooltip on hover', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.hover(screen.getByAltText(''));
    expect(await screen.findByText('My Anime')).toBeInTheDocument();
  });

  it('lists the move targets in the move-to-tier menu', async () => {
    const { onMoveToTier } = renderCard();

    fireEvent.click(screen.getByLabelText('Переместить в тир'));
    const option = await screen.findByText('A');
    fireEvent.click(option);

    expect(onMoveToTier).toHaveBeenCalledWith('tier-a');
  });
});
