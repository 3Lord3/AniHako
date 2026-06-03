import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAnimeList, useAnimeDetail, useAnimeSearch, useRandomAnime, useGenres } from '@/hooks/useAnime';
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

  it('fetches anime catalog', async () => {
    const mockData = [{ anime_id: 1, title: 'Anime 1' }];
    vi.mocked(apiModule.animeApi.getCatalog).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useAnimeList({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('uses params in query', async () => {
    vi.mocked(apiModule.animeApi.getCatalog).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAnimeList({ page: 2, limit: 10, kind: 'tv' }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiModule.animeApi.getCatalog).toHaveBeenCalledWith(expect.objectContaining({
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
    vi.mocked(apiModule.animeApi.getByUrl).mockResolvedValueOnce(mockAnime);

    const { result } = renderHook(() => useAnimeDetail('anime-slug'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAnime);
  });
});

describe('useAnimeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches anime by query', async () => {
    const mockResults = [{ anime_id: 1, title: 'Search Result' }];
    vi.mocked(apiModule.animeApi.search).mockResolvedValueOnce(mockResults);

    const { result } = renderHook(() => useAnimeSearch('test'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('has query enabled only when query is not empty', async () => {
    vi.mocked(apiModule.animeApi.search).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAnimeSearch(''), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiModule.animeApi.search).not.toHaveBeenCalled();
  });
});

describe('useRandomAnime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches random anime', async () => {
    const mockAnime = { anime_id: 999, title: 'Random Anime' };
    vi.mocked(apiModule.animeApi.getRandom).mockResolvedValueOnce(mockAnime);

    const { result } = renderHook(() => useRandomAnime(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAnime);
  });

  it('returns null when no random anime available', async () => {
    vi.mocked(apiModule.animeApi.getRandom).mockResolvedValueOnce(null);

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
    vi.mocked(apiModule.animeApi.getGenres).mockResolvedValueOnce(mockGenres);

    const { result } = renderHook(() => useGenres(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGenres);
  });
});