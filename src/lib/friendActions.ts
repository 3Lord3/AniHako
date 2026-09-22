import type { FriendStatus } from '@/types/friend';
import type { TranslationKey } from '@/i18n';

type FriendActionMethod = 'add' | 'remove';

export interface FriendAction {
  key: 'accept' | 'add' | 'unfollow' | 'remove' | 'decline' | 'cancel';
  label: string;
  method: FriendActionMethod;
  variant: 'default' | 'outline' | 'ghost';
}

/**
 * PUT/DELETE переиспользуются для разных состояний — например, PUT
 * одновременно и отправляет заявку, и принимает входящую.
 */
export function getFriendActions(status: FriendStatus, t: (key: TranslationKey) => string): FriendAction[] {
  switch (status) {
    case 'friends':
      return [{ key: 'remove', label: t('friends.remove'), method: 'remove', variant: 'outline' }];
    case 'followers':
      return [
        { key: 'add', label: t('friends.add'), method: 'add', variant: 'default' },
        { key: 'remove', label: t('friends.removeFollower'), method: 'remove', variant: 'ghost' },
      ];
    case 'following':
      return [{ key: 'unfollow', label: t('friends.unfollow'), method: 'remove', variant: 'outline' }];
    case 'requests':
      return [
        { key: 'accept', label: t('friends.accept'), method: 'add', variant: 'default' },
        { key: 'decline', label: t('friends.decline'), method: 'remove', variant: 'ghost' },
      ];
    case 'sent-requests':
      return [{ key: 'cancel', label: t('friends.cancelRequest'), method: 'remove', variant: 'outline' }];
    default:
      return [];
  }
}
