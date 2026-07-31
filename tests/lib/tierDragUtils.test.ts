import { describe, it, expect } from 'vitest';
import { findTierIdForAnime, moveItem, removeItem, resolveDropTarget } from '@/lib/tierDragUtils';

describe('findTierIdForAnime', () => {
  it('finds the tier containing the anime', () => {
    const order = { s: [1, 2], a: [3] };
    expect(findTierIdForAnime(order, 3)).toBe('a');
  });

  it('returns undefined when the anime is not present anywhere', () => {
    const order = { s: [1, 2] };
    expect(findTierIdForAnime(order, 99)).toBeUndefined();
  });
});

describe('moveItem', () => {
  it('reorders within the same tier', () => {
    const order = { s: [1, 2, 3, 4] };
    const result = moveItem(order, 1, 's', 's', 2);
    expect(result.s).toEqual([2, 3, 1, 4]);
  });

  it('moves an item to a different tier at a given index', () => {
    const order = { s: [1, 2], a: [3, 4] };
    const result = moveItem(order, 1, 's', 'a', 1);
    expect(result.s).toEqual([2]);
    expect(result.a).toEqual([3, 1, 4]);
  });

  it('appends to the end of an empty destination tier', () => {
    const order = { s: [1], unranked: [] };
    const result = moveItem(order, 1, 's', 'unranked', 0);
    expect(result.s).toEqual([]);
    expect(result.unranked).toEqual([1]);
  });

  it('clamps an out-of-range destination index', () => {
    const order = { s: [1], a: [2, 3] };
    const result = moveItem(order, 1, 's', 'a', 999);
    expect(result.a).toEqual([2, 3, 1]);
  });

  it('returns the original order unchanged when the anime is not in the source tier', () => {
    const order = { s: [1, 2], a: [3] };
    const result = moveItem(order, 99, 's', 'a', 0);
    expect(result).toBe(order);
  });
});

describe('resolveDropTarget', () => {
  const order = { s: [1, 2], a: [3] };

  it('targets the end of a tier when dropped on its empty container', () => {
    expect(resolveDropTarget(order, 'a', { tierId: 'a', type: 'container' })).toEqual({
      tierId: 'a',
      index: 1,
    });
  });

  it('targets the position of the hovered card within its tier', () => {
    expect(resolveDropTarget(order, '2', { tierId: 's', type: 'card' })).toEqual({
      tierId: 's',
      index: 1,
    });
  });

  it('falls back to the raw over id when no container data is present', () => {
    expect(resolveDropTarget(order, 'a', undefined)).toEqual({ tierId: 'a', index: 1 });
  });

  it('defaults to index 0 for an untracked (empty) tier', () => {
    expect(resolveDropTarget(order, 'missing', undefined)).toEqual({ tierId: 'missing', index: 0 });
  });

  it('reports index -1 when the hovered card id is not found in its own tier', () => {
    expect(resolveDropTarget(order, '999', { tierId: 's', type: 'card' })).toEqual({
      tierId: 's',
      index: -1,
    });
  });
});

describe('removeItem', () => {
  it('removes the anime from every tier', () => {
    const order = { s: [1, 2], a: [1, 3] };
    const result = removeItem(order, 1);
    expect(result).toEqual({ s: [2], a: [3] });
  });

  it('is a no-op when the anime is absent', () => {
    const order = { s: [1, 2] };
    const result = removeItem(order, 99);
    expect(result).toEqual({ s: [1, 2] });
  });
});
