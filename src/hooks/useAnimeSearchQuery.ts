import { useAnimeList } from './useAnime';
import { useDebouncedMinLengthQuery } from './useDebouncedMinLengthQuery';
import type { AnimeCatalogItem } from '@/types';

interface UseAnimeSearchQueryOptions {
  minLength?: number;
  limit?: number;
  enabled?: boolean;
  exclude?: (item: AnimeCatalogItem) => boolean;
}

export function useAnimeSearchQuery(query: string, options: UseAnimeSearchQueryOptions = {}) {
  const { minLength = 3, limit = 10, enabled = true, exclude } = options;
  const { debouncedQuery, isQueryLongEnough } = useDebouncedMinLengthQuery(query, minLength);

  const { data, isLoading } = useAnimeList(
    { search: debouncedQuery, limit },
    { enabled: enabled && isQueryLongEnough }
  );

  const results: AnimeCatalogItem[] = (data?.data ?? []).filter((item) => !exclude?.(item));

  return { results, isLoading, isQueryLongEnough, debouncedQuery };
}
