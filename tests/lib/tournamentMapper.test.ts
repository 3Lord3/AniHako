import { describe, it, expect } from 'vitest';
import { toTournamentParticipant } from '@/lib/tournamentMapper';
import type { YummyUserAnimeRate } from '@/types';

describe('toTournamentParticipant', () => {
  it('maps a watched-list rate into a tournament participant catalog item', () => {
    const rate = {
      anime_id: 1,
      anime_url: 'my-anime',
      anime_status: { title: 'Вышло', alias: 'released', value: 0 },
      title: 'My Anime',
      poster: { small: 's.jpg', medium: '', big: '', huge: '', fullsize: '', mega: '' },
      rating: 8.5,
      type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
      year: 2020,
      user: { list: { is_fav: false, list: { id: 2, title: '', href: '' } } },
      date: 0,
    } as YummyUserAnimeRate;

    expect(toTournamentParticipant(rate)).toEqual({
      anime_id: 1,
      anime_status: { title: 'Вышло', alias: 'released', value: 0 },
      anime_url: 'my-anime',
      poster: { small: 's.jpg', medium: '', big: '', huge: '', fullsize: '', mega: '' },
      rating: { average: 8.5, counters: 0 },
      user: { list: { is_fav: false, list: { id: 2, title: '', href: '' } } },
      title: 'My Anime',
      type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
      year: 2020,
      description: '',
      views: 0,
      season: 1,
      episodes: { aired: 0, count: 0 },
    });
  });

  it('defaults year to 0 when missing', () => {
    const rate = {
      anime_id: 2,
      anime_url: 'other',
      title: 'Other',
      poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
      rating: 0,
      type: { name: '', value: 0, shortname: '', alias: '' },
      date: 0,
    } as YummyUserAnimeRate;

    expect(toTournamentParticipant(rate).year).toBe(0);
  });
});
