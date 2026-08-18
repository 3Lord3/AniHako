import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useAddFriendDialog } from '@/hooks/useAddFriendDialog';
import * as friendsHooks from '@/hooks/useFriends';
import * as usersHooks from '@/hooks/useUsers';
import * as friendActionsHooks from '@/hooks/useFriendActions';
import type { YummyFriend } from '@/types/friend';

vi.mock('@/hooks/useFriends', () => ({
  useFriends: vi.fn(),
  useFriendStatus: vi.fn(),
}));
vi.mock('@/hooks/useUsers', () => ({
  useUserByNickname: vi.fn(),
}));
vi.mock('@/hooks/useFriendActions', () => ({
  useFriendActions: vi.fn(),
}));

const knownRelations: YummyFriend[] = [
  { id: 42, nickname: 'Kaworu', friend_status: 'friends' },
  { id: 43, nickname: 'Rei', friend_status: 'requests' },
];

const addFriend = vi.fn();
const removeFriend = vi.fn();

describe('useAddFriendDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(friendsHooks.useFriends).mockReturnValue({
      data: knownRelations,
    } as unknown as ReturnType<typeof friendsHooks.useFriends>);
    vi.mocked(friendsHooks.useFriendStatus).mockReturnValue({
      data: undefined,
      isFetching: false,
    } as unknown as ReturnType<typeof friendsHooks.useFriendStatus>);
    vi.mocked(usersHooks.useUserByNickname).mockReturnValue({
      data: undefined,
      isFetching: false,
      isFetched: false,
    } as unknown as ReturnType<typeof usersHooks.useUserByNickname>);
    vi.mocked(friendActionsHooks.useFriendActions).mockReturnValue({
      addFriend,
      removeFriend,
      pendingFriendIds: new Set(),
      error: null,
      resetError: vi.fn(),
    } as unknown as ReturnType<typeof friendActionsHooks.useFriendActions>);
  });

  it('rejects an empty submission', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleCheck();
    });

    expect(result.current.displayError).toBe('Введите никнейм или ID пользователя');
  });

  it('rejects adding yourself by numeric id', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('1');
    });
    act(() => {
      result.current.handleCheck();
    });

    expect(result.current.displayError).toBe('Нельзя добавить самого себя');
  });

  it('rejects adding yourself by nickname (case-insensitive)', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Nagisa'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('nagisa');
    });
    act(() => {
      result.current.handleCheck();
    });

    expect(result.current.displayError).toBe('Нельзя добавить самого себя');
  });

  it('resolves a nickname that is already a known relation without any lookup', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('kaworu');
    });
    act(() => {
      result.current.handleCheck();
    });

    expect(result.current.resolvedLabel).toBe('Kaworu');
    expect(result.current.status).toBe('friends');
    expect(usersHooks.useUserByNickname).toHaveBeenLastCalledWith(undefined);
    expect(friendsHooks.useFriendStatus).toHaveBeenLastCalledWith(1, 42, { enabled: false });
  });

  it('resolves an unknown nickname via GET /users/{nickname} and checks its status by the resolved id', async () => {
    vi.mocked(usersHooks.useUserByNickname).mockReturnValue({
      data: { id: 77, nickname: 'Stranger' },
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof usersHooks.useUserByNickname>);

    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('Stranger');
    });
    act(() => {
      result.current.handleCheck();
    });

    expect(usersHooks.useUserByNickname).toHaveBeenLastCalledWith('Stranger');
    await waitFor(() => expect(result.current.hasResult).toBe(true));
    expect(result.current.resolvedLabel).toBe('Stranger');
    expect(friendsHooks.useFriendStatus).toHaveBeenLastCalledWith(1, 77, { enabled: true });
    expect(result.current.actions).toEqual([
      { key: 'add', label: 'Отправить заявку', method: 'add', variant: 'default' },
    ]);
  });

  it('shows a not-found error when the nickname does not resolve to any user', () => {
    vi.mocked(usersHooks.useUserByNickname).mockReturnValue({
      data: undefined,
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof usersHooks.useUserByNickname>);

    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('Ghost');
    });
    act(() => {
      result.current.handleCheck();
    });

    expect(result.current.displayError).toBe('Пользователь с таким никнеймом или ID не найден');
  });

  it('resolves a numeric id that matches a known relation without any remote lookup', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('42');
    });
    act(() => {
      result.current.handleCheck();
    });

    expect(result.current.resolvedLabel).toBe('Kaworu');
    expect(result.current.status).toBe('friends');
    expect(usersHooks.useUserByNickname).toHaveBeenLastCalledWith(undefined);
  });

  it('blocks the action if the resolved identity turns out to be the caller', async () => {
    vi.mocked(usersHooks.useUserByNickname).mockReturnValue({
      data: { id: 1, nickname: 'CanonicalMe' },
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof usersHooks.useUserByNickname>);

    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('alias-for-me');
    });
    act(() => {
      result.current.handleCheck();
    });

    await waitFor(() => expect(result.current.displayError).toBe('Нельзя добавить самого себя'));
    expect(result.current.hasResult).toBe(false);
  });

  it('accepts an incoming request resolved from a known nickname', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('Rei');
    });
    act(() => {
      result.current.handleCheck();
    });
    act(() => {
      result.current.handleAction('add');
    });

    expect(addFriend).toHaveBeenCalledWith(43, expect.anything());
  });

  it('surfaces the mutation error reported by useFriendActions', () => {
    vi.mocked(friendActionsHooks.useFriendActions).mockReturnValue({
      addFriend,
      removeFriend,
      pendingFriendIds: new Set(),
      error: 'Не удалось выполнить действие. Попробуйте ещё раз.',
      resetError: vi.fn(),
    } as unknown as ReturnType<typeof friendActionsHooks.useFriendActions>);

    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    expect(result.current.displayError).toBe('Не удалось выполнить действие. Попробуйте ещё раз.');
  });

  it('clears the mutation error from useFriendActions when the dialog closes', () => {
    const resetError = vi.fn();
    vi.mocked(friendActionsHooks.useFriendActions).mockReturnValue({
      addFriend,
      removeFriend,
      pendingFriendIds: new Set(),
      error: 'Не удалось выполнить действие. Попробуйте ещё раз.',
      resetError,
    } as unknown as ReturnType<typeof friendActionsHooks.useFriendActions>);

    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleOpenChange(false);
    });

    expect(resetError).toHaveBeenCalled();
  });

  it('resets the input/submission state when the dialog closes', () => {
    const { result } = renderHook(() => useAddFriendDialog(1, 'Me'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleInputChange('kaworu');
    });
    act(() => {
      result.current.handleCheck();
    });
    expect(result.current.resolvedLabel).toBe('Kaworu');

    act(() => {
      result.current.handleOpenChange(false);
    });

    expect(result.current.idInput).toBe('');
    expect(result.current.resolvedLabel).toBeNull();
  });
});
