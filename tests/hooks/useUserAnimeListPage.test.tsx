import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useUserAnimeListPage } from '@/hooks/useUserAnimeListPage';
import type { YummyUserAnimeRate } from '@/types';

const makeRate = (id: number, listId: 0 | 1 | 2 | 3 | 5, isFav = false): YummyUserAnimeRate =>
  ({
    anime_id: id,
    user: { list: { list: { id: listId, title: '', href: '' }, is_fav: isFav } },
  }) as unknown as YummyUserAnimeRate;

// listId 0 = watching, 2 = completed (see mapListIdToStatus)
const allRates = [makeRate(1, 0), makeRate(2, 0, true), makeRate(3, 2)];

const mockUseUserAnimeList = vi.fn();
vi.mock('@/hooks/useAnime', () => ({
  useUserAnimeList: (...args: unknown[]) => mockUseUserAnimeList(...args),
}));

describe('useUserAnimeListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserAnimeList.mockReturnValue({ data: allRates, isLoading: false });
  });

  it('fetches the list only once, unfiltered', () => {
    renderHook(() => useUserAnimeListPage(), { wrapper: createWrapper() });
    expect(mockUseUserAnimeList).toHaveBeenCalledTimes(1);
    expect(mockUseUserAnimeList).toHaveBeenCalledWith();
  });

  it('shows the full list and aggregate stats with no filters applied', () => {
    const { result } = renderHook(() => useUserAnimeListPage(), { wrapper: createWrapper() });

    expect(result.current.displayList).toEqual(allRates);
    expect(result.current.stats).toEqual({
      watching: 2,
      planned: 0,
      completed: 1,
      paused: 0,
      dropped: 0,
      favorites: 1,
    });
  });

  it('filters displayList client-side by status via selectStatus, without refetching', () => {
    const { result } = renderHook(() => useUserAnimeListPage(), {
      wrapper: createWrapper({ initialEntries: ['/list'] }),
    });

    act(() => {
      result.current.selectStatus('watching');
    });

    expect(result.current.displayList).toEqual([allRates[0], allRates[1]]);
    expect(result.current.stats.watching).toBe(2);
    expect(mockUseUserAnimeList).toHaveBeenCalledTimes(2);
  });

  it('filters displayList client-side by favorites via selectFavorites', () => {
    const { result } = renderHook(() => useUserAnimeListPage(), {
      wrapper: createWrapper({ initialEntries: ['/list'] }),
    });

    act(() => {
      result.current.selectFavorites();
    });

    expect(result.current.isFavorites).toBe(true);
    expect(result.current.displayList).toEqual([allRates[1]]);

    act(() => {
      result.current.selectFavorites();
    });
    expect(result.current.isFavorites).toBe(false);
  });

  it('combines status and favorites filters', () => {
    const { result } = renderHook(() => useUserAnimeListPage(), {
      wrapper: createWrapper({ initialEntries: ['/list'] }),
    });

    act(() => {
      result.current.selectStatus('watching');
    });
    act(() => {
      result.current.selectFavorites();
    });

    expect(result.current.displayList).toEqual([allRates[1]]);
  });
});
