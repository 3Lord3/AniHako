import { useState } from 'react';
import { useUser, useFriendActions } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { LoginRequired } from '@/components/LoginRequired';
import { AddFriendDialog } from '@/components/friends/AddFriendDialog';
import { FriendsSidebar } from '@/components/friends/FriendsSidebar';
import type { FriendsTab } from '@/components/friends/FriendsSidebar';
import { FriendsTabPanel } from '@/components/friends/FriendsTabPanel';
import { FriendsPageSkeleton } from '@/components/loaders/PageSkeletons';

export function FriendsPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const [tab, setTab] = useState<FriendsTab>('all');
  const { addFriend, removeFriend, pendingFriendIds, error: actionError } = useFriendActions(user?.id);

  if (isUserLoading) {
    return <FriendsPageSkeleton />;
  }

  if (!user) {
    return <LoginRequired message="Для просмотра друзей необходимо войти" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Друзья</h1>
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex flex-col gap-3 md:w-56 md:shrink-0">
          <FriendsSidebar active={tab} onChange={setTab} />
          <AddFriendDialog userId={user.id} userNickname={user.nickname} />
        </div>

        <Card className="min-w-0 flex-1">
          <CardContent>
            <FriendsTabPanel
              userId={user.id}
              category={tab === 'all' ? undefined : tab}
              onAdd={(friendId) => addFriend(friendId)}
              onRemove={(friendId) => removeFriend(friendId)}
              pendingFriendIds={pendingFriendIds}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
