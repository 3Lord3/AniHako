import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi } from '@/api/anime';
import { userListApi } from '@/api/list';
import { useUser } from './useAuth';
import type { UserAnimeUpdate, AnimeStatus, YummyAnimeDetailResponse, AnimeVideo, AnimeRateStats } from '@/types';
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
    queryFn: () => animeApi.getByUrl(String(idOrUrl), { needVideos: true }),
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

function invalidateOnRatingChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
  queryClient.invalidateQueries({ queryKey: ['anime', 'catalog'] });
  queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
}

/**
 * Ставит/обновляет оценку аниме через `PUT /anime/{id}/rate`.
 * Возвращает новые средний рейтинг ({@link AnimeRateStats}) для локального
 * обновления UI. После мутации инвалидируем кэш, чтобы карточки и
 * характеристики показали актуальный средний рейтинг.
 */
export function useRateAnime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animeId, rate }: { animeId: number; rate: number }): Promise<AnimeRateStats> =>
      animeApi.rate(animeId, rate),
    onSuccess: (data) => {
      invalidateOnRatingChange(queryClient);
      return data;
    },
  });
}

/**
 * Убирает оценку аниме через `DELETE /anime/{id}/rate`.
 */
export function useUnrateAnime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (animeId: number): Promise<AnimeRateStats> => animeApi.unrate(animeId),
    onSuccess: (data) => {
      invalidateOnRatingChange(queryClient);
      return data;
    },
  });
}

/**
 * Returns the episode titles (`ep_title`) the user watched for the anime.
 *
 * `/video/watch-history` has no `video_id`, only `anime_id` + `ep_title`.
 * History is per episode title, shared across dubbings and players, so the
 * cache stores `ep_title` strings: marking an episode in one dubbing shows
 * it in all others immediately, without refetch on dubbing switch.
 */
export function useVideoViews(animeId: number | null | undefined) {
  return useQuery<string[]>({
    queryKey: ['anime', 'video-views', animeId],
    queryFn: async () => {
      try {
        const history = await userListApi.getVideoWatchHistory();
        const watchedNumbers = new Set<string>();
        for (const item of history) {
          if (item.anime_id === animeId && typeof item.ep_title === 'string') {
            watchedNumbers.add(item.ep_title);
          }
        }
        return Array.from(watchedNumbers);
      } catch {
        // Network/auth/server error: degrade gracefully. The watched
        // indicators simply won't render for this page; auto-mark and
        // manual marking still work via optimistic updates.
        return [];
      }
    },
    enabled: typeof animeId === 'number' && animeId > 0,
    staleTime: 1000 * 30,
  });
}

/**
 * Marks/unmarks an episode via `PUT/DELETE /video/{videoId}` and updates the
 * `['anime', 'video-views', animeId]` cache by `ep_title`, shared across
 * dubbings. Optimistic update is visible in all dubbings immediately.
 *
 * The server tracks views per `video_id`, not per `ep_title`, so:
 *  - mark (`currentlyViewed: false`) - `PUT` on the current dubbing's
 *    `video_id` (idempotent; duplicate ep_title entries collapse in a Set);
 *  - unmark (`currentlyViewed: true`) - `DELETE` every `video_id` of the
 *    episode from the passed `videos` (all dubbings/players), keeping the
 *    server history in sync with the UI.
 *
 * `videos` is only used to map `ep_title -> video_id[]` on unmark and is
 * NOT part of the queryKey (the cache does not depend on the video list).
 *
 * `invalidateQueries` runs with `refetchType: 'none'` after the mutation so
 * the UI doesn't flicker; the cache refetches on the next mount or focus.
 */
export function useToggleVideoViewed(
  animeId: number | null | undefined,
  videos?: AnimeVideo[]
) {
  const queryClient = useQueryClient();
  const key = ['anime', 'video-views', animeId];

  return useMutation({
    mutationFn: async ({ epTitle, videoId, currentlyViewed }: { epTitle: string; videoId: number; currentlyViewed: boolean }) => {
      if (currentlyViewed) {
        // Unmark every video of the episode: the server tracks views per
        // video_id while the UI/cache works per ep_title. If all DELETEs
        // fail, throw so onError rolls back the optimistic update.
        const ids = videos?.filter((v) => v.number === epTitle).map((v) => v.video_id) ?? [videoId];
        const results = await Promise.allSettled(ids.map((id) => userListApi.unmarkVideoViewed(id)));
        if (results.every((r) => r.status === 'rejected')) {
          throw (results[0] as PromiseRejectedResult).reason;
        }
        return;
      }
      return userListApi.markVideoViewed(videoId);
    },
    onMutate: async ({ epTitle, currentlyViewed }) => {
      if (typeof animeId !== 'number' || animeId <= 0) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (old) => {
        const list = old ?? [];
        if (currentlyViewed) return list.filter((t) => t !== epTitle);
        return list.includes(epTitle) ? list : [...list, epTitle];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!context || context.previous === undefined) return;
      queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      // Mark as stale for next refetch (focus, remount) but don't refetch
      // immediately — the optimistic update in onMutate is the source of
      // truth until the next natural refetch, avoiding a flicker when the
      // server hasn't yet processed the mutation.
      queryClient.invalidateQueries({ queryKey: key, refetchType: 'none' });
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
