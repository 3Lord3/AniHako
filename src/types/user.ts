export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface YummyUser {
  id: number;
  nickname: string;
  email?: string;
  about?: string;
  banned?: boolean;
  ids?: {
    shikimori?: { id: number; nickname: string };
    vk?: number;
    tg_nickname?: string;
  };
  avatars?: {
    big?: string;
    full?: string;
    small?: string;
  };
  bdate?: number | null;
  last_online?: number;
  sex?: 0 | 1 | 2;
  roles?: string[];
  register_date?: number;
  texts?: { color?: number; left?: string; right?: string };
  banner?: { cropped?: string; full?: string };
  lists_privacy?: 'public' | 'friends' | 'authed' | 'none';
  privacy?: {
    shiki_public?: boolean;
    tg_public?: boolean;
    vk_public?: boolean;
    discord_public?: boolean;
  };
  notifications?: {
    vk?: boolean;
    telegram?: boolean;
    count?: number;
  };
  messages?: { unread_count?: number };
}
