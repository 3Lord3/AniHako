import type { FriendStatus } from '@/types/friend';

export type FriendActionMethod = 'add' | 'remove';

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
export function getFriendActions(status: FriendStatus): FriendAction[] {
  switch (status) {
    case 'friends':
      return [{ key: 'remove', label: 'Удалить из друзей', method: 'remove', variant: 'outline' }];
    case 'followers':
      return [
        { key: 'add', label: 'Добавить в друзья', method: 'add', variant: 'default' },
        { key: 'remove', label: 'Удалить подписчика', method: 'remove', variant: 'ghost' },
      ];
    case 'following':
      return [{ key: 'unfollow', label: 'Отписаться', method: 'remove', variant: 'outline' }];
    case 'requests':
      return [
        { key: 'accept', label: 'Принять', method: 'add', variant: 'default' },
        { key: 'decline', label: 'Отклонить', method: 'remove', variant: 'ghost' },
      ];
    case 'sent-requests':
      return [{ key: 'cancel', label: 'Отменить заявку', method: 'remove', variant: 'outline' }];
    default:
      return [];
  }
}
