import { describe, it, expect, vi, beforeEach } from 'vitest';
import { friendsApi } from '@/api/friends';

vi.mock('@/api/index', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '@/api/index';

describe('friendsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFriends', () => {
    it('fetches paginated friends list', async () => {
      const mockResponse = { data: { response: [{ id: 1, nickname: 'foo', friend_status: 'friends' }] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await friendsApi.getFriends(42, { limit: 50, offset: 0 });

      expect(api.get).toHaveBeenCalledWith('/users/42/friends', { params: { limit: 50, offset: 0 } });
      expect(result).toEqual([{ id: 1, nickname: 'foo', friend_status: 'friends' }]);
    });

    it('omits params when not provided', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { response: [] } });

      await friendsApi.getFriends(42);

      expect(api.get).toHaveBeenCalledWith('/users/42/friends', { params: undefined });
    });
  });

  describe('getFriendStatus', () => {
    it('fetches the relationship status with another user', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { response: { status: 'friends' } } });

      const result = await friendsApi.getFriendStatus(42, 7);

      expect(api.get).toHaveBeenCalledWith('/users/42/friends/7');
      expect(result).toBe('friends');
    });
  });

  describe('addFriend', () => {
    it('sends a PUT to send/accept a friend request', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: { response: true } });

      const result = await friendsApi.addFriend(42, 7);

      expect(api.put).toHaveBeenCalledWith('/users/42/friends/7');
      expect(result).toBe(true);
    });
  });

  describe('removeFriend', () => {
    it('sends a DELETE to remove/decline/unfollow', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: { response: true } });

      const result = await friendsApi.removeFriend(42, 7);

      expect(api.delete).toHaveBeenCalledWith('/users/42/friends/7');
      expect(result).toBe(true);
    });
  });

  describe('getFriendsByCategory', () => {
    it('fetches a filtered friends list by category', async () => {
      const mockResponse = { data: { response: [{ id: 2, nickname: 'bar', friend_status: 'requests' }] } };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const result = await friendsApi.getFriendsByCategory(42, 'requests');

      expect(api.get).toHaveBeenCalledWith('/users/42/friends/requests');
      expect(result).toEqual([{ id: 2, nickname: 'bar', friend_status: 'requests' }]);
    });
  });
});
