import { useSearchParams } from 'react-router-dom';
import { useUserAnimeList } from './useAnime';
import { countListStats } from '@/lib/listRate';
import type { StatusType } from '@/types/constants';

export function useUserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || undefined;
  const isFavorites = searchParams.get('favorites') === 'true';
  const { data: filteredListData, isLoading } = useUserAnimeList(
    statusParam as StatusType | undefined,
    isFavorites
  );
  const { data: allListsData } = useUserAnimeList();

  const allLists = Array.isArray(allListsData) ? allListsData : [];
  const stats = countListStats(allLists);

  const filteredList = Array.isArray(filteredListData) ? filteredListData : [];
  const displayList = !statusParam && !isFavorites ? allLists : filteredList;

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
