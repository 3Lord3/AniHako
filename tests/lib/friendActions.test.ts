import { describe, it, expect } from 'vitest';
import { getFriendActions } from '@/lib/friendActions';
import type { FriendStatus } from '@/types/friend';

describe('getFriendActions', () => {
  it('offers only "remove" for mutual friends', () => {
    const actions = getFriendActions('friends');
    expect(actions).toEqual([
      { key: 'remove', label: 'Удалить из друзей', method: 'remove', variant: 'outline' },
    ]);
  });

  it('offers "add" and "remove" for followers', () => {
    const actions = getFriendActions('followers');
    expect(actions.map((a) => a.method)).toEqual(['add', 'remove']);
    expect(actions[0].label).toBe('Добавить в друзья');
    expect(actions[1].label).toBe('Удалить подписчика');
  });

  it('offers only "unfollow" (remove) for following', () => {
    const actions = getFriendActions('following');
    expect(actions).toEqual([
      { key: 'unfollow', label: 'Отписаться', method: 'remove', variant: 'outline' },
    ]);
  });

  it('offers accept (add) and decline (remove) for incoming requests', () => {
    const actions = getFriendActions('requests');
    expect(actions.map((a) => a.method)).toEqual(['add', 'remove']);
    expect(actions[0].label).toBe('Принять');
    expect(actions[1].label).toBe('Отклонить');
  });

  it('offers only "cancel" (remove) for sent requests', () => {
    const actions = getFriendActions('sent-requests');
    expect(actions).toEqual([
      { key: 'cancel', label: 'Отменить заявку', method: 'remove', variant: 'outline' },
    ]);
  });

  it('returns an empty array for an unknown status', () => {
    expect(getFriendActions('unknown' as FriendStatus)).toEqual([]);
  });
});
