import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi, userListApi } from '@/lib/api';
import { useUser } from './useAuth';
import type { UserAnimeUpdate, AnimeStatus } from '@/types';
import { mapStatusToListId } from '@/types';
import { normalizeAnimeResponse, formatAnimeListResponse } from '@/lib/animeNormalizer';
import type { YummyUserAnimeRate } from '@/types/list';

// =============================================================================
// ANIME LIST / CATALOG
// =============================================================================

export function useAnimeList(
  params?: {
    page?: number;
    limit?: number;
    q?: string;
    search?: string;
    genres?: string | string[];
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
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['anime', 'catalog', params],
    queryFn: async () => {
      const response = await animeApi.getCatalog(params);
      const normalizedData = normalizeAnimeResponse(response);
      return formatAnimeListResponse(normalizedData);
    },
    enabled: options?.enabled ?? true,
  });
}

// =============================================================================
// ANIME SEARCH
// =============================================================================

export function useAnimeSearch(query: string, limit: number = 30) {
  return useQuery({
    queryKey: ['anime', 'search', query, limit],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await animeApi.search(query, limit);
      const normalizedData = normalizeAnimeResponse(response);
      return formatAnimeListResponse(normalizedData);
    },
    enabled: !!query.trim(),
  });
}

// =============================================================================
// ANIME DETAIL
// =============================================================================

export function useAnimeDetail(idOrUrl: string | number) {
  return useQuery({
    queryKey: ['anime', 'detail', idOrUrl],
    queryFn: async () => {
      const response = await animeApi.getByUrl(String(idOrUrl));
      
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        const keys = Object.keys(response);
        if (keys.length === 1 && !isNaN(Number(keys[0]))) {
          return response[keys[0]];
        }
      }
      
      return response;
    },
    enabled: !!idOrUrl,
  });
}

// =============================================================================
// RANDOM ANIME
// =============================================================================

export function useRandomAnime() {
  return useQuery({
    queryKey: ['anime', 'random'],
    queryFn: async () => {
      const randomAnime = await animeApi.getRandom();
      if (!randomAnime) return null;
      return randomAnime;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// =============================================================================
// ANIME SCREENSHOTS (from detail)
// =============================================================================

export function useAnimeScreenshots(id: number) {
  return useQuery({
    queryKey: ['anime', 'screenshots', id],
    queryFn: async () => {
      const { data } = await animeApi.getById(id);
      return data.screenshots || [];
    },
    enabled: !!id,
  });
}

// =============================================================================
// GENRES
// =============================================================================

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const result = await animeApi.getGenres();
      return result;
    },
  });
}

export function useGenreSearch() {
  return useQuery({
    queryKey: ['genre', 'search'],
    queryFn: async () => {
      const result = await animeApi.getGenres();
      return result ?? { genres: [] };
    },
  });
}

// =============================================================================
// USER ANIME LIST
// =============================================================================

export function useUserAnimeList(status?: AnimeStatus, favorites?: boolean) {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['user', 'anime', status, favorites],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        if (status) {
          const listId = mapStatusToListId(status);
          const rates = await userListApi.getUserList(user.id, listId) || [];
          return favorites 
            ? rates.filter((rate: YummyUserAnimeRate) => rate.user?.list?.is_fav === true)
            : rates;
        }
        
        const rates = await userListApi.getUserLists(user.id) || [];
        
        if (favorites) {
          return rates.filter((rate: YummyUserAnimeRate) => rate.user?.list?.is_fav === true);
        }
        
        return rates;
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            return [];
          }
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

// =============================================================================
// USER ANIME RATE FOR SPECIFIC ANIME
// =============================================================================

export function useUserAnimeRate(animeId: number) {
  return useQuery({
    queryKey: ['user', 'anime', 'rate', animeId],
    queryFn: async () => {
      try {
        const { data } = await userListApi.getAnimeList(animeId);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!animeId,
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { animeId: number; status: AnimeStatus; episodes?: number; score?: number; text?: string }) =>
      userListApi.addToList(data.animeId, {
        list: mapStatusToListId(data.status),
        episodes: data.episodes,
        score: data.score,
        text: data.text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useUpdateListEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animeId, data }: { animeId: number; data: UserAnimeUpdate }) =>
      userListApi.addToList(animeId, {
        list: data.status ? mapStatusToListId(data.status) : undefined,
        episodes: data.episodes,
        score: data.score,
        text: data.text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (animeId: number) => userListApi.removeFromList(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ animeId, isFavorite }: { animeId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        return userListApi.removeFromFavorites(animeId);
      } else {
        return userListApi.addToFavorites(animeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

// =============================================================================
// SCHEDULE
// =============================================================================

export function useSchedule() {
  return useQuery({
    queryKey: ['anime', 'schedule'],
    queryFn: async () => {
      const response = await animeApi.getSchedule();
      return response || [];
    },
  });
}

// =============================================================================
// FAVORITES
// =============================================================================

export function useFavorites() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const rates = await userListApi.getUserLists(user.id);
        return (rates || []).filter((rate: YummyUserAnimeRate) => rate.user?.list?.is_fav === true);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            return [];
          }
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}
