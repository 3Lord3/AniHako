export type TierColorId =
  | 'rose'
  | 'orange'
  | 'amber'
  | 'emerald'
  | 'sky'
  | 'violet'
  | 'pink'
  | 'slate';

export interface TierColorPreset {
  id: TierColorId;
  bg: string;
  text: string;
}

export const TIER_COLOR_PRESETS: TierColorPreset[] = [
  { id: 'rose', bg: 'bg-rose-500', text: 'text-white' },
  { id: 'orange', bg: 'bg-orange-500', text: 'text-white' },
  { id: 'amber', bg: 'bg-amber-500', text: 'text-white' },
  { id: 'emerald', bg: 'bg-emerald-500', text: 'text-white' },
  { id: 'sky', bg: 'bg-sky-500', text: 'text-white' },
  { id: 'violet', bg: 'bg-violet-500', text: 'text-white' },
  { id: 'pink', bg: 'bg-pink-500', text: 'text-white' },
  { id: 'slate', bg: 'bg-slate-500', text: 'text-white' },
];

export function getTierColorPreset(color: TierColorId): TierColorPreset {
  return TIER_COLOR_PRESETS.find((preset) => preset.id === color) ?? TIER_COLOR_PRESETS[0];
}

export const UNRANKED_TIER_ID = 'unranked';

export interface TierDefinition {
  id: string;
  label: string;
  color: TierColorId;
}

export interface TierAnimeItem {
  animeId: number;
  title: string;
  posterUrl: string;
  url: string;
}

export interface TierListState {
  version: 1;
  tiers: TierDefinition[];
  items: Record<number, TierAnimeItem>;
  order: Record<string, number[]>;
}

export const DEFAULT_TIERS: TierDefinition[] = [
  { id: 'tier-s', label: 'S', color: 'rose' },
  { id: 'tier-a', label: 'A', color: 'orange' },
  { id: 'tier-b', label: 'B', color: 'amber' },
  { id: 'tier-c', label: 'C', color: 'emerald' },
  { id: 'tier-d', label: 'D', color: 'sky' },
];

export function createEmptyTierList(): TierListState {
  const order: Record<string, number[]> = { [UNRANKED_TIER_ID]: [] };
  for (const tier of DEFAULT_TIERS) {
    order[tier.id] = [];
  }
  return {
    version: 1,
    tiers: DEFAULT_TIERS.map((tier) => ({ ...tier })),
    items: {},
    order,
  };
}
