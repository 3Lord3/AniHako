import { api } from './index';
import type { YummyAnimeDetailResponse } from '../types/anime';
import type { GenreResponse } from '../types/genre';

export const animeApi = {
  getCatalog: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    search?: string;
    genre?: string | string[];
    from_year?: number;
    to_year?: number;
    kind?: string;
    status?: string;
    order?: string;
    mylist?: string;
    min_rating?: number;
  }) => {
    const offset = params?.page ? (params.page - 1) * (params.limit || 20) : undefined;
    const searchQuery = params?.q || params?.search;
    const queryParams = {
      ...params,
      q: searchQuery,
      search: undefined,
      offset,
      page: undefined,
    };
    
    if (queryParams.genre) {
      if (Array.isArray(queryParams.genre)) {
        queryParams.genres = queryParams.genre.join(',') as any;
      } else {
        queryParams.genres = queryParams.genre;
      }
      queryParams.genre = undefined;
    }
    
    return api.get<{ response: any[] }>('/anime', { 
      params: queryParams,
    }).then(res => res.data.response);
  },

  search: (query: string, limit: number = 30) => {
    const safeLimit = Math.min(limit, 30);
    return api.get<{ response: any[] }>('/search', {
      params: {
        q: query,
        limit: safeLimit,
      },
      paramsSerializer: (params) => {
        return `q=${encodeURIComponent(params.q)}&limit=${params.limit}`;
      }
    }).then(res => res.data.response);
  },

  getById: (id: number) =>
    api.get<{ response: YummyAnimeDetailResponse }>(`/anime/${id}`)
      .then(res => res.data.response),

  getByUrl: (url: string) =>
    api.get<{ response: YummyAnimeDetailResponse }>(`/anime/${url}`)
      .then(res => res.data.response),

  getRandom: (excludeLists: string[] = ['0', '1', '2', '3', '4', '5']) =>
    api.get<{ response: any }>('/anime', {
      params: {
        sort: 'random',
        limit: 1,
        exclude_list: excludeLists
      }
    }).then(res => {
      if (res.status === 204 || !res.data) return null;

      let items = res.data.response;

      if (items && typeof items === 'object' && !Array.isArray(items)) {
        const keys = Object.keys(items);
        if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
          items = Object.values(items);
        }
      }

      const firstItem = Array.isArray(items) ? items[0] : items;
      return firstItem || null;
    }).catch(() => null),

  getGenres: () =>
    api.get<{ response: { genres: GenreResponse[]; groups: unknown[] } }>('/anime/genres')
      .then(res => res.data.response || { genres: [] }),
};
