import { UNRANKED_TIER_ID } from '@/types/tier';
import type { TierDefinition } from '@/types/tier';
import type { Translator } from '@/i18n';

export interface MoveTarget {
  id: string;
  label: string;
}

export function buildMoveTargets(tiers: TierDefinition[], t: Translator): MoveTarget[] {
  return [{ id: UNRANKED_TIER_ID, label: t('tier.unranked') }, ...tiers.map((tier) => ({ id: tier.id, label: tier.label }))];
}
