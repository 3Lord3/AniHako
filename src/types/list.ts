import type { AnimeCatalogItem } from './anime';

export type YummyAnimeListId = 0 | 1 | 2 | 3 | 4 | 5;
export type AnimeStatus = 'watching' | 'completed' | 'dropped' | 'planned' | 'paused' | 'favourite';

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
  [key: string]: any;
}

export interface UserAnimeCreate {
  anime_id: number;
  status: AnimeStatus;
  score?: number;
  episodes?: number;
  text?: string;
}

export interface UserAnimeUpdate {
  status?: AnimeStatus | null;
  score?: number;
  episodes?: number;
  text?: string;
}

export interface UserListResponse {
  id: number;
  name: string;
  user_id: number;
  anime: UserAnimeRate[];
}

export interface UserAnimeResponse {
  anime_id: number;
  status: string | null;
  score: number | null;
  episodes_watched: number;
  is_favorite: boolean;
  anime: AnimeCatalogItem;
  [key: string]: any;
}

export const YUMMY_LIST_IDS = {
  watch_now: 0,
  will: 1,
  watched: 2,
  lost: 3,
  postpone: 5,
} as const;

export const API_STATUS_VALUES = {
  watching: 'watching',
  completed: 'completed',
  paused: 'paused',
  dropped: 'dropped',
  planned: 'planned',
  favourite: 'favourite',
} as const;

export const mapStatusToApi = (status: AnimeStatus): string => {
  return API_STATUS_VALUES[status] || status;
};

export const mapStatusFromApi = (apiStatus: string): AnimeStatus => {
  const statusMap: Record<string, AnimeStatus> = {
    watching: 'watching',
    completed: 'completed',
    paused: 'paused',
    dropped: 'dropped',
    planned: 'planned',
    favourite: 'favourite',
  };
  return statusMap[apiStatus] || 'planned';
};

export function mapListIdToStatus(listId: number | undefined): AnimeStatus {
  switch (listId) {
    case 0: return 'watching';
    case 1: return 'planned';
    case 2: return 'completed';
    case 3: return 'dropped';
    case 4: return 'favourite';
    case 5: return 'paused';
    default: return 'planned';
  }
}

export function mapStatusToListId(status: AnimeStatus): YummyAnimeListId {
  switch (status) {
    case 'watching': return 0;
    case 'planned': return 1;
    case 'completed': return 2;
    case 'dropped': return 3;
    case 'favourite': return 4;
    case 'paused': return 5;
    default: return 1;
  }
}
