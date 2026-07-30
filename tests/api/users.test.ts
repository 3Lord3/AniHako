import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from '@/api/users';

vi.mock('@/api/index', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '@/api/index';

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByNickname', () => {
    it('fetches a public profile by nickname', async () => {
      const mockResponse = { data: { response: { id: 12345, nickname: 'random_user' } } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await usersApi.getByNickname('random_user');

      expect(api.get).toHaveBeenCalledWith('/users/random_user');
      expect(result).toEqual({ id: 12345, nickname: 'random_user' });
    });

    it('URL-encodes the nickname', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { response: { id: 1, nickname: 'a b' } } });

      await usersApi.getByNickname('a b');

      expect(api.get).toHaveBeenCalledWith('/users/a%20b');
    });
  });
});
