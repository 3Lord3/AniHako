import { describe, it, expect } from 'vitest';
import {
  filterVideosByTranslate,
  synthesizeTranslatesFromVideos,
  filterGenericTranslates,
  comparePlayersByPriority,
  getUniquePlayers,
} from '@/lib/episodes';
import type { AnimeTranslate, AnimeVideo } from '@/types';

const video = (id: number, dubbing?: string, player?: string): AnimeVideo =>
  ({
    video_id: id,
    iframe_url: `https://player.example.com/embed/${id}`,
    data: { dubbing, player, player_id: 1 },
    number: '1',
    date: 0,
    index: 1,
    views: 0,
    duration: 0,
  }) as AnimeVideo;

describe('filterVideosByTranslate', () => {
  it('returns all videos when no translate is given', () => {
    const videos = [video(1, 'A'), video(2, 'B')];
    expect(filterVideosByTranslate(videos, undefined)).toEqual(videos);
  });

  it('filters videos matching the translate title', () => {
    const videos = [video(1, 'A'), video(2, 'B')];
    const translate: AnimeTranslate = { title: 'A', href: 'a', value: 1 };
    expect(filterVideosByTranslate(videos, translate)).toEqual([videos[0]]);
  });

  it('falls back to the full list when no video matches the translate', () => {
    const videos = [video(1, 'A'), video(2, 'B')];
    const translate: AnimeTranslate = { title: 'C', href: 'c', value: 3 };
    expect(filterVideosByTranslate(videos, translate)).toEqual(videos);
  });
});

describe('synthesizeTranslatesFromVideos', () => {
  it('builds a deduplicated translate list from video dubbing values, in first-seen order', () => {
    const videos = [video(1, 'A'), video(2, 'B'), video(3, 'A')];
    const result = synthesizeTranslatesFromVideos(videos);
    expect(result.map((t) => t.title)).toEqual(['A', 'B']);
    expect(result[0].value).toBe(1);
  });

  it('skips videos without dubbing', () => {
    const videos = [video(1, undefined)];
    expect(synthesizeTranslatesFromVideos(videos)).toEqual([]);
  });
});

describe('filterGenericTranslates', () => {
  it('strips generic titles', () => {
    const translates: AnimeTranslate[] = [
      { title: 'Многоголосый', href: 'a', value: 1 },
      { title: 'AniDub', href: 'b', value: 2 },
    ];
    expect(filterGenericTranslates(translates)).toEqual([translates[1]]);
  });
});

describe('comparePlayersByPriority', () => {
  it('orders players by the priority list', () => {
    expect(['Alloha', 'Kodik'].sort(comparePlayersByPriority)).toEqual(['Kodik', 'Alloha']);
  });

  it('places unknown players after prioritized ones, alphabetically among themselves', () => {
    expect(['Zeta', 'Alloha', 'Kodik'].sort(comparePlayersByPriority)).toEqual(['Kodik', 'Alloha', 'Zeta']);
  });
});

describe('getUniquePlayers', () => {
  it('deduplicates players and orders them by priority', () => {
    const videos = [video(1, 'A', 'Alloha'), video(2, 'A', 'Kodik'), video(3, 'A', 'Kodik')];
    expect(getUniquePlayers(videos)).toEqual(['Kodik', 'Alloha']);
  });

  it('skips videos without a player', () => {
    expect(getUniquePlayers([video(1, 'A', undefined)])).toEqual([]);
  });
});
