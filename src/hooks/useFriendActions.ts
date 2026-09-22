import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddFriend, useRemoveFriend } from './useFriends';

export function useFriendActions(userId: number | undefined) {
  const { t } = useTranslation();
  const { mutate: addFriendMutate } = useAddFriend(userId);
  const { mutate: removeFriendMutate } = useRemoveFriend(userId);
  const [pendingFriendIds, setPendingFriendIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const runAction = (mutate: typeof addFriendMutate, friendId: number, onSuccess?: () => void) => {
    setError(null);
    setPendingFriendIds((prev) => new Set(prev).add(friendId));
    mutate(friendId, {
      onSuccess: () => onSuccess?.(),
      onError: () => setError(t('friends.mutationError')),
      onSettled: () => {
        setPendingFriendIds((prev) => {
          const next = new Set(prev);
          next.delete(friendId);
          return next;
        });
      },
    });
  };

  const addFriend = (friendId: number, onSuccess?: () => void) => runAction(addFriendMutate, friendId, onSuccess);
  const removeFriend = (friendId: number, onSuccess?: () => void) => runAction(removeFriendMutate, friendId, onSuccess);
  const resetError = () => setError(null);

  return { addFriend, removeFriend, pendingFriendIds, error, resetError };
}
