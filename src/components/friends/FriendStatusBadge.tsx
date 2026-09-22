import { Badge } from '@/components/ui/badge';
import { FRIEND_STATUS_LABELS } from '@/types/friend';
import { useT, type TranslationKey } from '@/i18n';
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
  const { t } = useT();
  return <Badge variant={FRIEND_STATUS_VARIANTS[status]}>{t(FRIEND_STATUS_LABELS[status] as TranslationKey)}</Badge>;
}
