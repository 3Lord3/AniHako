import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from '@/components/search/ViewToggle';

describe('ViewToggle', () => {
  it('renders two buttons', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('calls onViewChange with grid when first button is clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="list" onViewChange={onViewChange} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onViewChange).toHaveBeenCalledWith('grid');
  });

  it('calls onViewChange with list when second button is clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onViewChange).toHaveBeenCalledWith('list');
  });

  it('applies active styles to first button when view is grid', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('bg-background');
    expect(buttons[0]).toHaveClass('text-foreground');
  });

  it('applies active styles to second button when view is list', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="list" onViewChange={onViewChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('bg-background');
    expect(buttons[1]).toHaveClass('text-foreground');
  });

  it('applies inactive styles when view is not the button type', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle view="grid" onViewChange={onViewChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('text-muted-foreground');
  });
});