import { describe, it, expect } from 'vitest';
import { formatDayMonth, groupByDate } from '@/lib/schedule';
import type { AnimeScheduleItem } from '@/types/anime';

describe('formatDayMonth', () => {
  it('returns an empty string for a falsy or missing timestamp', () => {
    expect(formatDayMonth(0)).toBe('');
    expect(formatDayMonth(undefined)).toBe('');
  });

  it('formats a unix timestamp as day + short month in Russian', () => {
    const timestamp = new Date('2026-03-05T00:00:00Z').getTime() / 1000;
    expect(formatDayMonth(timestamp)).toMatch(/5.*мар/i);
  });
});

const item = (animeId: number, nextDate?: number): AnimeScheduleItem =>
  ({ anime_id: animeId, episodes: { next_date: nextDate } }) as unknown as AnimeScheduleItem;

describe('groupByDate', () => {
  it('groups items sharing the same next_date day', () => {
    const day = new Date('2026-03-05T10:00:00').getTime() / 1000;
    const sameDayLater = new Date('2026-03-05T22:00:00').getTime() / 1000;
    const groups = groupByDate([item(1, day), item(2, sameDayLater)]);

    expect(groups.size).toBe(1);
    const [items] = Array.from(groups.values());
    expect(items).toHaveLength(2);
  });

  it('skips items without a next_date', () => {
    const groups = groupByDate([item(1, undefined)]);
    expect(groups.size).toBe(0);
  });

  it('splits items across separate date keys', () => {
    const day1 = new Date('2026-03-05T10:00:00').getTime() / 1000;
    const day2 = new Date('2026-03-06T10:00:00').getTime() / 1000;
    const groups = groupByDate([item(1, day1), item(2, day2)]);
    expect(groups.size).toBe(2);
  });
});
