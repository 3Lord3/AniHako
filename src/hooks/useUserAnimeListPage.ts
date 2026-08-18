import { useSearchParams } from 'react-router-dom';
import { useUserAnimeList } from './useAnime';
import { countListStats, getRateStatus, isRateFavorite } from '@/lib/listRate';
import type { StatusType } from '@/types/constants';

export function useUserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || undefined;
  const isFavorites = searchParams.get('favorites') === 'true';
  const { data: allListsData, isLoading } = useUserAnimeList();
  const allLists = allListsData ?? [];

  const stats = countListStats(allLists);

  const displayList = allLists.filter((rate) => {
    if (statusParam && getRateStatus(rate) !== statusParam) return false;
    if (isFavorites && !isRateFavorite(rate)) return false;
    return true;
  });

  const selectStatus = (status: StatusType) => {
    setSearchParams(statusParam === status ? {} : { status });
  };

  const selectFavorites = () => {
    setSearchParams(isFavorites ? {} : { favorites: 'true' });
  };

  return {
    statusParam,
    isFavorites,
    isLoading,
    stats,
    displayList,
    selectStatus,
    selectFavorites,
  };
}
