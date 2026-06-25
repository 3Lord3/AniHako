import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi } from '@/api/anime';
import { userListApi } from '@/api/list';
import { useUser } from './useAuth';
import type { UserAnimeUpdate, AnimeStatus, YummyAnimeDetailResponse } from '@/types';
import { mapStatusToListId } from '@/types';
import { normalizeAnimeResponse, formatAnimeListResponse } from '@/api/normalizers/anime';
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
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['anime', 'catalog', params],
    queryFn: async () => {
      const result = await animeApi.getCatalog(params);
      const normalizedData = normalizeAnimeResponse(result.data);
      return formatAnimeListResponse(normalizedData, {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      });
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
      if (!query.trim()) return formatAnimeListResponse([]);
      const result = await animeApi.search(query, limit);
      const normalizedData = normalizeAnimeResponse(result.data);
      return formatAnimeListResponse(normalizedData, {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      });
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
    queryFn: () => animeApi.getByUrl(String(idOrUrl)),
    enabled: !!idOrUrl,
  });
}

// =============================================================================
// RANDOM ANIME
// =============================================================================

export function useRandomAnime() {
  return useQuery<YummyAnimeDetailResponse | null>({
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
