import { UNRANKED_TIER_ID } from '@/types/tier';
import type { TierDefinition } from '@/types/tier';

export interface MoveTarget {
  id: string;
  label: string;
}

export function buildMoveTargets(tiers: TierDefinition[]): MoveTarget[] {
  return [{ id: UNRANKED_TIER_ID, label: 'Не оценено' }, ...tiers.map((tier) => ({ id: tier.id, label: tier.label }))];
}
