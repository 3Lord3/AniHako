import { describe, it, expect } from 'vitest';
import {
  normalizeAnimeItem,
  normalizeAnimeResponse,
  formatAnimeListResponse,
} from '@/api/normalizers/anime';

describe('anime normalizer', () => {
  describe('normalizeAnimeItem', () => {
    it('normalizes a complete item', () => {
      const item = {
        anime_id: 123,
        title: 'Test Anime',
        anime_url: 'frieren',
        rating: { average: 8.5 },
        type: { alias: 'tv' },
        anime_status: { title: 'Вышло', alias: 'released' as const, value: 0 as const },
        year: 2024,
        description: 'Test description',
        episodes: { aired: 12, count: 12 },
        duration: 24,
        genres: [{ title: 'Action', id: 1, alias: 'action', url: '/g/action' }],
        poster: { mega: '/poster.jpg' },
      };

      const result = normalizeAnimeItem(item);

      expect(result.anime_id).toBe(123);
      expect(result.title).toBe('Test Anime');
      expect(result.anime_url).toBe('frieren');
      expect(result.rating.average).toBe(8.5);
      expect(result.type.alias).toBe('tv');
      expect(result.anime_status.alias).toBe('released');
      expect(result.year).toBe(2024);
      expect(result.description).toBe('Test description');
      expect(result.episodes.aired).toBe(12);
      expect(result.episodes.count).toBe(12);
    });

    it('falls back to anime_id as url when anime_url is missing', () => {
      const item = { anime_id: 456, title: 'Test' };
      const result = normalizeAnimeItem(item);
      expect(result.anime_url).toBe('456');
    });

    it('handles a poster as a string', () => {
      const item = { anime_id: 1, title: 'X', poster: '/p.jpg' };
      const result = normalizeAnimeItem(item);
      expect(result.poster).toEqual({
        small: '',
        medium: '',
        big: '',
        huge: '',
        fullsize: '',
        mega: '',
      });
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
      expect(result[0]?.anime_id).toBe(1);
      expect(result[1]?.anime_id).toBe(2);
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
      const data = [{ anime_id: 1 } as never, { anime_id: 2 } as never];
      const result = formatAnimeListResponse(data);

      expect(result.data).toEqual(data);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.total).toBe(2);
    });

    it('honors upstream pagination metadata', () => {
      const result = formatAnimeListResponse([], { page: 2, totalPages: 5, total: 100 });
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(result.total).toBe(100);
    });

    it('handles empty data', () => {
      const result = formatAnimeListResponse([]);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
