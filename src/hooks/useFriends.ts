import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from '@/api/friends';
import type { FriendStatus } from '@/types/friend';

export function useFriends(
  userId: number | undefined,
  params?: { limit?: number; offset?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['friends', userId, 'all', params],
    queryFn: () => friendsApi.getFriends(userId as number, params),
    enabled: !!userId && (options?.enabled ?? true),
  });
}

export function useFriendsByCategory(
  userId: number | undefined,
  category: FriendStatus,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['friends', userId, 'category', category],
    queryFn: () => friendsApi.getFriendsByCategory(userId as number, category),
    enabled: !!userId && (options?.enabled ?? true),
  });
}

export function useFriendStatus(
  userId: number | undefined,
  friendId: number | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['friends', userId, 'status', friendId],
    queryFn: () => friendsApi.getFriendStatus(userId as number, friendId as number),
    enabled: !!userId && !!friendId && (options?.enabled ?? true),
    retry: false,
  });
}

export function useAddFriend(userId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: number) => friendsApi.addFriend(userId as number, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    },
  });
}

export function useRemoveFriend(userId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: number) => friendsApi.removeFriend(userId as number, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    },
  });
}
