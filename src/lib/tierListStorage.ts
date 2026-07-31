import type { TierAnimeItem, TierListState, TierDefinition } from '@/types/tier';
import { createEmptyTierList, UNRANKED_TIER_ID } from '@/types/tier';

function storageKey(userId: number): string {
  return `anitier:v1:${userId}`;
}

// Upgrades URLs baked in before the poster size was bumped from 'small' to 'big'.
function upgradePosterUrl(url: string): string {
  return url.replace(/\/posters\/(small|medium)\//, '/posters/big/');
}

function isValidTierAnimeItem(item: unknown): item is TierAnimeItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as TierAnimeItem).animeId === 'number' &&
    typeof (item as TierAnimeItem).title === 'string' &&
    typeof (item as TierAnimeItem).posterUrl === 'string' &&
    typeof (item as TierAnimeItem).url === 'string'
  );
}

// Drops individually malformed entries instead of failing the whole load.
function upgradeItems(items: Record<number, TierAnimeItem>): Record<number, TierAnimeItem> {
  const upgraded: Record<number, TierAnimeItem> = {};
  for (const [id, item] of Object.entries(items)) {
    if (!isValidTierAnimeItem(item)) continue;
    upgraded[Number(id)] = { ...item, posterUrl: upgradePosterUrl(item.posterUrl) };
  }
  return upgraded;
}

// Guarantees every current tier (plus unranked) has an id array, so reducer cases can safely
// spread order[tierId] even if storage predates a tier or was hand-edited/corrupted.
function normalizeOrder(order: unknown, tiers: TierDefinition[]): Record<string, number[]> {
  const source = (order && typeof order === 'object' ? order : {}) as Record<string, unknown>;
  const next: Record<string, number[]> = {};
  for (const tierId of [UNRANKED_TIER_ID, ...tiers.map((tier) => tier.id)]) {
    const ids = source[tierId];
    next[tierId] = Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : [];
  }
  return next;
}

export function loadTierList(userId: number | undefined): TierListState {
  if (!userId) return createEmptyTierList();

  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createEmptyTierList();

    const parsed = JSON.parse(raw) as Partial<TierListState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.tiers) || !parsed.items || !parsed.order) {
      return createEmptyTierList();
    }

    return {
      version: 1,
      tiers: parsed.tiers,
      items: upgradeItems(parsed.items),
      order: normalizeOrder(parsed.order, parsed.tiers),
    };
  } catch {
    return createEmptyTierList();
  }
}

export function saveTierList(userId: number | undefined, state: TierListState): void {
  if (!userId) return;
  localStorage.setItem(storageKey(userId), JSON.stringify(state));
}
