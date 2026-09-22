import { FriendRow } from './FriendRow';
import { FriendsListSkeleton } from './FriendsListSkeleton';
import { useT } from '@/i18n';
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
  const { t } = useT();
  if (isLoading) {
    return <FriendsListSkeleton />;
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-destructive">
        {t('friends.loadFailed')}
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
