import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useAnimeSearchQuery } from '@/hooks/useAnimeSearchQuery';

const mockUseAnimeList = vi.fn();
vi.mock('@/hooks/useAnime', () => ({
  useAnimeList: (...args: unknown[]) => mockUseAnimeList(...args),
}));
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('useAnimeSearchQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAnimeList.mockReturnValue({ data: { data: [] }, isLoading: false });
  });

  it('does not enable the query until the minimum length is reached', () => {
    renderHook(() => useAnimeSearchQuery('ab', { minLength: 3 }), { wrapper: createWrapper() });
    expect(mockUseAnimeList).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'ab' }),
      expect.objectContaining({ enabled: false })
    );
  });

  it('enables the query once the minimum length is reached', () => {
    renderHook(() => useAnimeSearchQuery('abc', { minLength: 3 }), { wrapper: createWrapper() });
    expect(mockUseAnimeList).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'abc' }),
      expect.objectContaining({ enabled: true })
    );
  });

  it('respects an externally forced disabled state', () => {
    renderHook(() => useAnimeSearchQuery('abc', { minLength: 3, enabled: false }), { wrapper: createWrapper() });
    expect(mockUseAnimeList).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'abc' }),
      expect.objectContaining({ enabled: false })
    );
  });

  it('filters results through the exclude predicate', () => {
    mockUseAnimeList.mockReturnValue({
      data: { data: [{ anime_id: 1 }, { anime_id: 2 }] },
      isLoading: false,
    });

    const { result } = renderHook(
      () => useAnimeSearchQuery('abc', { minLength: 3, exclude: (item) => item.anime_id === 2 }),
      { wrapper: createWrapper() }
    );

    expect(result.current.results).toEqual([{ anime_id: 1 }]);
  });

  it('defaults to an empty results array when there is no data', () => {
    mockUseAnimeList.mockReturnValue({ data: undefined, isLoading: true });
    const { result } = renderHook(() => useAnimeSearchQuery('abc'), { wrapper: createWrapper() });
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
