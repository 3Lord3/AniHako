import { useEffect, useMemo, useReducer, useState } from 'react';
import { useUserAnimeList } from './useAnime';
import { tierListReducer } from '@/lib/tierListReducer';
import { loadTierList, saveTierList } from '@/lib/tierListStorage';
import { toTierAnimeItem } from '@/lib/tierAnimeMapper';
import { createEmptyTierList } from '@/types/tier';
import type { TierAnimeItem, TierColorId } from '@/types/tier';

export function useTierList(userId: number | undefined) {
  const { data: watchedAnime } = useUserAnimeList('completed');
  const [state, dispatch] = useReducer(tierListReducer, undefined, createEmptyTierList);
  const [isHydrated, setIsHydrated] = useState(false);

  // userId resolves after mount (useUser() is async), so load once it's known.
  useEffect(() => {
    if (!userId) return;
    dispatch({ type: 'LOAD', state: loadTierList(userId) });
    setIsHydrated(true);
  }, [userId]);

  useEffect(() => {
    // isHydrated avoids overwriting storage with the pre-load default state.
    if (!userId || !isHydrated) return;
    saveTierList(userId, state);
  }, [userId, state, isHydrated]);

  useEffect(() => {
    if (!watchedAnime?.length) return;
    const missing = watchedAnime.filter((anime) => !(anime.anime_id in state.items));
    if (missing.length === 0) return;
    dispatch({ type: 'SEED_ITEMS', items: missing.map(toTierAnimeItem) });
  }, [watchedAnime, state.items]);

  const actions = useMemo(
    () => ({
      addTier: () => dispatch({ type: 'ADD_TIER' }),
      renameTier: (tierId: string, label: string) => dispatch({ type: 'RENAME_TIER', tierId, label }),
      recolorTier: (tierId: string, color: TierColorId) =>
        dispatch({ type: 'RECOLOR_TIER', tierId, color }),
      removeTier: (tierId: string) => dispatch({ type: 'REMOVE_TIER', tierId }),
      reorderTiers: (tierIds: string[]) => dispatch({ type: 'REORDER_TIERS', tierIds }),
      addAnime: (item: TierAnimeItem) => dispatch({ type: 'ADD_ANIME', item }),
      removeAnime: (animeId: number) => dispatch({ type: 'REMOVE_ANIME', animeId }),
      moveAnime: (animeId: number, toTierId: string, toIndex: number) =>
        dispatch({ type: 'MOVE_ANIME', animeId, toTierId, toIndex }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  );

  return { state, ...actions };
}
