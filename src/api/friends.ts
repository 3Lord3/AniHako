import { api } from './index';
import type { FriendStatus, YummyFriend } from '../types/friend';

export interface GetFriendsParams {
  limit?: number;
  offset?: number;
}

export const friendsApi = {
  getFriends: (userId: number, params?: GetFriendsParams) =>
    api
      .get<{ response: YummyFriend[] }>(`/users/${userId}/friends`, { params })
      .then((res) => res.data.response),

  getFriendStatus: (userId: number, friendId: number) =>
    api
      .get<{ response: { status: FriendStatus } }>(`/users/${userId}/friends/${friendId}`)
      .then((res) => res.data.response.status),

  addFriend: (userId: number, friendId: number) =>
    api
      .put<{ response: boolean }>(`/users/${userId}/friends/${friendId}`)
      .then((res) => res.data.response),

  removeFriend: (userId: number, friendId: number) =>
    api
      .delete<{ response: boolean }>(`/users/${userId}/friends/${friendId}`)
      .then((res) => res.data.response),

  getFriendsByCategory: (userId: number, listId: FriendStatus) =>
    api
      .get<{ response: YummyFriend[] }>(`/users/${userId}/friends/${listId}`)
      .then((res) => res.data.response),
};
