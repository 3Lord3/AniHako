import { api } from './index';
import type { YummyAnimeDetailResponse, AnimeScheduleItem } from '../types/anime';
import type { GenreResponse } from '../types/genre';
import type { YummyAnimeListId } from '../types/list';

export interface CatalogParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  genre?: string | string[];
  from_year?: number;
  to_year?: number;
  min_rating?: number;
  sort_forward?: boolean;
  kind?: string;
  status?: string | string[];
  order?: string;
  mylist?: string;
  season?: string;
  offset?: number;
}

type CatalogApiParams = Record<string, string | number | boolean | undefined>;

function buildCatalogParams(params?: CatalogParams): CatalogApiParams {
  if (!params) return {};

  const out: CatalogApiParams = {};

  if (params.search != null) {
    out.q = params.search;
  } else if (params.q != null) {
    out.q = params.q;
  }

  if (params.limit != null) out.limit = params.limit;
  if (params.from_year != null) out.from_year = params.from_year;
  if (params.to_year != null) out.to_year = params.to_year;
  if (params.min_rating != null) out.min_rating = params.min_rating;
  if (params.sort_forward != null) out.sort_forward = params.sort_forward;
  if (params.kind != null) out.kind = params.kind;
  if (params.order != null) out.order = params.order;
  if (params.mylist != null) out.mylist = params.mylist;
  if (params.season != null) out.season = params.season;

  if (params.genre) {
    out.genres = Array.isArray(params.genre) ? params.genre.join(',') : params.genre;
  }

  if (Array.isArray(params.status)) {
    out.status = params.status.join(',');
  } else if (typeof params.status === 'string') {
    out.status = params.status;
  }

  if (params.page != null && params.offset == null) {
    out.offset = (params.page - 1) * (params.limit ?? 20);
  } else if (params.offset != null) {
    out.offset = params.offset;
  }

  return out;
}

export interface CatalogResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

const ARRAY_KEYS = ['response', 'data', 'items', 'results'] as const;

function extractPagination(obj: Record<string, unknown>): { page: number; totalPages: number; total: number } {
  const page = typeof obj.page === 'number' ? obj.page : 1;
  const totalPages = typeof obj.total_pages === 'number' ? obj.total_pages : 1;
  const total = typeof obj.total === 'number'
    ? obj.total
    : typeof obj.count === 'number' ? obj.count : 0;
  return { page, totalPages, total };
}

function unwrapCatalogResponse<T>(raw: unknown, depth = 0): CatalogResult<T> {
  if (depth > 3) {
    return { data: [], page: 1, totalPages: 1, total: 0 };
  }

  if (Array.isArray(raw)) {
    return { data: raw as T[], page: 1, totalPages: 1, total: raw.length };
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;

    for (const key of ARRAY_KEYS) {
      const value = obj[key];
      if (Array.isArray(value)) {
        return {
          data: value as T[],
          ...extractPagination(obj),
        };
      }
    }

    // Recurse into `data` if it's an object (handles `{ data: { response: [...] } }` etc.)
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      const inner = unwrapCatalogResponse<T>(obj.data, depth + 1);
      if (inner.data.length > 0) return inner;
    }

    // Numeric-keyed object: `{0: {...}, 1: {...}}` (optionally with pagination fields)
    const values = Object.values(obj).filter((v): v is T => v != null && typeof v === 'object');
    if (values.length > 0 && values.length >= Math.ceil(Object.keys(obj).length * 0.8)) {
      return {
        data: values,
        ...extractPagination(obj),
        total: extractPagination(obj).total || values.length,
      };
    }
  }

  return { data: [], page: 1, totalPages: 1, total: 0 };
}

export const animeApi = {
  getCatalog: async (params?: CatalogParams): Promise<CatalogResult<unknown>> => {
    try {
      const res = await api.get('/anime', { params: buildCatalogParams(params) });
      return unwrapCatalogResponse(res.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[animeApi.getCatalog] failed', { params, err });
      throw err;
    }
  },

  search: async (query: string, limit: number = 30): Promise<CatalogResult<unknown>> => {
    const safeLimit = Math.min(limit, 30);
    const res = await api.get('/search', {
      params: { q: query, limit: safeLimit },
      paramsSerializer: (params) =>
        `q=${encodeURIComponent(params.q)}&limit=${params.limit}`,
    });
    return unwrapCatalogResponse(res.data);
  },

  getByUrl: (url: string, options?: { needVideos?: boolean }) => {
    const params: Record<string, boolean> = {};
    if (options?.needVideos) params.need_videos = true;
    return api
      .get<{ response: YummyAnimeDetailResponse }>(`/anime/${url}`, { params })
      .then((res) => res.data.response);
  },

  getRandom: (excludeLists: YummyAnimeListId[] = [0, 1, 2, 3, 5]) =>
    api
      .get<{ response: unknown }>('/anime', {
        params: {
          sort: 'random',
          limit: 1,
          exclude_list: excludeLists,
        },
      })
      .then((res) => {
        if (res.status === 204 || !res.data) return null;

        let items: unknown = res.data.response;

        if (items && typeof items === 'object' && !Array.isArray(items)) {
          const keys = Object.keys(items as object);
          if (keys.length > 0 && keys.every((k) => !Number.isNaN(Number(k)))) {
            items = Object.values(items as object);
          }
        }

        const firstItem = Array.isArray(items) ? items[0] : items;
        return (firstItem as YummyAnimeDetailResponse | null) ?? null;
      })
      .catch(() => null),

  getGenres: () =>
    api
      .get<{ response: { genres: GenreResponse[]; groups: unknown[] } }>('/anime/genres')
      .then((res) => res.data.response || { genres: [] }),

  getSchedule: (): Promise<AnimeScheduleItem[]> =>
    api
      .get<{ response: AnimeScheduleItem[] }>('/anime/schedule')
      .then((res) => res.data.response),
};
