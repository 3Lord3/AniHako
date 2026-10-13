import { useCatalogPage, usePageTitle } from '@/hooks';
import { AnimeGrid } from '@/components/AnimeGrid';
import { CatalogControls } from '@/components/search/CatalogControls';
import { FilterBadges } from '@/components/search/FilterBadges';
import { EmptyState } from '@/components/States';
import { Search as SearchIcon } from 'lucide-react';
import { useT } from '@/i18n';

export function CatalogPage() {
  const { t } = useT();
  usePageTitle(t('nav.catalog'));
  const {
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
  } = useCatalogPage();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <CatalogControls
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchClear={clearSearch}
          view={view}
          onViewChange={setView}
          hasActiveFilters={hasActiveFilters}
          genresData={genresData}
          selectedGenres={genres}
          selectedRating={minRating}
          toYear={toYear}
          fromYear={fromYear}
          onToggleGenre={toggleGenre}
          onUpdateParams={updateParams}
          onClearFilters={clearFiltersOnly}
        />

        <FilterBadges
          fromYear={fromYear}
          toYear={toYear}
          minRating={minRating}
          genres={genres}
          onUpdateParams={updateParams}
          onClearFilters={clearFiltersOnly}
        />
      </div>

      {isLoading ? (
        <AnimeGrid anime={[]} isLoading={true} view={view} />
      ) : animeData?.data.length === 0 ? (
        <EmptyState
          title={t('search.noResultsText')}
          icon={<SearchIcon className="w-5 h-5" aria-hidden />}
        />
      ) : (
        <AnimeGrid anime={animeData?.data || []} userAnimeList={userAnimeList} view={view} />
      )}
    </div>
  );
}
