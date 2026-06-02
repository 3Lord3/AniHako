import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnimeList, useAnimeDetail, useRandomAnime, useGenres } from '@/hooks/useAnime';
import * as apiModule from '@/lib/api';

vi.mock('@/lib/api', () => ({
  animeApi: {
    getCatalog: vi.fn(),
    search: vi.fn(),
    getById: vi.fn(),
    getByUrl: vi.fn(),
    getRandom: vi.fn(),
    getGenres: vi.fn(),
  },
  userListApi: {
    getUserList: vi.fn(),
    getUserLists: vi.fn(),
    getAnimeList: vi.fn(),
    addToList: vi.fn(),
    removeFromList: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAnime hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAnimeList', () => {
    it('fetches anime list successfully', async () => {
      const mockResponse = [
        { anime_id: 1, title: 'Anime 1', poster: { small: '', medium: '/posters/1.jpg', big: '', huge: '', fullsize: '', mega: '' }, rating: { average: 8.5, counters: 100 }, year: 2024, type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' }, anime_status: { title: 'Вышло', alias: 'released', value: 0 }, anime_url: '/anime/1', description: '', views: 0, season: 1, episodes: { aired: 12, count: 12 } },
        { anime_id: 2, title: 'Anime 2', poster: { small: '', medium: '/posters/2.jpg', big: '', huge: '', fullsize: '', mega: '' }, rating: { average: 7.0, counters: 80 }, year: 2023, type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' }, anime_status: { title: 'Вышло', alias: 'released', value: 0 }, anime_url: '/anime/2', description: '', views: 0, season: 2, episodes: { aired: 24, count: 24 } },
      ];

      vi.mocked(apiModule.animeApi.getCatalog).mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useAnimeList({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data).toHaveLength(2);
      expect(apiModule.animeApi.getCatalog).toHaveBeenCalled();
    });

    it('handles error state', async () => {
      vi.mocked(apiModule.animeApi.getCatalog).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useAnimeList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useAnimeDetail', () => {
    it('fetches anime detail successfully', async () => {
      const mockData = {
        anime_id: 1,
        title: 'Detailed Anime',
        poster: { small: '', medium: '/posters/1.jpg', big: '', huge: '', fullsize: '', mega: '' },
        rating: { average: 9.0, counters: 100 },
        year: 2024,
        type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
        anime_status: { title: 'Вышло', alias: 'released', value: 0 },
        anime_url: '/anime/1',
        description: 'Full description',
        views: 0,
        season: 1,
        episodes: { aired: 12, count: 12 },
        genres: [],
      };

      vi.mocked(apiModule.animeApi.getByUrl).mockResolvedValueOnce(mockData as any);

      const { result } = renderHook(() => useAnimeDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(apiModule.animeApi.getByUrl).toHaveBeenCalledWith('1');
    });

    it('does not fetch when id is falsy', () => {
      renderHook(() => useAnimeDetail(0), {
        wrapper: createWrapper(),
      });

      expect(apiModule.animeApi.getByUrl).not.toHaveBeenCalled();
    });
  });

  describe('useRandomAnime', () => {
    it('fetches random anime successfully', async () => {
      const mockData = {
        anime_id: 42,
        title: 'Random Anime',
        poster: { small: '', medium: '/posters/42.jpg', big: '', huge: '', fullsize: '', mega: '' },
        rating: { average: 8.0, counters: 50 },
        year: 2024,
        type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
        anime_status: { title: 'Вышло', alias: 'released', value: 0 },
        anime_url: '/anime/42',
        description: null,
        views: 0,
        season: 1,
        episodes: { aired: 1, count: 1 },
      };

      vi.mocked(apiModule.animeApi.getRandom).mockResolvedValueOnce(mockData as any);

      const { result } = renderHook(() => useRandomAnime(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useGenres', () => {
    it('fetches genres successfully', async () => {
      const mockData = {
        genres: [
          { title: 'Action', href: '/genres/action', value: 1, group_id: 1 },
          { title: 'Comedy', href: '/genres/comedy', value: 2, group_id: 1 },
        ],
        groups: [],
      };

      vi.mocked(apiModule.animeApi.getGenres).mockResolvedValueOnce(mockData as any);

      const { result } = renderHook(() => useGenres(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });
});