import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManageTierRow } from '@/pages/AniTierPage/components/ManageTierRow';
import type { TierDefinition } from '@/types/tier';

const tier: TierDefinition = { id: 'tier-s', label: 'S', color: 'rose' };

function renderRow(overrides: Partial<React.ComponentProps<typeof ManageTierRow>> = {}) {
  const handlers = {
    onRename: vi.fn(),
    onRecolor: vi.fn(),
    onRemove: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
  };
  render(
    <ManageTierRow tier={tier} canMoveUp canMoveDown {...handlers} {...overrides} />
  );
  return handlers;
}

describe('ManageTierRow', () => {
  it('commits a renamed label on blur', () => {
    const { onRename } = renderRow();

    const input = screen.getByDisplayValue('S');
    fireEvent.change(input, { target: { value: 'Legendary' } });
    fireEvent.blur(input);

    expect(onRename).toHaveBeenCalledWith('Legendary');
  });

  it('shows the current color on the trigger button', () => {
    renderRow();
    expect(screen.getByLabelText('Выбрать цвет тира').className).toContain('bg-rose-500');
  });

  it('opens the color menu and calls onRecolor with the clicked preset', async () => {
    const { onRecolor } = renderRow();

    fireEvent.click(screen.getByLabelText('Выбрать цвет тира'));
    const violetSwatch = await screen.findByLabelText('Цвет violet');
    fireEvent.click(violetSwatch);

    expect(onRecolor).toHaveBeenCalledWith('violet');
  });

  it('calls onRemove when the delete button is clicked', () => {
    const { onRemove } = renderRow();

    fireEvent.click(screen.getByLabelText('Удалить тир'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('disables move-up at the top and move-down at the bottom', () => {
    renderRow({ canMoveUp: false, canMoveDown: false });

    expect(screen.getByLabelText('Переместить тир вверх')).toBeDisabled();
    expect(screen.getByLabelText('Переместить тир вниз')).toBeDisabled();
  });

  it('calls onMoveUp/onMoveDown when enabled', () => {
    const { onMoveUp, onMoveDown } = renderRow();

    fireEvent.click(screen.getByLabelText('Переместить тир вверх'));
    fireEvent.click(screen.getByLabelText('Переместить тир вниз'));

    expect(onMoveUp).toHaveBeenCalledTimes(1);
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });
});
