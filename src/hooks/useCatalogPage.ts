import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnimeList, useUserAnimeList, useGenres } from './useAnime';
import { useDebounce } from './useDebounce';

const CATALOG_VIEW_STORAGE_KEY = 'catalogView';

export function useCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const genres = searchParams.get('genres') || '';
  const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;

  const [searchInput, setSearchInput] = useState(search);
  const searchInputRef = useRef('');
  const lastCommittedInputRef = useRef(search);
  const sortForward = searchParams.get('sort_forward') !== 'false';
  const toYear = searchParams.get('to_year') || '';
  const fromYear = searchParams.get('from_year') || '';

  const debouncedSearch = useDebounce(searchInput, 300);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const stored = localStorage.getItem(CATALOG_VIEW_STORAGE_KEY);
    if (stored === 'list' || stored === 'grid') {
      setView(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CATALOG_VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    searchInputRef.current = searchInput;
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch !== searchInputRef.current) return;
    if (debouncedSearch === lastCommittedInputRef.current) return;
    lastCommittedInputRef.current = debouncedSearch;
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  }, [debouncedSearch, searchParams, setSearchParams]);

  useEffect(() => {
    if (search === lastCommittedInputRef.current) return;
    lastCommittedInputRef.current = search;
    setSearchInput(search);
  }, [search]);

  const clearSearch = () => {
    setSearchInput('');
    lastCommittedInputRef.current = '';
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
  };

  const queryParams = {
    page: 1,
    limit: 100,
    q: search || undefined,
    genre: genres ? genres.split(',') : undefined,
    from_year: fromYear ? parseInt(fromYear, 10) : undefined,
    to_year: toYear ? parseInt(toYear, 10) : undefined,
    min_rating: minRating,
    sort_forward: sortForward,
  };

  const { data: animeData, isLoading } = useAnimeList(queryParams);
  const { data: genresData } = useGenres();
  const { data: userAnimeList } = useUserAnimeList();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const toggleGenre = (genreName: string) => {
    const currentGenres = genres ? genres.split(',') : [];
    const newGenres = currentGenres.includes(genreName)
      ? currentGenres.filter((g) => g !== genreName)
      : [...currentGenres, genreName];
    updateParams('genres', newGenres.join(','));
  };

  const clearFiltersOnly = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('genres');
    params.delete('rating');
    params.delete('sort_forward');
    params.delete('to_year');
    params.delete('from_year');
    setSearchParams(params);
  };

  const hasActiveFilters = !!(genres || minRating || fromYear || toYear);

  return {
    searchInput,
    setSearchInput,
    clearSearch,
    view,
    setView,
    hasActiveFilters,
    genresData,
    genres,
    minRating,
    toYear,
    fromYear,
    toggleGenre,
    updateParams,
    clearFiltersOnly,
    animeData,
    isLoading,
    userAnimeList,
  };
}
