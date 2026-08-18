import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useCatalogPage } from '@/hooks/useCatalogPage';

const mockUseAnimeList = vi.fn();
const mockUseGenres = vi.fn();
const mockUseUserAnimeList = vi.fn();
vi.mock('@/hooks/useAnime', () => ({
  useAnimeList: (...args: unknown[]) => mockUseAnimeList(...args),
  useGenres: () => mockUseGenres(),
  useUserAnimeList: () => mockUseUserAnimeList(),
}));

describe('useCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    mockUseAnimeList.mockReturnValue({ data: { data: [] }, isLoading: false });
    mockUseGenres.mockReturnValue({ data: [] });
    mockUseUserAnimeList.mockReturnValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the initial search value from the URL', () => {
    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({ initialEntries: ['/catalog?search=naruto'] }),
    });
    expect(result.current.searchInput).toBe('naruto');
  });

  it('commits the debounced search input to the URL query params after 300ms', () => {
    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({ initialEntries: ['/catalog'] }),
    });

    act(() => {
      result.current.setSearchInput('bleach');
    });
    expect(mockUseAnimeList).toHaveBeenLastCalledWith(expect.objectContaining({ q: undefined }));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockUseAnimeList).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'bleach' }));
  });

  it('clears the committed search via clearSearch', () => {
    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({ initialEntries: ['/catalog?search=one-piece'] }),
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchInput).toBe('');
    expect(mockUseAnimeList).toHaveBeenLastCalledWith(expect.objectContaining({ q: undefined }));
  });

  it('toggles a genre on and off in the URL-backed genres list', () => {
    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({ initialEntries: ['/catalog'] }),
    });

    act(() => {
      result.current.toggleGenre('Shounen');
    });
    expect(result.current.genres).toBe('Shounen');
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.toggleGenre('Shounen');
    });
    expect(result.current.genres).toBe('');
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('clearFiltersOnly removes genre/rating/year filters', () => {
    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({
        initialEntries: ['/catalog?genres=Action&rating=7&to_year=2020&from_year=2010'],
      }),
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFiltersOnly();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.genres).toBe('');
    expect(result.current.toYear).toBe('');
    expect(result.current.fromYear).toBe('');
  });

  it('persists the view preference to localStorage', () => {
    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({ initialEntries: ['/catalog'] }),
    });

    act(() => {
      result.current.setView('list');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('catalogView', 'list');
  });

  it('restores the view preference from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('list');

    const { result } = renderHook(() => useCatalogPage(), {
      wrapper: createWrapper({ initialEntries: ['/catalog'] }),
    });

    expect(result.current.view).toBe('list');
  });
});
