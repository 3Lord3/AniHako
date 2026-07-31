import type { TierListState, TierAnimeItem, TierColorId, TierDefinition } from '@/types/tier';
import { UNRANKED_TIER_ID, DEFAULT_TIERS, TIER_COLOR_PRESETS } from '@/types/tier';
import { moveItem, removeItem, findTierIdForAnime } from './tierDragUtils';

export type TierListAction =
  | { type: 'LOAD'; state: TierListState }
  | { type: 'ADD_TIER' }
  | { type: 'RENAME_TIER'; tierId: string; label: string }
  | { type: 'RECOLOR_TIER'; tierId: string; color: TierColorId }
  | { type: 'REMOVE_TIER'; tierId: string }
  | { type: 'REORDER_TIERS'; tierIds: string[] }
  | { type: 'SEED_ITEMS'; items: TierAnimeItem[] }
  | { type: 'ADD_ANIME'; item: TierAnimeItem }
  | { type: 'REMOVE_ANIME'; animeId: number }
  | { type: 'MOVE_ANIME'; animeId: number; toTierId: string; toIndex: number }
  | { type: 'RESET' };

function generateTierId(): string {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `tier-${random}`;
}

function nextTierColor(usedCount: number): TierColorId {
  return TIER_COLOR_PRESETS[usedCount % TIER_COLOR_PRESETS.length].id;
}

export function tierListReducer(state: TierListState, action: TierListAction): TierListState {
  switch (action.type) {
    case 'LOAD':
      return action.state;

    case 'ADD_TIER': {
      const tier: TierDefinition = {
        id: generateTierId(),
        label: 'New',
        color: nextTierColor(state.tiers.length),
      };
      return {
        ...state,
        tiers: [...state.tiers, tier],
        order: { ...state.order, [tier.id]: [] },
      };
    }

    case 'RENAME_TIER': {
      const label = action.label.trim();
      if (!label) return state;
      return {
        ...state,
        tiers: state.tiers.map((tier) =>
          tier.id === action.tierId ? { ...tier, label } : tier
        ),
      };
    }

    case 'RECOLOR_TIER':
      return {
        ...state,
        tiers: state.tiers.map((tier) =>
          tier.id === action.tierId ? { ...tier, color: action.color } : tier
        ),
      };

    case 'REMOVE_TIER': {
      if (action.tierId === UNRANKED_TIER_ID) return state;
      if (!state.tiers.some((tier) => tier.id === action.tierId)) return state;

      const removedIds = state.order[action.tierId] ?? [];
      const order: Record<string, number[]> = {};
      for (const [tierId, ids] of Object.entries(state.order)) {
        if (tierId === action.tierId) continue;
        order[tierId] = ids;
      }
      order[UNRANKED_TIER_ID] = [...order[UNRANKED_TIER_ID], ...removedIds];

      return {
        ...state,
        tiers: state.tiers.filter((tier) => tier.id !== action.tierId),
        order,
      };
    }

    case 'REORDER_TIERS': {
      const byId = new Map(state.tiers.map((tier) => [tier.id, tier]));
      const reordered = action.tierIds
        .map((id) => byId.get(id))
        .filter((tier): tier is TierDefinition => Boolean(tier));
      if (reordered.length !== state.tiers.length) return state;
      return { ...state, tiers: reordered };
    }

    case 'SEED_ITEMS': {
      const newItems = action.items.filter((item) => !(item.animeId in state.items));
      if (newItems.length === 0) return state;

      const items = { ...state.items };
      for (const item of newItems) {
        items[item.animeId] = item;
      }

      return {
        ...state,
        items,
        order: {
          ...state.order,
          [UNRANKED_TIER_ID]: [
            ...state.order[UNRANKED_TIER_ID],
            ...newItems.map((item) => item.animeId),
          ],
        },
      };
    }

    case 'ADD_ANIME': {
      if (action.item.animeId in state.items) return state;
      return {
        ...state,
        items: { ...state.items, [action.item.animeId]: action.item },
        order: {
          ...state.order,
          [UNRANKED_TIER_ID]: [...state.order[UNRANKED_TIER_ID], action.item.animeId],
        },
      };
    }

    case 'REMOVE_ANIME': {
      if (!(action.animeId in state.items)) return state;

      const items = { ...state.items };
      delete items[action.animeId];

      return { ...state, items, order: removeItem(state.order, action.animeId) };
    }

    case 'MOVE_ANIME': {
      const fromTierId = findTierIdForAnime(state.order, action.animeId);
      if (!fromTierId) return state;
      return {
        ...state,
        order: moveItem(state.order, action.animeId, fromTierId, action.toTierId, action.toIndex),
      };
    }

    case 'RESET': {
      // Tiers reset to the defaults, but ranked anime moves to unranked rather than being deleted.
      const order: Record<string, number[]> = {
        [UNRANKED_TIER_ID]: Object.keys(state.items).map(Number),
      };
      for (const tier of DEFAULT_TIERS) {
        order[tier.id] = [];
      }
      return {
        version: 1,
        tiers: DEFAULT_TIERS.map((tier) => ({ ...tier })),
        items: state.items,
        order,
      };
    }

    default:
      return state;
  }
}
