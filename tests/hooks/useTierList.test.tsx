import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTierList } from '@/hooks/useTierList';
import { createEmptyTierList, UNRANKED_TIER_ID } from '@/types/tier';

vi.mock('@/hooks/useAnime', () => ({
  useUserAnimeList: vi.fn(),
}));

import { useUserAnimeList } from '@/hooks/useAnime';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTierList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUserAnimeList).mockReturnValue({ data: [] } as any);
  });

  it('starts with the default empty tier list before a userId is known', () => {
    const { result } = renderHook(() => useTierList(undefined), { wrapper: createWrapper() });
    expect(result.current.state).toEqual(createEmptyTierList());
  });

  it('loads the persisted list once userId resolves', async () => {
    const stored = createEmptyTierList();
    stored.items[1] = { animeId: 1, title: 'A', posterUrl: 'a.jpg', url: 'a' };
    stored.order[UNRANKED_TIER_ID] = [1];
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(stored));

    const { result } = renderHook(() => useTierList(42), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.state.items[1]).toBeDefined());
    expect(localStorage.getItem).toHaveBeenCalledWith('anitier:v1:42');
  });

  it('seeds newly watched anime into the unranked pool without duplicating', async () => {
    vi.mocked(useUserAnimeList).mockReturnValue({
      data: [{ anime_id: 10, anime_url: 'x', title: 'X', poster: { small: 's.jpg' } }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useTierList(42), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.state.order[UNRANKED_TIER_ID]).toContain(10));
    expect(result.current.state.items[10].title).toBe('X');
  });

  it('persists state to localStorage after mutations', async () => {
    const { result } = renderHook(() => useTierList(42), { wrapper: createWrapper() });
    await waitFor(() => expect(localStorage.getItem).toHaveBeenCalled());

    act(() => {
      result.current.addAnime({ animeId: 5, title: 'Y', posterUrl: 'y.jpg', url: 'y' });
    });

    await waitFor(() =>
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'anitier:v1:42',
        expect.stringContaining('"animeId":5')
      )
    );
  });

  it('exposes tier editing actions', () => {
    const { result } = renderHook(() => useTierList(42), { wrapper: createWrapper() });

    act(() => {
      result.current.renameTier('tier-s', 'Legendary');
    });

    expect(result.current.state.tiers.find((t) => t.id === 'tier-s')?.label).toBe('Legendary');
  });
});
