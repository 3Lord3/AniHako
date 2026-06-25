import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAnimeList, useAnimeDetail, useAnimeSearch, useRandomAnime, useGenres } from '@/hooks/useAnime';
import * as animeApiModule from '@/api/anime';

vi.mock('@/api/anime', () => ({
  animeApi: {
    getCatalog: vi.fn(),
    search: vi.fn(),
    getByUrl: vi.fn(),
    getRandom: vi.fn(),
    getGenres: vi.fn(),
    getSchedule: vi.fn(),
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
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('useAnime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches anime catalog and exposes normalized data + pagination', async () => {
    vi.mocked(animeApiModule.animeApi.getCatalog).mockResolvedValueOnce({
      data: [{ anime_id: 1, title: 'Anime 1' }],
      page: 1,
      totalPages: 1,
      total: 1,
    });

    const { result } = renderHook(() => useAnimeList({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0]?.anime_id).toBe(1);
    expect(result.current.data?.total).toBe(1);
  });

  it('uses params in query', async () => {
    vi.mocked(animeApiModule.animeApi.getCatalog).mockResolvedValueOnce({
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
    });

    const { result } = renderHook(() => useAnimeList({ page: 2, limit: 10, kind: 'tv' }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(animeApiModule.animeApi.getCatalog).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      limit: 10,
      kind: 'tv',
    }));
  });
});

describe('useAnimeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches anime by url', async () => {
    const mockAnime = { anime_id: 456, title: 'URL Anime' };
    vi.mocked(animeApiModule.animeApi.getByUrl).mockResolvedValueOnce(mockAnime as never);

    const { result } = renderHook(() => useAnimeDetail('anime-slug'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAnime);
  });
});

describe('useAnimeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches anime by query and surfaces server pagination', async () => {
    vi.mocked(animeApiModule.animeApi.search).mockResolvedValueOnce({
      data: [{ anime_id: 1, title: 'Search Result' }],
      page: 1,
      totalPages: 5,
      total: 123,
    });

    const { result } = renderHook(() => useAnimeSearch('test'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.total).toBe(123);
    expect(result.current.data?.totalPages).toBe(5);
  });

  it('has query enabled only when query is not empty', async () => {
    vi.mocked(animeApiModule.animeApi.search).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAnimeSearch(''), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(animeApiModule.animeApi.search).not.toHaveBeenCalled();
  });
});

describe('useRandomAnime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches random anime', async () => {
    const mockAnime = { anime_id: 999, title: 'Random Anime' };
    vi.mocked(animeApiModule.animeApi.getRandom).mockResolvedValueOnce(mockAnime as never);

    const { result } = renderHook(() => useRandomAnime(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAnime);
  });

  it('returns null when no random anime available', async () => {
    vi.mocked(animeApiModule.animeApi.getRandom).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useRandomAnime(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useGenres', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches genres', async () => {
    const mockGenres = { genres: [{ id: 1, title: 'Action' }], groups: [] };
    vi.mocked(animeApiModule.animeApi.getGenres).mockResolvedValueOnce(mockGenres as never);

    const { result } = renderHook(() => useGenres(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGenres);
  });
});