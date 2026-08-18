import { useCatalogPage } from '@/hooks';
import { AnimeGrid } from '@/components/AnimeGrid';
import { CatalogControls } from '@/components/search/CatalogControls';
import { FilterBadges } from '@/components/search/FilterBadges';

export function CatalogPage() {
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
    <div className="space-y-6">
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
        <div className="text-center py-12 text-muted-foreground">
          Аниме не найдены
        </div>
      ) : (
        <AnimeGrid anime={animeData?.data || []} userAnimeList={userAnimeList} view={view} />
      )}
    </div>
  );
}
