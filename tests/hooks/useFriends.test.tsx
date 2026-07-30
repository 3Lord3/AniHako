import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFriends,
  useFriendsByCategory,
  useFriendStatus,
  useAddFriend,
  useRemoveFriend,
} from '@/hooks/useFriends';
import { friendsApi } from '@/api/friends';

vi.mock('@/api/friends', () => ({
  friendsApi: {
    getFriends: vi.fn(),
    getFriendsByCategory: vi.fn(),
    getFriendStatus: vi.fn(),
    addFriend: vi.fn(),
    removeFriend: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFriends hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFriends', () => {
    it('fetches the paginated friends list for a user', async () => {
      vi.mocked(friendsApi.getFriends).mockResolvedValueOnce([{ id: 1, nickname: 'a', friend_status: 'friends' }]);

      const { result } = renderHook(() => useFriends(42, { limit: 50, offset: 0 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(friendsApi.getFriends).toHaveBeenCalledWith(42, { limit: 50, offset: 0 });
      expect(result.current.data).toHaveLength(1);
    });

    it('does not run when userId is undefined', () => {
      const { result } = renderHook(() => useFriends(undefined), { wrapper: createWrapper() });

      expect(result.current.fetchStatus).toBe('idle');
      expect(friendsApi.getFriends).not.toHaveBeenCalled();
    });

    it('does not run when explicitly disabled', () => {
      renderHook(() => useFriends(42, undefined, { enabled: false }), { wrapper: createWrapper() });

      expect(friendsApi.getFriends).not.toHaveBeenCalled();
    });
  });

  describe('useFriendsByCategory', () => {
    it('fetches a category-filtered friends list', async () => {
      vi.mocked(friendsApi.getFriendsByCategory).mockResolvedValueOnce([
        { id: 2, nickname: 'b', friend_status: 'requests' },
      ]);

      const { result } = renderHook(() => useFriendsByCategory(42, 'requests'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(friendsApi.getFriendsByCategory).toHaveBeenCalledWith(42, 'requests');
      expect(result.current.data?.[0].friend_status).toBe('requests');
    });
  });

  describe('useFriendStatus', () => {
    it('fetches the relationship status between two users', async () => {
      vi.mocked(friendsApi.getFriendStatus).mockResolvedValueOnce('following');

      const { result } = renderHook(() => useFriendStatus(42, 7), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(friendsApi.getFriendStatus).toHaveBeenCalledWith(42, 7);
      expect(result.current.data).toBe('following');
    });

    it('does not run when friendId is undefined', () => {
      renderHook(() => useFriendStatus(42, undefined), { wrapper: createWrapper() });

      expect(friendsApi.getFriendStatus).not.toHaveBeenCalled();
    });
  });

  describe('useAddFriend', () => {
    it('sends a friend request and invalidates friends queries', async () => {
      vi.mocked(friendsApi.addFriend).mockResolvedValueOnce(true);
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useAddFriend(42), { wrapper });

      result.current.mutate(7);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(friendsApi.addFriend).toHaveBeenCalledWith(42, 7);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['friends', 42] });
    });
  });

  describe('useRemoveFriend', () => {
    it('removes a friend and invalidates friends queries', async () => {
      vi.mocked(friendsApi.removeFriend).mockResolvedValueOnce(true);
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useRemoveFriend(42), { wrapper });

      result.current.mutate(7);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(friendsApi.removeFriend).toHaveBeenCalledWith(42, 7);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['friends', 42] });
    });
  });
});
