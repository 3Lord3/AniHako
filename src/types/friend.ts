/**
 * Система друзей YummyAnime API — см. FRIENDS.md.
 *
 * `friend_status` описывает отношение к текущему пользователю:
 *   friends        — взаимная дружба
 *   followers      — этот пользователь подписан на вас
 *   following      — вы подписаны на него
 *   requests       — входящая заявка от него
 *   sent-requests  — исходящая заявка от вас
 */
export type FriendStatus = 'friends' | 'followers' | 'following' | 'requests' | 'sent-requests';

/** Максимальный `limit` эндпоинта `/friends` — общая константа, чтобы разные места использовали один ключ кэша. */
export const FRIENDS_LIST_MAX_LIMIT = 100;

export const FRIEND_STATUSES: FriendStatus[] = [
  'friends',
  'followers',
  'following',
  'requests',
  'sent-requests',
];

export const FRIEND_STATUS_LABELS: Record<FriendStatus, string> = {
  friends: 'Друзья',
  followers: 'Подписчики',
  following: 'Подписки',
  requests: 'Входящие заявки',
  'sent-requests': 'Исходящие заявки',
};

interface YummyFriendIds {
  shikimori?: { id: number; nickname: string };
  tg_nickname?: string;
  vk?: number;
}

interface YummyFriendAvatars {
  big?: string;
  full?: string;
  small?: string;
}

export interface YummyFriend {
  sex?: 0 | 1 | 2;
  avatars?: YummyFriendAvatars;
  banned?: boolean;
  ids?: YummyFriendIds;
  id: number;
  nickname: string;
  last_online?: number;
  roles?: string[];
  friend_status: FriendStatus;
}
