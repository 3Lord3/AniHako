import { describe, it, expect } from 'vitest';
import { tierListReducer } from '@/lib/tierListReducer';
import { createEmptyTierList, DEFAULT_TIERS, UNRANKED_TIER_ID } from '@/types/tier';
import type { TierAnimeItem } from '@/types/tier';

function item(animeId: number, title = `Anime ${animeId}`): TierAnimeItem {
  return { animeId, title, posterUrl: `poster-${animeId}.jpg`, url: `anime-${animeId}` };
}

describe('tierListReducer', () => {
  it('LOAD replaces the whole state', () => {
    const state = createEmptyTierList();
    const loaded = { ...createEmptyTierList(), tiers: [] };
    expect(tierListReducer(state, { type: 'LOAD', state: loaded })).toBe(loaded);
  });

  describe('ADD_TIER', () => {
    it('appends a new tier with an empty order list', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'ADD_TIER' });

      expect(next.tiers).toHaveLength(DEFAULT_TIERS.length + 1);
      const added = next.tiers[next.tiers.length - 1];
      expect(added.label).toBe('New');
      expect(next.order[added.id]).toEqual([]);
    });
  });

  describe('RENAME_TIER', () => {
    it('renames the target tier, trimming whitespace', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'RENAME_TIER', tierId: 'tier-s', label: '  Top  ' });
      expect(next.tiers.find((t) => t.id === 'tier-s')?.label).toBe('Top');
    });

    it('ignores an empty/whitespace-only label', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'RENAME_TIER', tierId: 'tier-s', label: '   ' });
      expect(next).toBe(state);
    });
  });

  describe('RECOLOR_TIER', () => {
    it('changes only the targeted tier color', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'RECOLOR_TIER', tierId: 'tier-a', color: 'violet' });
      expect(next.tiers.find((t) => t.id === 'tier-a')?.color).toBe('violet');
      expect(next.tiers.find((t) => t.id === 'tier-s')?.color).toBe('rose');
    });
  });

  describe('REMOVE_TIER', () => {
    it('cascades the removed tier anime into unranked and drops the tier', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'ADD_ANIME', item: item(1) });
      state = tierListReducer(state, { type: 'MOVE_ANIME', animeId: 1, toTierId: 'tier-s', toIndex: 0 });

      const next = tierListReducer(state, { type: 'REMOVE_TIER', tierId: 'tier-s' });

      expect(next.tiers.some((t) => t.id === 'tier-s')).toBe(false);
      expect(next.order['tier-s']).toBeUndefined();
      expect(next.order[UNRANKED_TIER_ID]).toContain(1);
    });

    it('refuses to remove the unranked pseudo-tier', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'REMOVE_TIER', tierId: UNRANKED_TIER_ID });
      expect(next).toBe(state);
    });

    it('is a no-op for an unknown tier id', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'REMOVE_TIER', tierId: 'does-not-exist' });
      expect(next).toBe(state);
    });
  });

  describe('REORDER_TIERS', () => {
    it('reorders tiers to match the given id order', () => {
      const state = createEmptyTierList();
      const ids = state.tiers.map((t) => t.id).reverse();
      const next = tierListReducer(state, { type: 'REORDER_TIERS', tierIds: ids });
      expect(next.tiers.map((t) => t.id)).toEqual(ids);
    });

    it('ignores a list that does not match the current tier set', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'REORDER_TIERS', tierIds: ['tier-s'] });
      expect(next).toBe(state);
    });
  });

  describe('SEED_ITEMS', () => {
    it('adds only anime not already tracked, appending to unranked', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'SEED_ITEMS', items: [item(1), item(2)] });
      expect(state.order[UNRANKED_TIER_ID]).toEqual([1, 2]);

      const next = tierListReducer(state, { type: 'SEED_ITEMS', items: [item(2), item(3)] });
      expect(next.order[UNRANKED_TIER_ID]).toEqual([1, 2, 3]);
    });

    it('is a no-op when nothing new is seeded', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'SEED_ITEMS', items: [item(1)] });
      const next = tierListReducer(state, { type: 'SEED_ITEMS', items: [item(1)] });
      expect(next).toBe(state);
    });

    it('does not disturb anime already moved into a tier', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'SEED_ITEMS', items: [item(1)] });
      state = tierListReducer(state, { type: 'MOVE_ANIME', animeId: 1, toTierId: 'tier-s', toIndex: 0 });

      const next = tierListReducer(state, { type: 'SEED_ITEMS', items: [item(1)] });
      expect(next.order['tier-s']).toEqual([1]);
      expect(next.order[UNRANKED_TIER_ID]).toEqual([]);
    });
  });

  describe('ADD_ANIME', () => {
    it('adds a new anime to unranked', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'ADD_ANIME', item: item(5) });
      expect(next.items[5]).toBeDefined();
      expect(next.order[UNRANKED_TIER_ID]).toEqual([5]);
    });

    it('is a no-op when the anime already exists', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'ADD_ANIME', item: item(5) });
      const next = tierListReducer(state, { type: 'ADD_ANIME', item: item(5) });
      expect(next).toBe(state);
    });
  });

  describe('REMOVE_ANIME', () => {
    it('removes the anime from items and every tier', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'ADD_ANIME', item: item(5) });
      state = tierListReducer(state, { type: 'MOVE_ANIME', animeId: 5, toTierId: 'tier-b', toIndex: 0 });

      const next = tierListReducer(state, { type: 'REMOVE_ANIME', animeId: 5 });
      expect(next.items[5]).toBeUndefined();
      expect(next.order['tier-b']).toEqual([]);
    });

    it('is a no-op when the anime is unknown', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'REMOVE_ANIME', animeId: 999 });
      expect(next).toBe(state);
    });
  });

  describe('MOVE_ANIME', () => {
    it('moves anime between tiers', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'ADD_ANIME', item: item(5) });

      const next = tierListReducer(state, { type: 'MOVE_ANIME', animeId: 5, toTierId: 'tier-c', toIndex: 0 });
      expect(next.order['tier-c']).toEqual([5]);
      expect(next.order[UNRANKED_TIER_ID]).toEqual([]);
    });

    it('is a no-op when the anime cannot be located in any tier', () => {
      const state = createEmptyTierList();
      const next = tierListReducer(state, { type: 'MOVE_ANIME', animeId: 999, toTierId: 'tier-c', toIndex: 0 });
      expect(next).toBe(state);
    });
  });

  describe('RESET', () => {
    it('restores the default tiers but keeps ranked anime, moved into unranked', () => {
      let state = createEmptyTierList();
      state = tierListReducer(state, { type: 'ADD_ANIME', item: item(5) });
      state = tierListReducer(state, { type: 'MOVE_ANIME', animeId: 5, toTierId: 'tier-s', toIndex: 0 });
      state = tierListReducer(state, { type: 'ADD_TIER' });

      const next = tierListReducer(state, { type: 'RESET' });
      expect(next.tiers).toEqual(DEFAULT_TIERS);
      expect(next.items[5]).toEqual(item(5));
      expect(next.order[UNRANKED_TIER_ID]).toEqual([5]);
    });
  });
});
