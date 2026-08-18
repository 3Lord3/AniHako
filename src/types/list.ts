import type { AnimeCatalogItem } from './anime';

/**
 * ID списка YummyAnime API:
 *   0 = watching (Смотрю)
 *   1 = planned  (В планах)
 *   2 = completed (Просмотрено)
 *   3 = dropped  (Брошено)
 *   5 = paused   (Отложено)
 *
 * `4` (favourite) — НЕ существует как отдельный список, фильтрация
 * выполняется через `user.list.is_fav` (см. `getUserLists` + `is_fav`).
 */
export type YummyAnimeListId = 0 | 1 | 2 | 3 | 5;

export type ListStatus = 'watching' | 'planned' | 'completed' | 'paused' | 'dropped';

/**
 * UI-only статус "Любимое" — никогда не отправляется в API напрямую.
 */
export type AnimeStatus = ListStatus | 'favourite';

export const API_STATUS_IDS: Record<ListStatus, YummyAnimeListId> = {
  watching: 0,
  planned: 1,
  completed: 2,
  dropped: 3,
  paused: 5,
};

export interface YummyUserAnimeRate {
  rating_counters?: number;
  season?: number;
  top?: {
    global: number;
    category: number;
  };
  views?: number;
  anime_id: number;
  anime_status?: {
    title: string;
    alias: string;
    value: number;
  };
  anime_url: string;
  date: number;
  genres?: Array<{
    title: string;
    id: number;
    alias: string;
    url: string;
  }>;
  poster: {
    small: string;
    medium: string;
    big: string;
    huge: string;
    fullsize: string;
    mega: string;
  };
  rating: number;
  title: string;
  type: {
    name: string;
    value: number;
    shortname: string;
    alias: string;
  };
  user?: {
    list?: {
      is_fav: boolean;
      list?: {
        title: string;
        href: string;
        id: 0 | 1 | 2 | 3 | 5;
      };
    };
    rating?: number;
  };
  year?: number;
  remote_ids?: {
    worldart_id?: number;
    shikimori_id?: number;
    myanimelist_id?: number;
    sr_id?: number;
    kp_id?: number;
    worldart_type?: string;
  };
}

export interface UserAnimeRate {
  id: number;
  user_id: number;
  anime_id: number;
  anime: AnimeCatalogItem;
  text: string | null;
  episodes: number;
  status: string;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserAnimeUpdate {
  status?: AnimeStatus | null;
  score?: number;
  episodes?: number;
  text?: string;
}

export function mapListIdToStatus(listId: number | undefined): AnimeStatus {
  switch (listId) {
    case 0: return 'watching';
    case 1: return 'planned';
    case 2: return 'completed';
    case 3: return 'dropped';
    case 5: return 'paused';
    default: return 'planned';
  }
}

export function mapStatusToListId(status: AnimeStatus): YummyAnimeListId {
  if (status === 'favourite') return 1; // 'favourite' is UI-only; fall back to "planned"
  return API_STATUS_IDS[status] ?? 1;
}
