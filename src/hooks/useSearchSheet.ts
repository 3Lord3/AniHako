import { useState, useEffect, useRef } from 'react';
import { useAnimeSearch } from './useAnime';
import { useDebouncedMinLengthQuery } from './useDebouncedMinLengthQuery';
import { useKeyboardInset } from './useKeyboardInset';
import type { AnimeCatalogItem } from '@/types';

export const SEARCH_SHEET_MIN_QUERY_LENGTH = 3;

export function useSearchSheet(open: boolean) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardInset(open);

  const { trimmedQuery: trimmedDebounced, isQueryLongEnough } = useDebouncedMinLengthQuery(
    query,
    SEARCH_SHEET_MIN_QUERY_LENGTH
  );
  const searchQuery = isQueryLongEnough ? trimmedDebounced : '';
  const { data: results, isLoading } = useAnimeSearch(searchQuery, 10);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    setQuery('');
    inputRef.current?.blur();
  }, [open]);

  const list: AnimeCatalogItem[] = results && 'data' in results ? results.data : [];
  const trimmedQuery = query.trim();
  const isTooShort = trimmedQuery.length > 0 && trimmedQuery.length < SEARCH_SHEET_MIN_QUERY_LENGTH;
  const showEmpty = !trimmedQuery;
  const showNoResults =
    trimmedQuery.length >= SEARCH_SHEET_MIN_QUERY_LENGTH && !isLoading && list.length === 0;

  return {
    query,
    setQuery,
    clearQuery: () => setQuery(''),
    inputRef,
    keyboardInset,
    list,
    isLoading,
    trimmedQuery,
    isTooShort,
    showEmpty,
    showNoResults,
  };
}
