import { api } from './index';
import type { YummyUserAnimeRate } from '../types/list';
import type { YummyAnimeListId } from '../types/list';
import type { UserAnimeRate } from '../types/list';

export interface VideoWatchHistoryItem {
  video_id?: number;
  anime_id?: number;
  ep_title?: string;
  date?: number;
  end_time?: number;
  duration?: number;
  [key: string]: unknown;
}

const WATCH_HISTORY_PAGE_SIZE = 100;
const WATCH_HISTORY_HARD_CAP_PAGES = 1000;
const WATCH_HISTORY_MAX_DURATION_MS = 30_000;

export const userListApi = {
  getUserList: (userId: number, listId: YummyAnimeListId) =>
    api.get<{ response: YummyUserAnimeRate[] }>(`/users/${userId}/lists/${listId}`).then(res => res.data.response),

  getUserLists: (userId: number) =>
    api.get<{ response: YummyUserAnimeRate[] }>(`/users/${userId}/lists`).then(res => res.data.response),

  getAnimeList: (animeId: number) =>
    api.get<{ list: number; is_favorite: boolean }>(`/anime/${animeId}/list`),

  addToList: (animeId: number, data: {
    list?: number;
    episodes?: number;
    score?: number;
    text?: string;
  }) =>
    api.put<UserAnimeRate>(`/anime/${animeId}/list`, data),

  removeFromList: (animeId: number) =>
    api.delete(`/anime/${animeId}/list`),

  addToFavorites: (animeId: number) =>
    api.put(`/anime/${animeId}/list/fav`),

  removeFromFavorites: (animeId: number) =>
    api.delete(`/anime/${animeId}/list/fav`),

  getVideoWatchHistoryPage: ({ limit, offset }: { limit: number; offset: number }) =>
    api
      .get<{ response: VideoWatchHistoryItem[] }>('/video/watch-history', {
        params: { limit, offset },
      })
      .then((res) => res.data.response || []),

  /**
   * Возвращает всю историю просмотров пользователя, проходя по страницам.
   *
   * Остановка — когда сервер вернул пустой массив или короткую страницу
   * (меньше `WATCH_HISTORY_PAGE_SIZE`). Это гарантирует, что мы дойдём
   * до конца истории, сколько бы просмотров у пользователя ни было.
   *
   * Два защитных предела: `WATCH_HISTORY_HARD_CAP_PAGES` (на случай
   * зацикливания, если сервер всегда отдаёт ровно `limit` элементов)
   * и `WATCH_HISTORY_MAX_DURATION_MS` (если API висит — обход
   * останавливается через 30 секунд и возвращает то, что успели собрать).
   */
  getVideoWatchHistory: async (): Promise<VideoWatchHistoryItem[]> => {
    const collected: VideoWatchHistoryItem[] = [];
    const startedAt = Date.now();
    for (let page = 0; page < WATCH_HISTORY_HARD_CAP_PAGES; page += 1) {
      if (Date.now() - startedAt > WATCH_HISTORY_MAX_DURATION_MS) break;
      const offset = page * WATCH_HISTORY_PAGE_SIZE;
      const items = await userListApi.getVideoWatchHistoryPage({
        limit: WATCH_HISTORY_PAGE_SIZE,
        offset,
      });
      if (!items.length) break;
      collected.push(...items);
      if (items.length < WATCH_HISTORY_PAGE_SIZE) break;
    }
    return collected;
  },

  markVideoViewed: (videoId: number) =>
    api.put(`/video/${videoId}`),

  unmarkVideoViewed: (videoId: number) =>
    api.delete(`/video/${videoId}`),
};

