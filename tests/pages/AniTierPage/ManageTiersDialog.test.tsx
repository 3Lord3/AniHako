import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManageTiersDialog } from '@/pages/AniTierPage/components/ManageTiersDialog';
import { DEFAULT_TIERS } from '@/types/tier';

function renderDialog(overrides: Partial<React.ComponentProps<typeof ManageTiersDialog>> = {}) {
  const handlers = {
    onOpenChange: vi.fn(),
    onAddTier: vi.fn(),
    onRenameTier: vi.fn(),
    onRecolorTier: vi.fn(),
    onRemoveTier: vi.fn(),
    onReorderTiers: vi.fn(),
  };
  render(<ManageTiersDialog open tiers={DEFAULT_TIERS} {...handlers} {...overrides} />);
  return handlers;
}

describe('ManageTiersDialog', () => {
  it('lists every tier with its label', () => {
    renderDialog();
    for (const tier of DEFAULT_TIERS) {
      expect(screen.getByDisplayValue(tier.label)).toBeInTheDocument();
    }
  });

  it('calls onAddTier when the add-tier button is clicked', () => {
    const { onAddTier } = renderDialog();

    fireEvent.click(screen.getByText('Добавить тир'));
    expect(onAddTier).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveTier for the row whose delete button was clicked', () => {
    const { onRemoveTier } = renderDialog();

    const [firstDelete] = screen.getAllByLabelText('Удалить тир');
    fireEvent.click(firstDelete);

    expect(onRemoveTier).toHaveBeenCalledWith(DEFAULT_TIERS[0].id);
  });

  it('swaps the first two tiers when moving the second one up', () => {
    const { onReorderTiers } = renderDialog();

    const moveUpButtons = screen.getAllByLabelText('Переместить тир вверх');
    fireEvent.click(moveUpButtons[1]);

    const expectedIds = DEFAULT_TIERS.map((t) => t.id);
    [expectedIds[0], expectedIds[1]] = [expectedIds[1], expectedIds[0]];
    expect(onReorderTiers).toHaveBeenCalledWith(expectedIds);
  });
});
