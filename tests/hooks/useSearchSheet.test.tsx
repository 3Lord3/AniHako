import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useSearchSheet } from '@/hooks/useSearchSheet';

const mockUseAnimeSearch = vi.fn();
vi.mock('@/hooks/useAnime', () => ({
  useAnimeSearch: (...args: unknown[]) => mockUseAnimeSearch(...args),
}));
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('useSearchSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAnimeSearch.mockReturnValue({ data: { data: [] }, isLoading: false });
  });

  it('shows the empty state before typing anything', () => {
    const { result } = renderHook(() => useSearchSheet(true), { wrapper: createWrapper() });
    expect(result.current.showEmpty).toBe(true);
    expect(result.current.isTooShort).toBe(false);
    expect(result.current.showNoResults).toBe(false);
  });

  it('flags a query under the minimum length as too short and skips the search', () => {
    const { result } = renderHook(() => useSearchSheet(true), { wrapper: createWrapper() });

    act(() => {
      result.current.setQuery('ab');
    });

    expect(result.current.isTooShort).toBe(true);
    expect(mockUseAnimeSearch).toHaveBeenLastCalledWith('', 10);
  });

  it('searches once the query reaches the minimum length', () => {
    const { result } = renderHook(() => useSearchSheet(true), { wrapper: createWrapper() });

    act(() => {
      result.current.setQuery('cow');
    });

    expect(mockUseAnimeSearch).toHaveBeenLastCalledWith('cow', 10);
  });

  it('shows the no-results state for a long-enough query with an empty result list', () => {
    const { result } = renderHook(() => useSearchSheet(true), { wrapper: createWrapper() });

    act(() => {
      result.current.setQuery('xyz');
    });

    expect(result.current.showNoResults).toBe(true);
  });

  it('resets the query when the sheet closes', () => {
    const { result, rerender } = renderHook(({ open }) => useSearchSheet(open), {
      wrapper: createWrapper(),
      initialProps: { open: true },
    });

    act(() => {
      result.current.setQuery('cow');
    });
    expect(result.current.query).toBe('cow');

    rerender({ open: false });
    expect(result.current.query).toBe('');
  });

  it('clearQuery empties the query', () => {
    const { result } = renderHook(() => useSearchSheet(true), { wrapper: createWrapper() });

    act(() => {
      result.current.setQuery('cow');
    });
    act(() => {
      result.current.clearQuery();
    });

    expect(result.current.query).toBe('');
  });
});
