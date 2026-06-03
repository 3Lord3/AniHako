import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '@/api/auth';

vi.mock('@/api/index', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from '@/api/index';

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('sends registration data to API', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, nickname: 'testuser' },
          tokens: { access_token: 'token123' },
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      await authApi.register('test@test.com', 'testuser', 'password123');

      expect(api.post).toHaveBeenCalledWith('/users', {
        email: 'test@test.com',
        nickname: 'testuser',
        password: 'password123',
      });
    });
  });

  describe('login', () => {
    it('sends login credentials', async () => {
      const mockResponse = {
        data: {
          response: { success: true, token: 'login-token' },
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      await authApi.login('test@test.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/profile/login', {
        login: 'test@test.com',
        password: 'password123',
        need_json: true,
      });
    });
  });

  describe('logout', () => {
    it('posts to logout endpoint', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authApi.logout();

      expect(api.post).toHaveBeenCalledWith('/profile/logout');
    });
  });

  describe('refreshToken', () => {
    it('posts to token refresh endpoint', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { access_token: 'new-token' } });

      await authApi.refreshToken();

      expect(api.post).toHaveBeenCalledWith('/profile/token');
    });
  });

  describe('getProfile', () => {
    it('fetches user profile', async () => {
      const mockResponse = {
        data: {
          response: { id: 1, nickname: 'testuser', email: 'test@test.com' },
        },
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await authApi.getProfile();

      expect(api.get).toHaveBeenCalledWith('/profile');
      expect(result).toEqual({ id: 1, nickname: 'testuser', email: 'test@test.com' });
    });
  });
});