import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useHomePage } from '@/hooks/useHomePage';
import * as useAnimeModule from '@/hooks/useAnime';

vi.mock('@/hooks/useAnime', () => ({
  useSchedule: vi.fn(),
  useAnimeList: vi.fn(),
}));

const item = (animeId: number, nextDate?: number) =>
  ({ anime_id: animeId, episodes: { next_date: nextDate } }) as unknown;

describe('useHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAnimeModule.useAnimeList).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useAnimeList>);
  });

  it('defaults to today and shows only today\'s items', () => {
    const today = new Date();
    const todayTs = Math.floor(today.getTime() / 1000);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [item(1, todayTs)],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    const { result } = renderHook(() => useHomePage(), { wrapper: createWrapper() });

    expect(result.current.selectedDateKey).toBe(today.toDateString());
    expect(result.current.displayItems).toHaveLength(1);
    expect(result.current.sortedDates).toContain(today.toDateString());
  });

  it('switches displayItems when selecting another date', () => {
    const day1 = Math.floor(new Date('2026-03-05T10:00:00').getTime() / 1000);
    const day2 = Math.floor(new Date('2026-03-06T10:00:00').getTime() / 1000);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [item(1, day1), item(2, day2)],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    const { result } = renderHook(() => useHomePage(), { wrapper: createWrapper() });

    act(() => {
      result.current.selectDate(new Date(day2 * 1000).toDateString());
    });

    expect(result.current.displayItems).toEqual([item(2, day2)]);
  });

  it('exposes the current season name and year', () => {
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    const { result } = renderHook(() => useHomePage(), { wrapper: createWrapper() });

    expect(result.current.currentYear).toBe(new Date().getFullYear());
    expect(typeof result.current.seasonName).toBe('string');
    expect(result.current.seasonName.length).toBeGreaterThan(0);
  });
});
