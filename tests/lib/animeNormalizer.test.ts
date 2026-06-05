import { describe, it, expect } from 'vitest';
import {
  extractPosterUrl,
  extractRating,
  extractAnimeKind,
  extractAnimeStatus,
  normalizeAnimeItem,
  normalizeAnimeResponse,
  formatAnimeListResponse,
} from '@/lib/animeNormalizer';

describe('animeNormalizer', () => {
  describe('extractPosterUrl', () => {
    it('returns null for falsy input', () => {
      expect(extractPosterUrl(null)).toBeNull();
      expect(extractPosterUrl(undefined)).toBeNull();
    });

    it('returns string as-is', () => {
      expect(extractPosterUrl('https://example.com/poster.jpg')).toBe('https://example.com/poster.jpg');
    });

    it('extracts huge size', () => {
      const poster = { huge: '/posters/huge.jpg', medium: '/posters/medium.jpg' };
      expect(extractPosterUrl(poster)).toBe('/posters/huge.jpg');
    });

    it('extracts mega size when huge is not available', () => {
      const poster = { mega: '/posters/mega.jpg', big: '/posters/big.jpg' };
      expect(extractPosterUrl(poster)).toBe('/posters/mega.jpg');
    });

    it('extracts big size when mega and huge are not available', () => {
      const poster = { big: '/posters/big.jpg', medium: '/posters/medium.jpg' };
      expect(extractPosterUrl(poster)).toBe('/posters/big.jpg');
    });

    it('extracts medium size when big, mega, huge are not available', () => {
      const poster = { medium: '/posters/medium.jpg', small: '/posters/small.jpg' };
      expect(extractPosterUrl(poster)).toBe('/posters/medium.jpg');
    });

    it('extracts small size when only small is available', () => {
      const poster = { small: '/posters/small.jpg' };
      expect(extractPosterUrl(poster)).toBe('/posters/small.jpg');
    });

    it('returns null when no sizes available', () => {
      expect(extractPosterUrl({})).toBeNull();
    });
  });

  describe('extractRating', () => {
    it('returns null when rating is undefined', () => {
      expect(extractRating(undefined)).toBeNull();
    });

    it('returns null when rating.average is undefined', () => {
      expect(extractRating({})).toBeNull();
    });

    it('extracts and formats rating to 2 decimal places', () => {
      expect(extractRating({ average: 8.567 })).toBe('8.57');
      expect(extractRating({ average: 8 })).toBe('8.00');
      expect(extractRating({ average: 10 })).toBe('10.00');
    });
  });

  describe('extractAnimeKind', () => {
    it('returns null when type is undefined', () => {
      expect(extractAnimeKind(undefined)).toBeNull();
    });

    it('extracts alias from type object', () => {
      expect(extractAnimeKind({ alias: 'tv' })).toBe('tv');
      expect(extractAnimeKind({ alias: 'movie' })).toBe('movie');
    });
  });

  describe('extractAnimeStatus', () => {
    it('returns null when animeStatus is undefined', () => {
      expect(extractAnimeStatus(undefined)).toBeNull();
    });

    it('extracts title from animeStatus object', () => {
      expect(extractAnimeStatus({ title: 'Онгоинг' })).toBe('Онгоинг');
      expect(extractAnimeStatus({ title: 'Вышло' })).toBe('Вышло');
    });
  });

  describe('normalizeAnimeItem', () => {
    it('normalizes a complete item', () => {
      const item = {
        anime_id: 123,
        title: 'Test Anime',
        anime_url: '/anime/123',
        rating: { average: 8.5 },
        type: { alias: 'tv' },
        anime_status: { title: 'Вышло' },
        year: 2024,
        description: 'Test description',
        episodes: 12,
        episodes_aired: 6,
        duration: 24,
        genres: [{ title: 'Action' }],
        poster: { mega: '/poster.jpg' },
      };

      const result = normalizeAnimeItem(item);

      expect(result.anime_id).toBe(123);
      expect(result.name).toBe('Test Anime');
      expect(result.russian).toBe('Test Anime');
      expect(result.anime_url).toBe('/anime/123');
      expect(result.score).toBe('8.50');
      expect(result.kind).toBe('tv');
      expect(result.status).toBe('Вышло');
      expect(result.year).toBe(2024);
      expect(result.description).toBe('Test description');
      expect(result.episodes).toBe(12);
      expect(result.episodes_aired).toBe(6);
    });

    it('handles minimal item', () => {
      const item = { anime_id: 1, title: 'Minimal' };
      const result = normalizeAnimeItem(item);

      expect(result.anime_id).toBe(1);
      expect(result.name).toBe('Minimal');
      expect(result.russian).toBe('Minimal');
      expect(result.cover).toBeNull();
      expect(result.kind).toBeNull();
      expect(result.score).toBeNull();
      expect(result.year).toBeNull();
    });

    it('uses anime_id as string for url when anime_url is missing', () => {
      const item = { anime_id: 456, title: 'Test' };
      const result = normalizeAnimeItem(item);
      expect(result.anime_url).toBe('456');
      expect(result.url).toBe('456');
    });
  });

  describe('normalizeAnimeResponse', () => {
    it('returns empty array for null input', () => {
      expect(normalizeAnimeResponse(null)).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
      expect(normalizeAnimeResponse(undefined)).toEqual([]);
    });

    it('handles object with numeric keys', () => {
      const response = {
        1: { anime_id: 1, title: 'Anime 1' },
        2: { anime_id: 2, title: 'Anime 2' },
      };
      const result = normalizeAnimeResponse(response);
      expect(result).toHaveLength(2);
      expect(result[0].anime_id).toBe(1);
      expect(result[1].anime_id).toBe(2);
    });

    it('handles array input', () => {
      const response = [
        { anime_id: 1, title: 'Anime 1' },
        { anime_id: 2, title: 'Anime 2' },
      ];
      const result = normalizeAnimeResponse(response);
      expect(result).toHaveLength(2);
    });

    it('filters out null items', () => {
      const response = [null, { anime_id: 1, title: 'Anime 1' }, undefined, null];
      const result = normalizeAnimeResponse(response);
      expect(result).toHaveLength(1);
    });
  });

  describe('formatAnimeListResponse', () => {
    it('formats data with pagination info', () => {
      const data = [{ anime_id: 1 }, { anime_id: 2 }];
      const result = formatAnimeListResponse(data);

      expect(result.data).toEqual(data);
      expect(result.page).toBe(1);
      expect(result.total_pages).toBe(1);
      expect(result.total).toBe(2);
    });

    it('handles empty data', () => {
      const result = formatAnimeListResponse([]);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});