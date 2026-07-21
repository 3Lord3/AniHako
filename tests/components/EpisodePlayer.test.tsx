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
    render(<EpisodePlayer video={mockVideo} title="Test Anime" />);
    const iframe = screen.getByTitle('Test Anime - Серия 1') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe('https://player.example.com/embed/42');
  });

  it('renders iframe with accessible title containing anime and episode', () => {
    render(<EpisodePlayer video={mockVideo} title="My Anime" />);
    expect(screen.getByTitle('My Anime - Серия 1')).toBeInTheDocument();
  });

  it('uses video.number when present, falls back to index', () => {
    const { rerender } = render(<EpisodePlayer video={mockVideo} title="t" />);
    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();

    rerender(<EpisodePlayer video={{ ...mockVideo, number: '' }} title="t" />);
    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();
  });

  it('hides iframe until onLoad fires', () => {
    render(<EpisodePlayer video={mockVideo} title="t" />);
    const iframe = screen.getByTitle('t - Серия 1');
    expect(iframe).toHaveClass('opacity-0');

    fireEvent.load(iframe);
    expect(iframe).not.toHaveClass('opacity-0');
  });

  it('remounts iframe (key change) when video_id changes', () => {
    const { rerender } = render(<EpisodePlayer video={mockVideo} title="t" />);
    const firstIframe = screen.getByTitle('t - Серия 1');
    fireEvent.load(firstIframe);

    rerender(<EpisodePlayer video={mockVideo2} title="t" />);
    const newIframe = screen.getByTitle('t - Серия 2') as HTMLIFrameElement;
    expect(newIframe.src).toBe('https://player.example.com/embed/43');
    expect(newIframe).toHaveClass('opacity-0');
  });

  it('sends origin in Referer (not no-referrer) so Alloha-like players do not 404', () => {
    render(<EpisodePlayer video={mockVideo} title="t" />);
    const iframe = screen.getByTitle('t - Серия 1');
    expect(iframe).toHaveAttribute('referrerpolicy', 'origin');
  });

  it('does not call onEpisodeComplete if not provided and iframe fires ended message', () => {
    render(<EpisodePlayer video={mockVideo} title="t" />);
    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    expect(() =>
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { event: 'kdEnded' },
          source: iframe.contentWindow,
        })
      )
    ).not.toThrow();
  });

  it('invokes onEpisodeComplete when iframe posts a kdEnded message', () => {
    const onEpisodeComplete = vi.fn();
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        onEpisodeComplete={onEpisodeComplete}
      />
    );
    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { event: 'kdEnded' },
        source: iframe.contentWindow,
      })
    );
    expect(onEpisodeComplete).toHaveBeenCalledWith(mockVideo.video_id);
  });

  it('ignores ended messages that do not originate from the iframe', () => {
    const onEpisodeComplete = vi.fn();
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        onEpisodeComplete={onEpisodeComplete}
      />
    );
    window.dispatchEvent(new MessageEvent('message', { data: { event: 'kdEnded' } }));
    expect(onEpisodeComplete).not.toHaveBeenCalled();
  });

  it('ignores postMessage events whose payload is not an ended event', () => {
    const onEpisodeComplete = vi.fn();
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        onEpisodeComplete={onEpisodeComplete}
      />
    );
    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { event: 'kdPlay' },
        source: iframe.contentWindow,
      })
    );
    expect(onEpisodeComplete).not.toHaveBeenCalled();
  });

  it('invokes onEpisodeComplete only once per video even if multiple ended signals arrive', () => {
    const onEpisodeComplete = vi.fn();
    render(
      <EpisodePlayer
        video={mockVideo}
        title="t"
        onEpisodeComplete={onEpisodeComplete}
      />
    );
    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { event: 'kdEnded' },
        source: iframe.contentWindow,
      })
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'player_end' },
        source: iframe.contentWindow,
      })
    );
    expect(onEpisodeComplete).toHaveBeenCalledTimes(1);
  });
});
