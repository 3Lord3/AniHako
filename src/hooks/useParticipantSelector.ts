import { useState } from 'react';
import { useAnimeSearchQuery } from './useAnimeSearchQuery';
import { toParticipantRate } from '@/lib/tournamentMapper';
import type { YummyUserAnimeRate, AnimeCatalogItem } from '@/types';

export const PARTICIPANT_SELECTOR_MIN_QUERY_LENGTH = 3;

export function useParticipantSelector(
  completedAnime: YummyUserAnimeRate[],
  selectedAnime: YummyUserAnimeRate[],
  onSelectionChange: (anime: YummyUserAnimeRate[]) => void
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const {
    results: availableResults,
    isLoading: isSearching,
    debouncedQuery: debouncedSearch,
  } = useAnimeSearchQuery(searchQuery, {
    minLength: PARTICIPANT_SELECTOR_MIN_QUERY_LENGTH,
    limit: 10,
    exclude: (anime) => selectedAnime.some((a) => a.anime_id === anime.anime_id),
  });

  const handleAddAllCompleted = () => {
    const remaining = completedAnime.filter(
      (anime) => !selectedAnime.some((a) => a.anime_id === anime.anime_id)
    );
    onSelectionChange([...selectedAnime, ...remaining]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleAddFromSearch = (anime: AnimeCatalogItem) => {
    // Captured at click time inside an event handler, not at render.
    // eslint-disable-next-line react-hooks/purity
    const rate = toParticipantRate(anime, Math.floor(Date.now() / 1000));
    onSelectionChange([...selectedAnime, rate]);
    setSearchQuery('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleRemove = (animeId: number) => {
    onSelectionChange(selectedAnime.filter((a) => a.anime_id !== animeId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
  };

  const remaining = completedAnime.filter(
    (anime) => !selectedAnime.some((a) => a.anime_id === anime.anime_id)
  );

  return {
    searchQuery,
    setSearchQuery,
    showDropdown,
    setShowDropdown,
    highlightedIndex,
    availableResults,
    isSearching,
    debouncedSearch,
    remaining,
    handleAddAllCompleted,
    handleAddFromSearch,
    handleRemove,
    handleClearAll,
    handleInputChange,
    clearSearch,
  };
}
