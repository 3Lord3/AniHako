import { describe, it, expect } from 'vitest';
import { getRateStatus, isRateFavorite, countListStats, type HasUserListInfo } from '@/lib/listRate';

const rate = (listId?: number, isFav = false): HasUserListInfo => ({
  user: { list: { list: listId !== undefined ? { id: listId as 0 | 1 | 2 | 3 | 5 } : undefined, is_fav: isFav } },
});

describe('getRateStatus', () => {
  it('maps known list ids to statuses', () => {
    expect(getRateStatus(rate(0))).toBe('watching');
    expect(getRateStatus(rate(1))).toBe('planned');
    expect(getRateStatus(rate(2))).toBe('completed');
    expect(getRateStatus(rate(3))).toBe('dropped');
    expect(getRateStatus(rate(5))).toBe('paused');
  });

  it('defaults to planned when list id is missing', () => {
    expect(getRateStatus({})).toBe('planned');
  });
});

describe('isRateFavorite', () => {
  it('returns true only when is_fav is exactly true', () => {
    expect(isRateFavorite(rate(0, true))).toBe(true);
    expect(isRateFavorite(rate(0, false))).toBe(false);
    expect(isRateFavorite({})).toBe(false);
  });
});

describe('countListStats', () => {
  it('counts rates per status and favorites independently', () => {
    const rates = [
      rate(0, true),
      rate(0),
      rate(1),
      rate(2),
      rate(2),
      rate(3),
      rate(5),
    ];
    expect(countListStats(rates)).toEqual({
      watching: 2,
      planned: 1,
      completed: 2,
      paused: 1,
      dropped: 1,
      favorites: 1,
    });
  });

  it('returns all-zero stats for an empty list', () => {
    expect(countListStats([])).toEqual({
      watching: 0,
      planned: 0,
      completed: 0,
      paused: 0,
      dropped: 0,
      favorites: 0,
    });
  });
});
