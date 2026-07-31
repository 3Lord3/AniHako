import { describe, it, expect } from 'vitest';
import { toTierAnimeItem } from '@/lib/tierAnimeMapper';
import type { YummyUserAnimeRate } from '@/types/list';
import type { AnimeCatalogItem } from '@/types/anime';

const poster = { small: 'small.jpg', medium: '', big: '', huge: '', fullsize: '', mega: '' };

describe('toTierAnimeItem', () => {
  it('maps a watched-list rate into a tier anime item', () => {
    const rate = {
      anime_id: 1,
      anime_url: 'my-anime',
      title: 'My Anime',
      poster,
      rating: 8,
      type: { name: '', value: 0, shortname: '', alias: '' },
      date: 0,
    } as YummyUserAnimeRate;

    expect(toTierAnimeItem(rate)).toEqual({
      animeId: 1,
      title: 'My Anime',
      posterUrl: 'small.jpg',
      url: 'my-anime',
    });
  });

  it('maps a catalog/search item into a tier anime item', () => {
    const catalogItem = {
      anime_id: 2,
      anime_url: 'other-anime',
      title: 'Other Anime',
      poster,
    } as AnimeCatalogItem;

    expect(toTierAnimeItem(catalogItem)).toEqual({
      animeId: 2,
      title: 'Other Anime',
      posterUrl: 'small.jpg',
      url: 'other-anime',
    });
  });
});
