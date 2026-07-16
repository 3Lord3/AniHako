import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { EpisodeViewer } from '@/pages/AnimeDetailPage/components/EpisodeViewer';
import type { AnimeTranslate, AnimeVideo } from '@/types';

const anidubVideo: AnimeVideo = {
  video_id: 1,
  iframe_url: 'https://player.example.com/embed/1',
  data: { dubbing: 'AniDub', player: 'Kodik', player_id: 1 },
  number: '1',
  date: 0,
  index: 1,
  views: 0,
  duration: 0,
};

const subtitleVideo: AnimeVideo = {
  video_id: 2,
  iframe_url: 'https://player.example.com/embed/2',
  data: { dubbing: 'Озвучка SubStudio', player: 'Kodik', player_id: 1 },
  number: '1',
  date: 0,
  index: 1,
  views: 0,
  duration: 0,
};

const anidubVideo2: AnimeVideo = {
  ...anidubVideo,
  video_id: 3,
  iframe_url: 'https://player.example.com/embed/3',
  number: '2',
  index: 2,
};

const anidubAllohaVideo: AnimeVideo = {
  ...anidubVideo,
  video_id: 4,
  iframe_url: 'https://player.example.com/embed/4',
  data: { dubbing: 'AniDub', player: 'Alloha', player_id: 2 },
};

const anidubAllohaVideo2: AnimeVideo = {
  ...anidubAllohaVideo,
  video_id: 5,
  iframe_url: 'https://player.example.com/embed/5',
  number: '2',
  index: 2,
};

const translates: AnimeTranslate[] = [
  { title: 'AniDub', href: 'anidub', value: 1 },
  { title: 'Озвучка SubStudio', href: 'subs', value: 2 },
];

async function selectTranslate(user: ReturnType<typeof userEvent.setup>, currentLabel: string, targetName: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(currentLabel) }));
  await user.click(screen.getByRole('option', { name: targetName }));
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('EpisodeViewer', () => {
  it('renders nothing when videos is empty', () => {
    const { container } = render(
      <EpisodeViewer videos={[]} translates={translates} title="t" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders player with the first video by default', () => {
    render(<EpisodeViewer videos={[anidubVideo, anidubVideo2]} title="Test" />);
    const iframe = screen.getByTitle('Test - Серия 1') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/1');
  });

  it('shows episode list when there are multiple videos', () => {
    render(<EpisodeViewer videos={[anidubVideo, anidubVideo2]} title="t" />);
    expect(screen.getByRole('tab', { name: 'Серия 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Серия 2' })).toBeInTheDocument();
  });

  it('hides episode list when there is only one video', () => {
    render(<EpisodeViewer videos={[anidubVideo]} title="t" />);
    expect(screen.queryByRole('tablist', { name: 'Список серий' })).not.toBeInTheDocument();
  });

  it('clicking an episode tab changes the active video', () => {
    render(<EpisodeViewer videos={[anidubVideo, anidubVideo2]} title="t" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Серия 2' }));
    const iframe = screen.getByTitle('t - Серия 2') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/3');
  });

  it('filters videos by selected translate', async () => {
    const user = userEvent.setup();
    const videos = [anidubVideo, subtitleVideo, anidubVideo2];
    render(<EpisodeViewer videos={videos} translates={translates} title="t" />);
    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();

    await selectTranslate(user, 'AniDub', 'Озвучка SubStudio');

    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/2');
  });

  it('resets selected index to 0 when translate changes', async () => {
    const user = userEvent.setup();
    const videos = [anidubVideo, anidubVideo2, subtitleVideo];
    render(<EpisodeViewer videos={videos} translates={translates} title="t" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Серия 2' }));

    await selectTranslate(user, 'AniDub', 'Озвучка SubStudio');

    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();
  });

  it('synthesizes translates from videos when API provides none', async () => {
    const user = userEvent.setup();
    const videos = [anidubVideo, subtitleVideo];
    render(<EpisodeViewer videos={videos} translates={[]} title="t" />);

    const trigger = screen.getByRole('button', { name: /AniDub/ });
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);

    expect(screen.getByRole('option', { name: 'AniDub' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Озвучка SubStudio' })).toBeInTheDocument();
  });

  it('filters synthesized translates by dubbing', async () => {
    const user = userEvent.setup();
    const videos = [anidubVideo, subtitleVideo, anidubVideo2];
    render(<EpisodeViewer videos={videos} translates={[]} title="t" />);

    expect(screen.getByTitle('t - Серия 1')).toBeInTheDocument();

    await selectTranslate(user, 'AniDub', 'Озвучка SubStudio');

    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/2');
  });

  it('selects Kodik over Alloha by default when both are available', () => {
    const videos = [anidubVideo, anidubAllohaVideo, anidubVideo2];
    render(<EpisodeViewer videos={videos} title="t" />);

    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/1');
  });

  it('shows player buttons when multiple players are available for a dubbing', () => {
    const videos = [anidubVideo, anidubAllohaVideo, anidubVideo2, anidubAllohaVideo2];
    render(<EpisodeViewer videos={videos} title="t" />);

    const radiogroup = screen.getByRole('radiogroup', { name: 'Выбор плеера' });
    expect(within(radiogroup).getByText('Kodik')).toBeInTheDocument();
    expect(within(radiogroup).getByText('Alloha')).toBeInTheDocument();
  });

  it('does not show player buttons when only one player is available', () => {
    render(<EpisodeViewer videos={[anidubVideo, anidubVideo2]} title="t" />);
    expect(screen.queryByRole('radiogroup', { name: 'Выбор плеера' })).not.toBeInTheDocument();
  });

  it('switches iframe when player is changed', () => {
    const videos = [anidubVideo, anidubAllohaVideo, anidubVideo2, anidubAllohaVideo2];
    render(<EpisodeViewer videos={videos} title="t" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Alloha' }));

    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/4');
  });

  it('resets selected index to 0 when player changes', () => {
    const videos = [anidubVideo, anidubAllohaVideo, anidubVideo2, anidubAllohaVideo2];
    render(<EpisodeViewer videos={videos} title="t" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Серия 2' }));

    fireEvent.click(screen.getByRole('radio', { name: 'Alloha' }));

    const iframe = screen.getByTitle('t - Серия 1') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://player.example.com/embed/4');
  });

  it('renders player selector before translate selector', () => {
    const videos = [anidubVideo, anidubAllohaVideo, subtitleVideo, anidubAllohaVideo2];
    render(
      <EpisodeViewer
        videos={videos}
        translates={[
          { title: 'AniDub', href: 'anidub', value: 1 },
          { title: 'Озвучка SubStudio', href: 'subs', value: 2 },
        ]}
        title="t"
      />
    );

    const translateTrigger = screen.getByRole('button', { name: /AniDub/ });
    const playerKodik = screen.getByRole('radio', { name: 'Kodik' });

    const position = playerKodik.compareDocumentPosition(translateTrigger);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('resets translateValue when navigating to a different anime with different translates', () => {
    const anidub3: AnimeVideo = {
      ...anidubVideo,
      video_id: 100,
      iframe_url: 'https://player.example.com/embed/100',
      data: { dubbing: 'AniDub', player: 'Kodik', player_id: 1 },
    };
    const otherDubVideo: AnimeVideo = {
      ...anidubVideo,
      video_id: 101,
      iframe_url: 'https://player.example.com/embed/101',
      data: { dubbing: 'AniLibria', player: 'Kodik', player_id: 1 },
    };
    const subtitleForB: AnimeVideo = {
      ...subtitleVideo,
      video_id: 102,
      iframe_url: 'https://player.example.com/embed/102',
    };

    const { rerender } = render(
      <EpisodeViewer videos={[anidubVideo, anidubVideo2, subtitleVideo]} title="A" />
    );
    expect(screen.getByRole('button', { name: /AniDub/ })).toBeInTheDocument();

    rerender(
      <EpisodeViewer
        videos={[otherDubVideo, anidub3, subtitleForB]}
        title="B"
      />
    );

    const triggerB = screen.getByRole('button', { name: /AniLibria/ });
    expect(triggerB).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /AniDub/ })).not.toBeInTheDocument();
  });

  it('ignores generic translates from API and synthesizes from videos dubbing', async () => {
    const user = userEvent.setup();
    const genericTranslates: AnimeTranslate[] = [
      { title: 'Многоголосый', href: 'multivoice', value: 4 },
      { title: 'Одноголосый', href: 'single', value: 5 },
      { title: 'Двухголосый', href: 'duet', value: 6 },
      { title: 'Субтитры', href: 'subtitles', value: 7 },
    ];
    const videos = [anidubVideo, anidubAllohaVideo, subtitleVideo, anidubVideo2];
    render(<EpisodeViewer videos={videos} translates={genericTranslates} title="t" />);

    const trigger = screen.getByRole('button', { name: /AniDub/ });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole('option', { name: 'AniDub' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Озвучка SubStudio' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Многоголосый' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Одноголосый' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Двухголосый' })).not.toBeInTheDocument();
  });

  it('strips generic titles from the API fallback when videos have no dubbing data', () => {
    const genericTranslates: AnimeTranslate[] = [
      { title: 'Многоголосый', href: 'multivoice', value: 4 },
      { title: 'Одноголосый', href: 'single', value: 5 },
      { title: 'Двухголосый', href: 'duet', value: 6 },
      { title: 'Субтитры', href: 'subtitles', value: 7 },
    ];
    const stubDubbing: AnimeVideo[] = [
      { ...anidubVideo, data: { ...anidubVideo.data, dubbing: '' } },
      { ...anidubVideo2, data: { ...anidubVideo2.data, dubbing: '' } },
    ];
    render(<EpisodeViewer videos={stubDubbing} translates={genericTranslates} title="t" />);

    // No videos contribute a dubbing -> synthesized list is empty -> API fallback is used.
    // The generic filter must strip every generic entry, leaving an empty list and
    // hiding the translate selector entirely.
    expect(screen.queryByRole('button', { name: /Многоголосый/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Одноголосый/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Двухголосый/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Субтитры/ })).not.toBeInTheDocument();
  });

  it('strips generic titles from the synthesized branch when a video row stores a generic dubbing', async () => {
    const user = userEvent.setup();
    const mixed: AnimeVideo[] = [
      { ...anidubVideo, data: { ...anidubVideo.data, dubbing: 'Многоголосый' } },
      subtitleVideo,
      anidubVideo2,
    ];
    render(<EpisodeViewer videos={mixed} title="t" />);

    const trigger = screen.getByRole('button', { name: /Озвучка SubStudio/ });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole('option', { name: 'Озвучка SubStudio' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Многоголосый' })).not.toBeInTheDocument();
  });

  it('renders watched toggles only when canMarkWatched is true', () => {
    render(
      <EpisodeViewer
        videos={[anidubVideo, anidubVideo2]}
        title="t"
        viewedVideoIds={new Set([1])}
        canMarkWatched
        onToggleWatched={vi.fn()}
      />
    );
    expect(screen.getByTestId('episode-watched-toggle-1')).toBeInTheDocument();
    expect(screen.getByTestId('episode-watched-toggle-3')).toBeInTheDocument();
  });

  it('hides watched toggles when canMarkWatched is false', () => {
    render(
      <EpisodeViewer
        videos={[anidubVideo, anidubVideo2]}
        title="t"
        viewedVideoIds={new Set([1])}
        canMarkWatched={false}
        onToggleWatched={vi.fn()}
      />
    );
    expect(screen.queryByTestId('episode-watched-toggle-1')).not.toBeInTheDocument();
  });

  it('forwards onToggleWatched with videoId and isWatched flag', () => {
    const onToggleWatched = vi.fn();
    render(
      <EpisodeViewer
        videos={[anidubVideo, anidubVideo2]}
        title="t"
        viewedVideoIds={new Set([1])}
        canMarkWatched
        onToggleWatched={onToggleWatched}
      />
    );
    fireEvent.click(screen.getByTestId('episode-watched-toggle-3'));
    expect(onToggleWatched).toHaveBeenCalledWith(3, false);
  });

  it('forwards onEpisodeComplete with videoId from iframe ended message', () => {
    const onEpisodeComplete = vi.fn();
    render(
      <EpisodeViewer
        videos={[anidubVideo, anidubVideo2]}
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
    expect(onEpisodeComplete).toHaveBeenCalledWith(anidubVideo.video_id);
  });
});
