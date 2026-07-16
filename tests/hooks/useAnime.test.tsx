import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAnimeList, useAnimeDetail, useAnimeSearch, useRandomAnime, useGenres, useVideoViews, useToggleVideoViewed } from '@/hooks/useAnime';
import * as animeApiModule from '@/api/anime';
import { userListApi } from '@/api/list';

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

vi.mock('@/api/list', () => ({
  userListApi: {
    addToList: vi.fn(),
    getVideoWatchHistory: vi.fn(),
    markVideoViewed: vi.fn(),
    unmarkVideoViewed: vi.fn(),
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

describe('useVideoViews', () => {
  const videos = [
    { video_id: 100, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '1', date: 0, index: 1, views: 0, duration: 0 },
    { video_id: 200, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '2', date: 0, index: 2, views: 0, duration: 0 },
    { video_id: 300, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '3', date: 0, index: 3, views: 0, duration: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches video watch history and maps ep_title to video_id', async () => {
    vi.mocked(userListApi.getVideoWatchHistory).mockResolvedValueOnce([
      { anime_id: 42, ep_title: '1' },
      { anime_id: 42, ep_title: '3' },
      { anime_id: 99, ep_title: '1' },
    ]);

    const { result } = renderHook(() => useVideoViews(42, videos), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userListApi.getVideoWatchHistory).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([100, 300]);
  });

  it('refetches when the videos list changes (signature in queryKey)', async () => {
    vi.mocked(userListApi.getVideoWatchHistory).mockResolvedValue([
      { anime_id: 42, ep_title: '1' },
    ]);

    const initial = [
      { video_id: 100, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '1', date: 0, index: 1, views: 0, duration: 0 },
    ];
    const rerendered = [
      { video_id: 999, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '1', date: 0, index: 1, views: 0, duration: 0 },
    ];

    const { result, rerender } = renderHook(
      ({ v }) => useVideoViews(42, v),
      { wrapper: createWrapper(), initialProps: { v: initial } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([100]);

    rerender({ v: rerendered });
    await waitFor(() => expect(result.current.data).toEqual([999]));
    expect(userListApi.getVideoWatchHistory).toHaveBeenCalledTimes(2);
  });

  it('degrades gracefully on error (returns empty array)', async () => {
    vi.mocked(userListApi.getVideoWatchHistory).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useVideoViews(42, videos), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array when no entries match the anime', async () => {
    vi.mocked(userListApi.getVideoWatchHistory).mockResolvedValueOnce([
      { anime_id: 99, ep_title: '1' },
    ]);

    const { result } = renderHook(() => useVideoViews(42, videos), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when videos list is empty (anime not loaded yet)', () => {
    vi.mocked(userListApi.getVideoWatchHistory).mockClear();

    const { result } = renderHook(() => useVideoViews(42, []), { wrapper: createWrapper() });

    expect(userListApi.getVideoWatchHistory).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('is disabled when animeId is 0, null, or videos are missing', () => {
    vi.mocked(userListApi.getVideoWatchHistory).mockClear();

    renderHook(() => useVideoViews(0, videos), { wrapper: createWrapper() });
    renderHook(() => useVideoViews(null, videos), { wrapper: createWrapper() });
    renderHook(() => useVideoViews(42, undefined), { wrapper: createWrapper() });

    expect(userListApi.getVideoWatchHistory).not.toHaveBeenCalled();
  });
});

describe('useToggleVideoViewed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls markVideoViewed when currentlyViewed=false (not yet viewed, mark it)', async () => {
    vi.mocked(userListApi.markVideoViewed).mockResolvedValueOnce({ data: {} } as never);

    const { result } = renderHook(() => useToggleVideoViewed(1), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ videoId: 100, currentlyViewed: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userListApi.markVideoViewed).toHaveBeenCalledWith(100);
  });

  it('calls unmarkVideoViewed when currentlyViewed=true (already viewed, unmark it)', async () => {
    vi.mocked(userListApi.unmarkVideoViewed).mockResolvedValueOnce({ data: {} } as never);

    const { result } = renderHook(() => useToggleVideoViewed(1), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ videoId: 100, currentlyViewed: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userListApi.unmarkVideoViewed).toHaveBeenCalledWith(100);
  });

  it('optimistically adds the video id to cache when marking viewed', async () => {
    let resolveMark!: () => void;
    vi.mocked(userListApi.markVideoViewed).mockImplementationOnce(
      () => new Promise((resolve) => { resolveMark = () => resolve({ data: {} } as never); })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );

    // Match the queryKey that useVideoViews produces: includes videosSignature.
    const videos = [
      { video_id: 1, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '1', date: 0, index: 1, views: 0, duration: 0 },
    ];
    const videosSignature = videos.map((v) => v.video_id).join(',');
    queryClient.setQueryData(['anime', 'video-views', 1, videosSignature], [10]);

    const { result } = renderHook(() => useToggleVideoViewed(1, videos), { wrapper });

    act(() => {
      result.current.mutate({ videoId: 20, currentlyViewed: false });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<number[]>(['anime', 'video-views', 1, videosSignature]);
      expect(cached).toEqual([10, 20]);
    });

    resolveMark();
  });

  it('optimistically removes the video id from cache when unmarking', async () => {
    let resolveUnmark!: () => void;
    vi.mocked(userListApi.unmarkVideoViewed).mockImplementationOnce(
      () => new Promise((resolve) => { resolveUnmark = () => resolve({ data: {} } as never); })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );

    const videos = [
      { video_id: 1, iframe_url: '', data: { dubbing: '', player: '', player_id: 0 }, number: '1', date: 0, index: 1, views: 0, duration: 0 },
    ];
    const videosSignature = videos.map((v) => v.video_id).join(',');
    queryClient.setQueryData(['anime', 'video-views', 1, videosSignature], [10, 20]);

    const { result } = renderHook(() => useToggleVideoViewed(1, videos), { wrapper });

    act(() => {
      result.current.mutate({ videoId: 10, currentlyViewed: true });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<number[]>(['anime', 'video-views', 1, videosSignature]);
      expect(cached).toEqual([20]);
    });

    resolveUnmark();
  });

  it('invalidates video-views cache with refetchType "none" after settle', async () => {
    vi.mocked(userListApi.markVideoViewed).mockResolvedValueOnce({ data: {} } as never);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useToggleVideoViewed(1), { wrapper });

    await act(async () => {
      result.current.mutate({ videoId: 5, currentlyViewed: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const ourCall = invalidateSpy.mock.calls.find(([arg]) => {
      const key = (arg as { queryKey: unknown[] })?.queryKey;
      return Array.isArray(key) && key[0] === 'anime' && key[1] === 'video-views';
    });
    expect(ourCall).toBeDefined();
    expect((ourCall?.[0] as { refetchType?: string }).refetchType).toBe('none');
  });
});
