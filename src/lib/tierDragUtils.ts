export function findTierIdForAnime(
  order: Record<string, number[]>,
  animeId: number
): string | undefined {
  return Object.keys(order).find((tierId) => order[tierId]?.includes(animeId));
}

export function moveItem(
  order: Record<string, number[]>,
  animeId: number,
  fromTierId: string,
  toTierId: string,
  toIndex: number
): Record<string, number[]> {
  const fromList = order[fromTierId] ?? [];
  const sourceIndex = fromList.indexOf(animeId);
  if (sourceIndex === -1) return order;

  const nextFromList = [...fromList];
  nextFromList.splice(sourceIndex, 1);

  const isSameTier = fromTierId === toTierId;
  const toList = isSameTier ? nextFromList : [...(order[toTierId] ?? [])];

  const clampedIndex = Math.max(0, Math.min(toIndex, toList.length));
  toList.splice(clampedIndex, 0, animeId);

  if (isSameTier) {
    return { ...order, [fromTierId]: toList };
  }

  return {
    ...order,
    [fromTierId]: nextFromList,
    [toTierId]: toList,
  };
}

export interface DropTarget {
  tierId: string;
  index: number;
}

export function resolveDropTarget(
  order: Record<string, number[]>,
  overId: string,
  overData: { tierId?: string; type?: string } | undefined
): DropTarget {
  const tierId = overData?.tierId ?? overId;
  const overAnimeId = overData?.type === 'card' ? Number(overId) : undefined;
  const tierOrder = order[tierId] ?? [];
  const index = overAnimeId !== undefined ? tierOrder.indexOf(overAnimeId) : tierOrder.length;
  return { tierId, index };
}

export function removeItem(
  order: Record<string, number[]>,
  animeId: number
): Record<string, number[]> {
  const next: Record<string, number[]> = {};
  for (const [tierId, ids] of Object.entries(order)) {
    next[tierId] = ids.filter((id) => id !== animeId);
  }
  return next;
}
