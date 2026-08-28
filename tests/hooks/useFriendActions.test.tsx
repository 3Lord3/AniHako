import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useFriendActions } from '@/hooks/useFriendActions';

const mockAddFriend = vi.fn();
const mockRemoveFriend = vi.fn();
vi.mock('@/hooks/useFriends', () => ({
  useAddFriend: () => ({ mutate: mockAddFriend }),
  useRemoveFriend: () => ({ mutate: mockRemoveFriend }),
}));

describe('useFriendActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks a friend as pending while the mutation is in flight and clears it on settle', () => {
    const { result } = renderHook(() => useFriendActions(1), { wrapper: createWrapper() });

    act(() => {
      result.current.addFriend(2);
    });
    expect(result.current.pendingFriendIds.has(2)).toBe(true);

    act(() => {
      mockAddFriend.mock.calls[0][1].onSettled();
    });
    expect(result.current.pendingFriendIds.has(2)).toBe(false);
  });

  it('keeps multiple friends pending simultaneously', () => {
    const { result } = renderHook(() => useFriendActions(1), { wrapper: createWrapper() });

    act(() => {
      result.current.removeFriend(1);
      result.current.addFriend(2);
    });

    expect(result.current.pendingFriendIds.has(1)).toBe(true);
    expect(result.current.pendingFriendIds.has(2)).toBe(true);
  });

  it('sets an error message when the mutation fails', () => {
    const { result } = renderHook(() => useFriendActions(1), { wrapper: createWrapper() });

    act(() => {
      result.current.addFriend(2);
    });
    act(() => {
      mockAddFriend.mock.calls[0][1].onError();
    });

    expect(result.current.error).toBe('Не удалось выполнить действие. Попробуйте ещё раз.');
  });

  it('calls the onSuccess callback on success', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useFriendActions(1), { wrapper: createWrapper() });

    act(() => {
      result.current.addFriend(2, onSuccess);
    });
    act(() => {
      mockAddFriend.mock.calls[0][1].onSuccess();
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('resetError clears a previously set error', () => {
    const { result } = renderHook(() => useFriendActions(1), { wrapper: createWrapper() });

    act(() => {
      result.current.addFriend(2);
    });
    act(() => {
      mockAddFriend.mock.calls[0][1].onError();
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.resetError();
    });
    expect(result.current.error).toBeNull();
  });
});
