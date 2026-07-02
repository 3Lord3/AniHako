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
});
