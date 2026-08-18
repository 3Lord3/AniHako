import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useAnimeMatcher } from '@/hooks/useAnimeMatcher';

const mockRefetch = vi.fn();
const mockAddToList = vi.fn();
let randomAnime: unknown;
let isAdding: boolean;

vi.mock('@/hooks/useAnime', () => ({
  useRandomAnime: () => ({ data: randomAnime, isLoading: false, refetch: mockRefetch }),
  useAddToList: () => ({ mutate: mockAddToList, isPending: isAdding }),
}));

describe('useAnimeMatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    randomAnime = { anime_id: 1, title: 'A' };
    isAdding = false;
    mockRefetch.mockResolvedValue(undefined);
  });

  it('skipping loads the next anime without calling addToList', async () => {
    const { result } = renderHook(() => useAnimeMatcher(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.handleSkip();
    });

    expect(mockAddToList).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('adding calls addToList with planned status and loads next anime on success', async () => {
    mockAddToList.mockImplementation((_vars, opts) => opts.onSuccess());
    const { result } = renderHook(() => useAnimeMatcher(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.handleAdd();
    });

    expect(mockAddToList).toHaveBeenCalledWith(
      { animeId: 1, status: 'planned' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('stops the transition without refetching when addToList errors', async () => {
    mockAddToList.mockImplementation((_vars, opts) => opts.onError());
    const { result } = renderHook(() => useAnimeMatcher(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.handleAdd();
    });

    expect(result.current.isTransitioning).toBe(false);
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('ignores skip/add while a transition is already in progress', async () => {
    mockRefetch.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useAnimeMatcher(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleSkip();
    });
    expect(result.current.isTransitioning).toBe(true);

    act(() => {
      result.current.handleSkip();
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('calls the onSwipeStart callback whenever a swipe begins', () => {
    const onSwipeStart = vi.fn();
    const { result } = renderHook(() => useAnimeMatcher(onSwipeStart), { wrapper: createWrapper() });

    act(() => {
      result.current.handleSkip();
    });

    expect(onSwipeStart).toHaveBeenCalledTimes(1);
  });
});
