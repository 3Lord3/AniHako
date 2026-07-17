import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userListApi } from '@/api/list';

vi.mock('@/api/index', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '@/api/index';

describe('userListApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserList', () => {
    it('fetches user list by user id and list id', async () => {
      const mockResponse = { data: { response: [{ anime_id: 1 }] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await userListApi.getUserList(123, 0);

      expect(api.get).toHaveBeenCalledWith('/users/123/lists/0');
      expect(result).toEqual([{ anime_id: 1 }]);
    });
  });

  describe('getUserLists', () => {
    it('fetches all user lists', async () => {
      const mockResponse = { data: { response: [{ anime_id: 1 }, { anime_id: 2 }] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await userListApi.getUserLists(123);

      expect(api.get).toHaveBeenCalledWith('/users/123/lists');
      expect(result).toHaveLength(2);
    });
  });

  describe('getAnimeList', () => {
    it('fetches anime list status for user', async () => {
      const mockResponse = { data: { list: 0, is_favorite: true } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      await userListApi.getAnimeList(456);

      expect(api.get).toHaveBeenCalledWith('/anime/456/list');
    });
  });

  describe('addToList', () => {
    it('adds anime to list with data', async () => {
      const mockResponse = { data: { anime_id: 1, status: 'watching' } };
      vi.mocked(api.put).mockResolvedValueOnce(mockResponse);

      await userListApi.addToList(123, {
        list: 0,
        episodes: 5,
        score: 8,
      });

      expect(api.put).toHaveBeenCalledWith('/anime/123/list', {
        list: 0,
        episodes: 5,
        score: 8,
      });
    });
  });

  describe('removeFromList', () => {
    it('removes anime from list', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

      await userListApi.removeFromList(123);

      expect(api.delete).toHaveBeenCalledWith('/anime/123/list');
    });
  });

  describe('addToFavorites', () => {
    it('adds anime to favorites', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

      await userListApi.addToFavorites(123);

      expect(api.put).toHaveBeenCalledWith('/anime/123/list/fav');
    });
  });

  describe('removeFromFavorites', () => {
    it('removes anime from favorites', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

      await userListApi.removeFromFavorites(123);

      expect(api.delete).toHaveBeenCalledWith('/anime/123/list/fav');
    });
  });

  describe('getVideoWatchHistoryPage', () => {
    it('requests a single page with limit/offset', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { response: [{ video_id: 1, anime_id: 5 }] },
      });

      const result = await userListApi.getVideoWatchHistoryPage({ limit: 100, offset: 0 });

      expect(api.get).toHaveBeenCalledWith('/video/watch-history', {
        params: { limit: 100, offset: 0 },
      });
      expect(result).toEqual([{ video_id: 1, anime_id: 5 }]);
    });

    it('returns empty array when response is missing', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

      const result = await userListApi.getVideoWatchHistoryPage({ limit: 100, offset: 0 });

      expect(result).toEqual([]);
    });
  });

  describe('getVideoWatchHistory', () => {
    it('walks through pages until a short page is returned', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({
          data: {
            response: Array.from({ length: 100 }, (_, i) => ({ video_id: i + 1, anime_id: 1 })),
          },
        })
        .mockResolvedValueOnce({
          data: {
            response: [{ video_id: 101, anime_id: 1 }],
          },
        });

      const result = await userListApi.getVideoWatchHistory();

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenNthCalledWith(1, '/video/watch-history', {
        params: { limit: 100, offset: 0 },
      });
      expect(api.get).toHaveBeenNthCalledWith(2, '/video/watch-history', {
        params: { limit: 100, offset: 100 },
      });
      expect(result).toHaveLength(101);
      expect(result[0]).toEqual({ video_id: 1, anime_id: 1 });
      expect(result[100]).toEqual({ video_id: 101, anime_id: 1 });
    });

    it('stops immediately when the first page is empty', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { response: [] } });

      const result = await userListApi.getVideoWatchHistory();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('markVideoViewed', () => {
    it('puts to /video/:id', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

      await userListApi.markVideoViewed(7);

      expect(api.put).toHaveBeenCalledWith('/video/7');
    });
  });

  describe('unmarkVideoViewed', () => {
    it('deletes /video/:id', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

      await userListApi.unmarkVideoViewed(7);

      expect(api.delete).toHaveBeenCalledWith('/video/7');
    });
  });
});
