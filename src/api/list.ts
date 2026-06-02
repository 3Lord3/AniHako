import { api } from './index';
import type { YummyUserAnimeRate } from '../types/list';
import type { YummyAnimeListId } from '../types/list';
import type { UserAnimeRate } from '../types/list';

export const userListApi = {
  getUserList: (userId: number, listId: YummyAnimeListId) =>
    api.get<YummyUserAnimeRate[]>(`/users/${userId}/lists/${listId}`),

  getUserLists: (userId: number) =>
    api.get<YummyUserAnimeRate[]>(`/users/${userId}/lists`),

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
};
