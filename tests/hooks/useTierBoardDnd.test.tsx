import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTierBoardDnd } from '@/hooks/useTierBoardDnd';
import { createEmptyTierList, UNRANKED_TIER_ID } from '@/types/tier';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

function buildState() {
  const state = createEmptyTierList();
  state.items[1] = { animeId: 1, title: 'A', posterUrl: 'a.jpg', url: 'a' };
  state.items[2] = { animeId: 2, title: 'B', posterUrl: 'b.jpg', url: 'b' };
  state.order['tier-s'] = [1];
  state.order[UNRANKED_TIER_ID] = [2];
  return state;
}

describe('useTierBoardDnd', () => {
  it('sets activeItem on drag start and clears it on drag cancel', () => {
    const state = buildState();
    const { result } = renderHook(() => useTierBoardDnd(state, vi.fn()));

    act(() => {
      result.current.handleDragStart({ active: { id: 1 } } as unknown as DragStartEvent);
    });
    expect(result.current.activeItem).toEqual(state.items[1]);

    act(() => {
      result.current.handleDragCancel();
    });
    expect(result.current.activeItem).toBeUndefined();
  });

  it('calls moveAnime with the resolved drop target on drag end', () => {
    const state = buildState();
    const moveAnime = vi.fn();
    const { result } = renderHook(() => useTierBoardDnd(state, moveAnime));

    act(() => {
      result.current.handleDragStart({ active: { id: 2 } } as unknown as DragStartEvent);
    });
    act(() => {
      result.current.handleDragEnd({
        active: { id: 2 },
        over: { id: 'tier-s', data: { current: { tierId: 'tier-s', type: 'tier' } } },
      } as unknown as DragEndEvent);
    });

    expect(moveAnime).toHaveBeenCalledWith(2, 'tier-s', 1);
    expect(result.current.activeItem).toBeUndefined();
  });

  it('does nothing on drag end when there is no drop target', () => {
    const state = buildState();
    const moveAnime = vi.fn();
    const { result } = renderHook(() => useTierBoardDnd(state, moveAnime));

    act(() => {
      result.current.handleDragEnd({ active: { id: 1 }, over: null } as unknown as DragEndEvent);
    });

    expect(moveAnime).not.toHaveBeenCalled();
  });

  it('builds moveTargets from the current tiers', () => {
    const state = buildState();
    const { result } = renderHook(() => useTierBoardDnd(state, vi.fn()));

    expect(result.current.moveTargets.length).toBeGreaterThanOrEqual(state.tiers.length);
  });
});
