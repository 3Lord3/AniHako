import { FriendRow } from './FriendRow';
import { FriendsListSkeleton } from './FriendsListSkeleton';
import type { YummyFriend } from '@/types/friend';

interface FriendsListProps {
  friends: YummyFriend[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  emptyMessage: string;
  onAdd: (friendId: number) => void;
  onRemove: (friendId: number) => void;
  pendingFriendIds?: Set<number>;
}

export function FriendsList({
  friends,
  isLoading,
  isError,
  emptyMessage,
  onAdd,
  onRemove,
  pendingFriendIds,
}: FriendsListProps) {
  if (isLoading) {
    return <FriendsListSkeleton />;
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-destructive">
        Не удалось загрузить список. Попробуйте обновить страницу.
      </p>
    );
  }

  if (!friends || friends.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {friends.map((friend) => (
        <FriendRow
          key={friend.id}
          friend={friend}
          onAdd={onAdd}
          onRemove={onRemove}
          isPending={pendingFriendIds?.has(friend.id) ?? false}
        />
      ))}
    </div>
  );
}
