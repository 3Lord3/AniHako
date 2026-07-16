import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi } from '@/api/anime';
import { userListApi } from '@/api/list';
import { useUser } from './useAuth';
import type { UserAnimeUpdate, AnimeStatus, YummyAnimeDetailResponse, AnimeVideo } from '@/types';
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

/**
 * Возвращает множество просмотренных `video_id` для указанного аниме.
 *
 * YummyAnime API не возвращает `video_id` в `/video/watch-history`
 * (там есть `anime_id`, `ep_title`, но не сам ID видео). Уникальный
 * `video_id` доступен только через `getByUrl({ need_videos: true })` →
 * `anime.videos[].video_id`. Поэтому:
 *
 *  1. Загружаем всю историю просмотров с пагинацией (до пустой/короткой
 *     страницы), чтобы просмотренные серии гарантированно попали в выборку
 *     независимо от их позиции в общей истории пользователя
 *  2. Фильтруем записи по `anime_id`
 *  3. Собираем множество `ep_title` (строки номеров эпизодов)
 *  4. Маппим их в `video_id` через переданный `videos` —
 *     совпадение по `ep_title === video.number`
 *
 * `videosSignature` включается в queryKey, чтобы при смене списка видео
 * (например, при переключении озвучки/плеера в EpisodeViewer, когда
 * `videos[]` пересобирается с новыми `video_id`) кэш инвалидировался и
 * маппинг `ep_title → video_id` работал по актуальным данным.
 */
export function useVideoViews(
  animeId: number | null | undefined,
  videos?: AnimeVideo[]
) {
  const videosSignature = videos?.map((v) => v.video_id).join(',') ?? '';
  return useQuery<number[]>({
    queryKey: ['anime', 'video-views', animeId, videosSignature],
    queryFn: async () => {
      if (!videos?.length) return [];
      try {
        const history = await userListApi.getVideoWatchHistory();
        const watchedNumbers = new Set<string>();
        for (const item of history) {
          if (item.anime_id === animeId && typeof item.ep_title === 'string') {
            watchedNumbers.add(item.ep_title);
          }
        }
        if (!watchedNumbers.size) return [];
        const ids = new Set<number>();
        for (const v of videos) {
          if (typeof v.number === 'string' && watchedNumbers.has(v.number)) {
            ids.add(v.video_id);
          }
        }
        return Array.from(ids);
      } catch {
        // Network/auth/server error: degrade gracefully. The watched
        // indicators simply won't render for this page; auto-mark and
        // manual marking still work via optimistic updates.
        return [];
      }
    },
    enabled: typeof animeId === 'number' && animeId > 0 && !!videos?.length,
    staleTime: 1000 * 30,
  });
}

/**
 * Помечает/снимает отметку просмотра конкретного видео через
 * `PUT/DELETE /video/{videoId}`. Оптимистично обновляет кэш
 * `['anime', 'video-views', animeId, videosSignature]`.
 *
 * `videos` принимается как параметр, чтобы queryKey совпадал с
 * `useVideoViews`. Иначе `setQueryData` запишет в один ключ, а
 * `useQuery` будет читать из другого — optimistic update потеряется.
 *
 * `currentlyViewed: true` → видео помечено как просмотренное, действие — снять отметку
 * (DELETE). `currentlyViewed: false` → не помечено, действие — отметить (PUT).
 *
 * После мутации вызывается `invalidateQueries` с `refetchType: 'none'`:
 * кэш помечается как stale, но refetch не запускается немедленно — это
 * предотвращает «мигание» UI, когда сервер ещё не подтвердил изменение.
 * При следующем обращении к хуку (mount / refetch on focus) данные будут
 * перезапрошены — это даёт eventual consistency без UI-артефактов.
 */
export function useToggleVideoViewed(
  animeId: number | null | undefined,
  videos?: AnimeVideo[]
) {
  const queryClient = useQueryClient();
  const videosSignature = videos?.map((v) => v.video_id).join(',') ?? '';
  const key = ['anime', 'video-views', animeId, videosSignature];

  return useMutation({
    mutationFn: async ({ videoId, currentlyViewed }: { videoId: number; currentlyViewed: boolean }) => {
      if (currentlyViewed) {
        return userListApi.unmarkVideoViewed(videoId);
      }
      return userListApi.markVideoViewed(videoId);
    },
    onMutate: async ({ videoId, currentlyViewed }) => {
      if (typeof animeId !== 'number' || animeId <= 0) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<number[]>(key);
      queryClient.setQueryData<number[]>(key, (old) => {
        const list = old ?? [];
        if (currentlyViewed) return list.filter((id) => id !== videoId);
        return list.includes(videoId) ? list : [...list, videoId];
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
