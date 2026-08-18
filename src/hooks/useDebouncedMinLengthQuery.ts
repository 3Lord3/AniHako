import { useDebounce } from './useDebounce';

/** Debounces a query string and reports whether the trimmed result reaches `minLength`. */
export function useDebouncedMinLengthQuery(query: string, minLength: number, delay = 300) {
  const debouncedQuery = useDebounce(query, delay);
  const trimmedQuery = debouncedQuery.trim();
  const isQueryLongEnough = trimmedQuery.length >= minLength;

  return { debouncedQuery, trimmedQuery, isQueryLongEnough };
}
