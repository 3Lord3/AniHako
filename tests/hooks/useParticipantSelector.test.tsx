import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useParticipantSelector } from '@/hooks/useParticipantSelector';
import type { YummyUserAnimeRate, AnimeCatalogItem } from '@/types';

const mockUseAnimeList = vi.fn();
vi.mock('@/hooks/useAnime', () => ({
  useAnimeList: (...args: unknown[]) => mockUseAnimeList(...args),
}));
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const makeRate = (id: number): YummyUserAnimeRate =>
  ({ anime_id: id, anime_url: `/${id}`, title: `Anime ${id}`, poster: {}, rating: 0, type: {}, date: 0 }) as unknown as YummyUserAnimeRate;

describe('useParticipantSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAnimeList.mockReturnValue({ data: { data: [] }, isLoading: false });
  });

  it('adds all remaining completed anime and clears the search', () => {
    const completedAnime = [makeRate(1), makeRate(2)];
    const selectedAnime = [makeRate(1)];
    const onSelectionChange = vi.fn();

    const { result } = renderHook(
      () => useParticipantSelector(completedAnime, selectedAnime, onSelectionChange),
      { wrapper: createWrapper() }
    );

    expect(result.current.remaining).toEqual([makeRate(2)]);

    act(() => {
      result.current.handleAddAllCompleted();
    });

    expect(onSelectionChange).toHaveBeenCalledWith([makeRate(1), makeRate(2)]);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.showDropdown).toBe(false);
  });

  it('adds a search result via toParticipantRate and clears the search', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(
      () => useParticipantSelector([], [], onSelectionChange),
      { wrapper: createWrapper() }
    );

    const found = { anime_id: 9, title: 'Found', anime_url: 'found' } as AnimeCatalogItem;
    act(() => {
      result.current.handleAddFromSearch(found);
    });

    expect(onSelectionChange).toHaveBeenCalledWith([
      expect.objectContaining({ anime_id: 9, title: 'Found', anime_url: 'found' }),
    ]);
    expect(result.current.searchQuery).toBe('');
  });

  it('removes an anime by id', () => {
    const selectedAnime = [makeRate(1), makeRate(2)];
    const onSelectionChange = vi.fn();
    const { result } = renderHook(
      () => useParticipantSelector([], selectedAnime, onSelectionChange),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.handleRemove(1);
    });

    expect(onSelectionChange).toHaveBeenCalledWith([makeRate(2)]);
  });

  it('clears the whole selection', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(
      () => useParticipantSelector([], [makeRate(1)], onSelectionChange),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.handleClearAll();
    });

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('excludes already-selected anime from search results', () => {
    mockUseAnimeList.mockReturnValue({
      data: { data: [{ anime_id: 1 }, { anime_id: 2 }] },
      isLoading: false,
    });
    const selectedAnime = [makeRate(1)];

    const { result } = renderHook(
      () => useParticipantSelector([], selectedAnime, vi.fn()),
      { wrapper: createWrapper() }
    );

    expect(result.current.availableResults).toEqual([{ anime_id: 2 }]);
  });

  it('clearSearch resets the query and closes the dropdown', () => {
    const { result } = renderHook(() => useParticipantSelector([], [], vi.fn()), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange({ target: { value: 'cow' } } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.searchQuery).toBe('cow');
    expect(result.current.showDropdown).toBe(true);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.showDropdown).toBe(false);
  });
});
