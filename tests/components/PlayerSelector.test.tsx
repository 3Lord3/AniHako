import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerSelector, stripPlayerPrefix } from '@/pages/AnimeDetailPage/components/PlayerSelector';

describe('stripPlayerPrefix', () => {
  it('strips "Плеер " prefix', () => {
    expect(stripPlayerPrefix('Плеер Kodik')).toBe('Kodik');
    expect(stripPlayerPrefix('Плеер Alloha')).toBe('Alloha');
  });

  it('returns the string unchanged when there is no prefix', () => {
    expect(stripPlayerPrefix('Kodik')).toBe('Kodik');
  });
});

describe('PlayerSelector', () => {
  it('renders nothing when there is only one player', () => {
    const { container } = render(
      <PlayerSelector players={['Kodik']} value="Kodik" onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when players is empty', () => {
    const { container } = render(
      <PlayerSelector players={[]} value={null} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a button for each player without prefix', () => {
    render(
      <PlayerSelector
        players={['Плеер Kodik', 'Плеер Alloha']}
        value="Плеер Kodik"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('radio', { name: 'Kodik' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Alloha' })).toBeInTheDocument();
  });

  it('marks the active player as aria-checked', () => {
    render(
      <PlayerSelector
        players={['Плеер Kodik', 'Плеер Alloha']}
        value="Плеер Alloha"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('radio', { name: 'Kodik' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Alloha' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with the full player name when a button is clicked', () => {
    const onChange = vi.fn();
    render(
      <PlayerSelector
        players={['Плеер Kodik', 'Плеер Alloha']}
        value="Плеер Kodik"
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Alloha' }));
    expect(onChange).toHaveBeenCalledWith('Плеер Alloha');
  });
});
