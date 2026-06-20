import { describe, it, expect, vi, beforeEach } from 'vitest';
import { animeApi } from '@/api/anime';

vi.mock('@/api/index', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '@/api/index';

describe('animeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCatalog', () => {
    it('fetches catalog with default params', async () => {
      const mockResponse = { data: { response: [{ anime_id: 1 }] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await animeApi.getCatalog();

      expect(api.get).toHaveBeenCalledWith('/anime', expect.objectContaining({ params: expect.any(Object) }));
    });

    it('calculates offset from page and limit', async () => {
      const mockResponse = { data: { response: [] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await animeApi.getCatalog({ page: 3, limit: 20 });

      expect(api.get).toHaveBeenCalledWith('/anime', expect.objectContaining({
        params: expect.objectContaining({ offset: 40 }),
      }));
    });

    it('normalizes genre array to comma-separated string', async () => {
      const mockResponse = { data: { response: [] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await animeApi.getCatalog({ genre: ['action', 'comedy'] });

      expect(api.get).toHaveBeenCalledWith('/anime', expect.objectContaining({
        params: expect.objectContaining({ genres: 'action,comedy' }),
      }));
    });

    it('uses q param for search query', async () => {
      const mockResponse = { data: { response: [] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await animeApi.getCatalog({ q: 'attack on titan' });

      expect(api.get).toHaveBeenCalledWith('/anime', expect.objectContaining({
        params: expect.objectContaining({ q: 'attack on titan' }),
      }));
    });
  });

  describe('search', () => {
    it('limits query to 30 results', async () => {
      const mockResponse = { data: { response: [] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await animeApi.search('query', 100);

      expect(api.get).toHaveBeenCalledWith('/search', expect.objectContaining({
        params: expect.objectContaining({ limit: 30 }),
      }));
    });

    it('uses custom limit up to 30', async () => {
      const mockResponse = { data: { response: [] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await animeApi.search('query', 20);

      expect(api.get).toHaveBeenCalledWith('/search', expect.objectContaining({
        params: expect.objectContaining({ limit: 20 }),
      }));
    });
  });

  describe('getById', () => {
    it('fetches anime by id', async () => {
      const mockResponse = { data: { response: { anime_id: 123 } } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await animeApi.getById(123);

      expect(api.get).toHaveBeenCalledWith('/anime/123');
      expect(result).toEqual({ anime_id: 123 });
    });
  });

  describe('getByUrl', () => {
    it('fetches anime by url', async () => {
      const mockResponse = { data: { response: { anime_id: 456, anime_url: 'anime-slug' } } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await animeApi.getByUrl('anime-slug');

      expect(api.get).toHaveBeenCalledWith('/anime/anime-slug');
      expect(result).toEqual({ anime_id: 456, anime_url: 'anime-slug' });
    });
  });

  describe('getRandom', () => {
    it('excludes user lists by default', async () => {
      const mockResponse = { data: { response: { anime_id: 1 } } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await animeApi.getRandom();

      expect(api.get).toHaveBeenCalledWith('/anime', expect.objectContaining({
        params: expect.objectContaining({
          sort: 'random',
          limit: 1,
          exclude_list: ['0', '1', '2', '3', '4', '5'],
        }),
      }));
    });

    it('returns null on 204 status', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ status: 204, data: null });

      const result = await animeApi.getRandom();

      expect(result).toBeNull();
    });

    it('handles object response with numeric keys', async () => {
      const mockResponse = {
        data: {
          response: {
            1: { anime_id: 1, title: 'Anime 1' },
            2: { anime_id: 2, title: 'Anime 2' },
          },
        },
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await animeApi.getRandom();

      expect(result).toEqual({ anime_id: 1, title: 'Anime 1' });
    });

    it('returns null on error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      const result = await animeApi.getRandom();

      expect(result).toBeNull();
    });
  });

  describe('getGenres', () => {
    it('fetches genres', async () => {
      const mockResponse = {
        data: {
          response: {
            genres: [{ id: 1, title: 'Action' }],
            groups: [],
          },
        },
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await animeApi.getGenres();

      expect(api.get).toHaveBeenCalledWith('/anime/genres');
      expect(result.genres).toContainEqual({ id: 1, title: 'Action' });
    });

    it('returns empty genres when response is empty', async () => {
      const mockResponse = { data: { response: null } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await animeApi.getGenres();

      expect(result.genres).toEqual([]);
    });
  });
});