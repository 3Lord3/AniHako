import { describe, it, expect } from 'vitest';
import {
  getDisplayTitle,
  getSeasonName,
  formatEpisodeCount,
  isAnimeAiring,
  getPosterUrl,
  getRatingDisplay,
} from '@/types/anime';
import type { AnimeCatalogItem } from '@/types/anime';

describe('types/anime', () => {
  describe('getDisplayTitle', () => {
    it('returns anime title', () => {
      expect(getDisplayTitle({ title: 'Attack on Titan' })).toBe('Attack on Titan');
    });

    it('returns Unknown for empty title', () => {
      expect(getDisplayTitle({ title: '' })).toBe('Unknown');
    });
  });

  describe('getSeasonName', () => {
    it('returns Зима for season 1', () => {
      expect(getSeasonName(1)).toBe('Зима');
    });

    it('returns Весна for season 2', () => {
      expect(getSeasonName(2)).toBe('Весна');
    });

    it('returns Лето for season 3', () => {
      expect(getSeasonName(3)).toBe('Лето');
    });

    it('returns Осень for season 4', () => {
      expect(getSeasonName(4)).toBe('Осень');
    });

    it('returns empty string for undefined', () => {
      expect(getSeasonName(undefined)).toBe('');
    });
  });

  describe('formatEpisodeCount', () => {
    it('returns empty string when episodes is undefined', () => {
      expect(formatEpisodeCount(undefined)).toBe('');
    });

    it('returns ? when count is 0', () => {
      expect(formatEpisodeCount({ aired: 0, count: 0 })).toBe('?');
    });

    it('returns count when all episodes aired', () => {
      expect(formatEpisodeCount({ aired: 12, count: 12 })).toBe('12');
    });

    it('returns "aired / count" when partially aired', () => {
      expect(formatEpisodeCount({ aired: 6, count: 12 })).toBe('6 / 12');
    });
  });

  describe('isAnimeAiring', () => {
    it('returns true for ongoing anime', () => {
      const anime = { anime_status: { alias: 'ongoing' } } as AnimeCatalogItem;
      expect(isAnimeAiring(anime)).toBe(true);
    });

    it('returns false for released anime', () => {
      const anime = { anime_status: { alias: 'released' } } as AnimeCatalogItem;
      expect(isAnimeAiring(anime)).toBe(false);
    });

    it('returns false for announced anime', () => {
      const anime = { anime_status: { alias: 'announcement' } } as AnimeCatalogItem;
      expect(isAnimeAiring(anime)).toBe(false);
    });
  });

  describe('getPosterUrl', () => {
    const anime = {
      poster: {
        huge: '/posters/huge.jpg',
        medium: '/posters/medium.jpg',
        big: '/posters/big.jpg',
      },
    } as AnimeCatalogItem;

    it('returns huge poster by default', () => {
      expect(getPosterUrl(anime)).toBe('/posters/huge.jpg');
    });

    it('returns medium poster when huge not available', () => {
      const animeMedium = { poster: { medium: '/posters/medium.jpg', big: '/posters/big.jpg' } } as AnimeCatalogItem;
      expect(getPosterUrl(animeMedium)).toBe('/posters/medium.jpg');
    });

    it('returns big poster when huge and medium not available', () => {
      const animeBig = { poster: { big: '/posters/big.jpg' } } as AnimeCatalogItem;
      expect(getPosterUrl(animeBig)).toBe('/posters/big.jpg');
    });

    it('returns empty string when no poster', () => {
      const animeEmpty = { poster: null } as AnimeCatalogItem;
      expect(getPosterUrl(animeEmpty)).toBe('');
    });

    it('accepts custom size parameter', () => {
      expect(getPosterUrl(anime, 'medium')).toBe('/posters/medium.jpg');
    });
  });

  describe('getRatingDisplay', () => {
    it('returns 0.00 when rating is undefined', () => {
      expect(getRatingDisplay(undefined)).toBe('0.00');
    });

    it('formats rating to 2 decimal places', () => {
      expect(getRatingDisplay({ average: 8.567 })).toBe('8.57');
      expect(getRatingDisplay({ average: 8 })).toBe('8.00');
      expect(getRatingDisplay({ average: 10 })).toBe('10.00');
    });
  });
});