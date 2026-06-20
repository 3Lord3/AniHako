import { FilterButton } from './FilterButton';
import { ViewToggle } from './ViewToggle';
import { SearchBar } from '@/components/search/SearchBar';

interface CatalogControlsProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  hasActiveFilters: boolean;
  genresData: { genres: Array<{ title: string; href: string; value: number }> } | undefined;
  selectedGenres: string;
  selectedRating: number | undefined;
  toYear: string;
  fromYear: string;
  onToggleGenre: (genreName: string) => void;
  onUpdateParams: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function CatalogControls({
  searchInput,
  onSearchChange,
  onSearchClear,
  view,
  onViewChange,
  hasActiveFilters,
  genresData,
  selectedGenres,
  selectedRating,
  toYear,
  fromYear,
  onToggleGenre,
  onUpdateParams,
  onClearFilters,
}: CatalogControlsProps) {
  return (
    <div className="flex gap-2">
      <SearchBar
        value={searchInput}
        onChange={onSearchChange}
        onClear={onSearchClear}
      />
      <FilterButton
        hasActiveFilters={hasActiveFilters}
        genresData={genresData}
        selectedGenres={selectedGenres}
        selectedRating={selectedRating}
        toYear={toYear}
        fromYear={fromYear}
        onToggleGenre={onToggleGenre}
        onUpdateParams={onUpdateParams}
        onClearFilters={onClearFilters}
      />
      <ViewToggle view={view} onViewChange={onViewChange} />
    </div>
  );
}