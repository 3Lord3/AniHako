import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { RoleBadges } from '@/components/profile/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FriendStatusBadge } from './FriendStatusBadge';
import { formatLastOnline } from '@/lib/dateUtils';
import { getFriendActions } from '@/lib/friendActions';
import type { YummyFriend } from '@/types/friend';

interface FriendRowProps {
  friend: YummyFriend;
  onAdd: (friendId: number) => void;
  onRemove: (friendId: number) => void;
  isPending?: boolean;
}

export function FriendRow({ friend, onAdd, onRemove, isPending }: FriendRowProps) {
  const actions = getFriendActions(friend.friend_status);
  const disabled = isPending || friend.banned;

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ProfileAvatar
          src={friend.avatars?.small || friend.avatars?.big}
          name={friend.nickname}
          size="sm"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-medium">{friend.nickname}</p>
            <FriendStatusBadge status={friend.friend_status} />
            {friend.banned && <Badge variant="destructive">Заблокирован</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{formatLastOnline(friend.last_online)}</p>
          <RoleBadges roles={friend.roles} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:shrink-0">
        {actions.map((action) => (
          <Button
            key={action.key}
            size="sm"
            variant={action.variant}
            disabled={disabled}
            onClick={() => (action.method === 'add' ? onAdd(friend.id) : onRemove(friend.id))}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
