import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EpisodeList } from '@/pages/AnimeDetailPage/components/EpisodeList';
import type { AnimeVideo } from '@/types';

const mockVideos: AnimeVideo[] = [
  { video_id: 1, iframe_url: 'a', data: { dubbing: 'd', player: 'p', player_id: 1 }, number: '1', date: 0, index: 1, views: 0, duration: 0 },
  { video_id: 2, iframe_url: 'b', data: { dubbing: 'd', player: 'p', player_id: 1 }, number: '2', date: 0, index: 2, views: 0, duration: 0 },
  { video_id: 3, iframe_url: 'c', data: { dubbing: 'd', player: 'p', player_id: 1 }, number: '3', date: 0, index: 3, views: 0, duration: 0 },
];

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('EpisodeList', () => {
  it('renders a tab for each video with its number', () => {
    render(<EpisodeList videos={mockVideos} selectedIndex={0} onSelect={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Серия 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Серия 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Серия 3' })).toBeInTheDocument();
  });

  it('marks the selected tab as aria-selected', () => {
    render(<EpisodeList videos={mockVideos} selectedIndex={1} onSelect={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Серия 1' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Серия 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Серия 3' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelect with index when a tab is clicked', () => {
    const onSelect = vi.fn();
    render(<EpisodeList videos={mockVideos} selectedIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Серия 3' }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('uses index as fallback label when number is empty', () => {
    const videos = [{ ...mockVideos[0], number: '' }];
    render(<EpisodeList videos={videos} selectedIndex={0} onSelect={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Серия 1' })).toBeInTheDocument();
  });

  it('scrolls selected tab into view when selectedIndex changes', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<EpisodeList videos={mockVideos} selectedIndex={2} onSelect={vi.fn()} />);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('does not render watched toggles when canMarkWatched is false', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([2])}
        onToggleWatched={vi.fn()}
        canMarkWatched={false}
      />
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('marks episodes in viewedVideoIds as watched checkboxes', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([1, 2])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    expect(screen.getByRole('checkbox', { name: 'Снять отметку с серии 1' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'Снять отметку с серии 2' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'Отметить серию 3 как просмотренную' })).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking an unwatched toggle invokes onToggleWatched with videoId and isWatched=false', () => {
    const onToggleWatched = vi.fn();
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([1])}
        onToggleWatched={onToggleWatched}
        canMarkWatched
      />
    );
    fireEvent.click(screen.getByTestId('episode-watched-toggle-3'));
    expect(onToggleWatched).toHaveBeenCalledWith(3, false);
  });

  it('clicking a watched toggle invokes onToggleWatched with videoId and isWatched=true', () => {
    const onToggleWatched = vi.fn();
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([2])}
        onToggleWatched={onToggleWatched}
        canMarkWatched
      />
    );
    fireEvent.click(screen.getByTestId('episode-watched-toggle-2'));
    expect(onToggleWatched).toHaveBeenCalledWith(2, true);
  });

  it('toggle click does not trigger onSelect', () => {
    const onSelect = vi.fn();
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={onSelect}
        viewedVideoIds={new Set([1])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    fireEvent.click(screen.getByTestId('episode-watched-toggle-2'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not nest checkbox role inside the tab button (a11y)', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set()}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-1');
    const tabButton = screen.getByRole('tab', { name: 'Серия 1' });
    expect(tabButton.contains(toggle)).toBe(false);
    expect(toggle.closest('button[role="tab"]')).toBeNull();
  });

  it('applies square sizing classes to the tab button', () => {
    render(<EpisodeList videos={mockVideos} selectedIndex={0} onSelect={vi.fn()} />);
    const tab = screen.getByRole('tab', { name: 'Серия 1' });
    expect(tab).toHaveClass('h-9');
    expect(tab).toHaveClass('w-9');
  });

  it('positions the watched indicator as a dot overflowing the tab button on desktop', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([1])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-1');
    expect(toggle).toHaveClass('md:absolute');
    expect(toggle).toHaveClass('md:-top-1.5');
    expect(toggle).toHaveClass('md:-right-1.5');
    expect(toggle).toHaveClass('md:size-4');
    expect(toggle).toHaveClass('md:rounded-full');
  });

  it('positions the watched indicator as a standalone button before the tab on mobile', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([1])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-1');
    expect(toggle).toHaveClass('inline-flex');
    expect(toggle).toHaveClass('size-9');
    expect(toggle).toHaveClass('rounded-md');
  });

  it('uses solid primary for a watched indicator on a non-active tab', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([2])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-2');
    expect(toggle).toHaveClass('bg-primary');
    expect(toggle).not.toHaveClass('!bg-primary-foreground');
  });

  it('navigates between tabs with ArrowRight and ArrowLeft when on a non-edge tab', () => {
    const onSelect = vi.fn();
    render(<EpisodeList videos={mockVideos} selectedIndex={1} onSelect={onSelect} />);
    const tablist = screen.getByRole('tablist', { name: 'Список серий' });
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelect).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(onSelect).toHaveBeenLastCalledWith(0);
  });

  it('does not move past the first/last tab on ArrowLeft/ArrowRight', () => {
    const onSelect = vi.fn();
    render(<EpisodeList videos={mockVideos} selectedIndex={0} onSelect={onSelect} />);
    const tablist = screen.getByRole('tablist', { name: 'Список серий' });
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not move past the last tab on ArrowRight', () => {
    const onSelect = vi.fn();
    render(<EpisodeList videos={mockVideos} selectedIndex={2} onSelect={onSelect} />);
    const tablist = screen.getByRole('tablist', { name: 'Список серий' });
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('Home/End jump to first/last tab', () => {
    const onSelect = vi.fn();
    render(<EpisodeList videos={mockVideos} selectedIndex={1} onSelect={onSelect} />);
    const tablist = screen.getByRole('tablist', { name: 'Список серий' });
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(onSelect).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(onSelect).toHaveBeenLastCalledWith(0);
  });

  it('fills the mobile watched indicator with white when the tab is active', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={1}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([2])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-2');
    expect(toggle).toHaveClass('!bg-primary-foreground');
    expect(toggle).toHaveClass('!text-primary');
  });

  it('reverts the watched indicator to solid primary on desktop even when active', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={1}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([2])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-2');
    expect(toggle).toHaveClass('md:!bg-primary');
  });

  it('renders the checkmark with adaptive foreground color (black on white mobile)', () => {
    const { container } = render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([1])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const checkmark = container.querySelector('svg.lucide-check');
    expect(checkmark).toBeInTheDocument();
    expect(checkmark).toHaveClass('text-foreground');
  });

  it('uses outlined style for an unwatched indicator', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set()}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggle = screen.getByTestId('episode-watched-toggle-1');
    expect(toggle).toHaveClass('bg-background');
    expect(toggle).toHaveClass('border-muted-foreground/50');
    expect(toggle).not.toHaveClass('bg-primary');
  });

  it('renders a single toggle element per episode (no a11y duplication)', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([1])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const toggles = screen.getAllByRole('checkbox');
    expect(toggles).toHaveLength(3);
  });

  it('fills the active tab button with white when the episode is watched (override variant)', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={1}
        onSelect={vi.fn()}
        viewedVideoIds={new Set([2])}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const tab = screen.getByRole('tab', { name: 'Серия 2, просмотрена' });
    expect(tab).toHaveClass('!bg-primary-foreground');
    expect(tab).toHaveClass('!text-primary');
  });

  it('does not invert an active tab that has not been watched yet', () => {
    render(
      <EpisodeList
        videos={mockVideos}
        selectedIndex={0}
        onSelect={vi.fn()}
        viewedVideoIds={new Set()}
        onToggleWatched={vi.fn()}
        canMarkWatched
      />
    );
    const tab = screen.getByRole('tab', { name: 'Серия 1' });
    expect(tab).not.toHaveClass('!bg-primary-foreground');
    expect(tab).not.toHaveClass('!text-primary');
  });
});
