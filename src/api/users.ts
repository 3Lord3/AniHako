import { api } from './index';
import type { YummyUser } from '../types/user';

export const usersApi = {
  /** Публичный профиль пользователя по нику — `GET /users/{nickname}`. */
  getByNickname: (nickname: string) =>
    api
      .get<{ response: YummyUser }>(`/users/${encodeURIComponent(nickname)}`)
      .then((res) => res.data.response),
};
