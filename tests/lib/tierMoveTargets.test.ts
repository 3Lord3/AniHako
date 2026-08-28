import { describe, it, expect } from 'vitest';
import { buildMoveTargets } from '@/lib/tierMoveTargets';
import { DEFAULT_TIERS, UNRANKED_TIER_ID } from '@/types/tier';

describe('buildMoveTargets', () => {
  it('prepends the unranked pool to the tier list', () => {
    const targets = buildMoveTargets(DEFAULT_TIERS);
    expect(targets[0]).toEqual({ id: UNRANKED_TIER_ID, label: 'Не оценено' });
    expect(targets.slice(1)).toEqual(DEFAULT_TIERS.map((t) => ({ id: t.id, label: t.label })));
  });

  it('returns just the unranked target for an empty tier list', () => {
    expect(buildMoveTargets([])).toEqual([{ id: UNRANKED_TIER_ID, label: 'Не оценено' }]);
  });
});
