import { api } from './index';
import type { AuthTokens } from '../types/user';
import type { YummyUser } from '../types/user';

export const authApi = {
  register: (email: string, username: string, password: string) =>
    api.post<{ user: YummyUser; tokens: AuthTokens }>('/users', {
      email,
      nickname: username,
      password,
    }),

  login: (email: string, password: string) =>
    api.post<{ response: { success: boolean; token: string } }>('/profile/login', {
      login: email,
      password,
      need_json: true,
    }),

  logout: () =>
    api.post('/profile/logout'),

  refreshToken: () =>
    api.post<AuthTokens>('/profile/token'),

  getProfile: () =>
    api.get<{ response: YummyUser }>('/profile').then(res => res.data.response),
};
