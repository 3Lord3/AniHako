import { mapListIdToStatus } from '@/types';
import type { AnimeStatus } from '@/types';

/** Общая форма пользовательской пометки списка, встречается и у `YummyUserAnimeRate`, и у `AnimeViewingOrder`. */
export interface HasUserListInfo {
  user?: {
    list?: {
      is_fav?: boolean;
      list?: {
        id?: number;
      };
    };
  };
}

export function getRateStatus(rate: HasUserListInfo): AnimeStatus {
  return mapListIdToStatus(rate.user?.list?.list?.id);
}

export function isRateFavorite(rate: HasUserListInfo): boolean {
  return rate.user?.list?.is_fav === true;
}

export interface ListStats {
  watching: number;
  planned: number;
  completed: number;
  paused: number;
  dropped: number;
  favorites: number;
}

export function countListStats(rates: HasUserListInfo[]): ListStats {
  const stats: ListStats = { watching: 0, planned: 0, completed: 0, paused: 0, dropped: 0, favorites: 0 };
  for (const rate of rates) {
    const status = getRateStatus(rate);
    if (status in stats && status !== 'favourite') {
      stats[status as keyof Omit<ListStats, 'favorites'>] += 1;
    }
    if (isRateFavorite(rate)) {
      stats.favorites += 1;
    }
  }
  return stats;
}
