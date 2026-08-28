import { describe, it, expect } from 'vitest';
import { toParticipantRate } from '@/lib/tournamentMapper';
import type { AnimeCatalogItem } from '@/types';

describe('toParticipantRate', () => {
  it('builds a rate from a full search result', () => {
    const anime = {
      anime_id: 5,
      anime_url: 'found',
      title: 'Found Anime',
      poster: { small: 's.jpg' },
      rating: { average: 7.2 },
      type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
      year: 2019,
    } as unknown as AnimeCatalogItem;

    expect(toParticipantRate(anime, 1000)).toEqual({
      anime_id: 5,
      anime_url: 'found',
      title: 'Found Anime',
      poster: { small: 's.jpg', medium: '', big: '', huge: '', fullsize: '', mega: '' },
      rating: 7.2,
      type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
      year: 2019,
      user: undefined,
      date: 1000,
    });
  });

  it('falls back to anime_id string, empty poster, empty type and 0 rating when missing', () => {
    const anime = { anime_id: 6, title: 'Bare' } as unknown as AnimeCatalogItem;

    expect(toParticipantRate(anime, 42)).toEqual({
      anime_id: 6,
      anime_url: '6',
      title: 'Bare',
      poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
      rating: 0,
      type: { name: '', value: 0, shortname: '', alias: '' },
      year: undefined,
      user: undefined,
      date: 42,
    });
  });
});
