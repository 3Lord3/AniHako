import { Badge } from '@/components/ui/badge';
import { FRIEND_STATUS_LABELS } from '@/types/friend';
import type { FriendStatus } from '@/types/friend';

const FRIEND_STATUS_VARIANTS: Record<FriendStatus, 'default' | 'secondary' | 'outline'> = {
  friends: 'default',
  followers: 'secondary',
  following: 'secondary',
  requests: 'outline',
  'sent-requests': 'outline',
};

interface FriendStatusBadgeProps {
  status: FriendStatus;
}

export function FriendStatusBadge({ status }: FriendStatusBadgeProps) {
  return <Badge variant={FRIEND_STATUS_VARIANTS[status]}>{FRIEND_STATUS_LABELS[status]}</Badge>;
}
