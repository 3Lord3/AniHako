import { useFriends, useFriendsByCategory } from '@/hooks';
import { FriendsList } from './FriendsList';
import { FRIENDS_LIST_MAX_LIMIT } from '@/types/friend';
import { useT, type TranslationKey } from '@/i18n';
import type { FriendStatus } from '@/types/friend';

const EMPTY_MESSAGES: Record<'all' | FriendStatus, string> = {
  all: 'friends.empty.all',
  friends: 'friends.empty.friends',
  followers: 'friends.empty.followers',
  following: 'friends.empty.following',
  requests: 'friends.empty.requests',
  'sent-requests': 'friends.empty.sentRequests',
};

interface FriendsTabPanelProps {
  userId: number;
  category?: FriendStatus;
  onAdd: (friendId: number) => void;
  onRemove: (friendId: number) => void;
  pendingFriendIds?: Set<number>;
}

/**
 * "Все" (без `category`) использует пагинируемый эндпоинт `/friends` с
 * лимитом = максимуму, который отдаёт API (100), без "load more" — этого
 * достаточно для подавляющего большинства аккаунтов и избавляет от
 * накопления страниц. Отдельные категории используют `/friends/{list_id}`,
 * где пагинация API не предусмотрена.
 */
export function FriendsTabPanel({
  userId,
  category,
  onAdd,
  onRemove,
  pendingFriendIds,
}: FriendsTabPanelProps) {
  const { t } = useT();
  const allQuery = useFriends(
    userId,
    { limit: FRIENDS_LIST_MAX_LIMIT, offset: 0 },
    { enabled: !category }
  );
  const categoryQuery = useFriendsByCategory(userId, category ?? 'friends', {
    enabled: !!category,
  });

  const query = category ? categoryQuery : allQuery;

  return (
    <FriendsList
      friends={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      emptyMessage={t(EMPTY_MESSAGES[category ?? 'all'] as TranslationKey)}
      onAdd={onAdd}
      onRemove={onRemove}
      pendingFriendIds={pendingFriendIds}
    />
  );
}
