import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EpisodePlayer } from '@/pages/AnimeDetailPage/components/EpisodePlayer';
import type { AnimeVideo } from '@/types';

const mockVideo: AnimeVideo = {
  video_id: 42,
  iframe_url: 'https://player.example.com/embed/42',
  data: { dubbing: 'AniDub', player: 'Kodik', player_id: 1 },
  number: '1',
  date: 0,
  index: 1,
  views: 0,
  duration: 0,
};

const mockVideo2: AnimeVideo = {
  ...mockVideo,
  video_id: 43,
  iframe_url: 'https://player.example.com/embed/43',
  number: '2',
  index: 2,
};

describe('EpisodePlayer', () => {
  it('renders iframe with video iframe_url', () => {
    render(
      <EpisodePlayer
        video={mockVideo}
        title="Test Anime"
        hasPrev={false}
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const iframe = screen.getByTitle('Test Anime - Серия 1') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe('https://player.example.com/embed/42');
  });

  it('renders iframe with accessible title containing anime and episode', () => {
    render(
      <EpisodePlayer
        video={mockVideo}
        title="My Anime"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByTitle('My Anime - Серия 1')).toBeInTheDocument();
  });

  it('disables prev button when hasPrev is false', () => {
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev={false}
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Предыдущая серия')).toBeDisabled();
  });

  it('disables next button when hasNext is false', () => {
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Следующая серия')).toBeDisabled();
  });

  it('calls onPrev when prev button clicked', () => {
    const onPrev = vi.fn();
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext
        onPrev={onPrev}
        onNext={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('Предыдущая серия'));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button clicked', () => {
    const onNext = vi.fn();
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={onNext}
      />
    );
    fireEvent.click(screen.getByLabelText('Следующая серия'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('uses video.number when present, falls back to index', () => {
    const { rerender } = render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();

    rerender(
      <EpisodePlayer
        video={{ ...mockVideo, number: '' }}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();
  });

  it('hides iframe until onLoad fires', () => {
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const iframe = screen.getByTitle('t - Серия 1');
    expect(iframe).toHaveClass('opacity-0');

    fireEvent.load(iframe);
    expect(iframe).not.toHaveClass('opacity-0');
  });

  it('remounts iframe (key change) when video_id changes', () => {
    const { rerender } = render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const firstIframe = screen.getByTitle('t - Серия 1');
    fireEvent.load(firstIframe);

    rerender(
      <EpisodePlayer
        video={mockVideo2}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const newIframe = screen.getByTitle('t - Серия 2') as HTMLIFrameElement;
    expect(newIframe.src).toBe('https://player.example.com/embed/43');
    expect(newIframe).toHaveClass('opacity-0');
  });

  it('sends origin in Referer (not no-referrer) so Alloha-like players do not 404', () => {
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const iframe = screen.getByTitle('t - Серия 1');
    expect(iframe).toHaveAttribute('referrerpolicy', 'origin');
  });
});
