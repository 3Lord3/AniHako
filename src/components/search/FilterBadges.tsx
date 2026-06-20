import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterBadgesProps {
  fromYear?: string;
  toYear?: string;
  minRating: number | undefined;
  genres: string;
  onUpdateParams: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function FilterBadges({
  fromYear,
  toYear,
  minRating,
  genres,
  onUpdateParams,
  onClearFilters,
}: FilterBadgesProps) {
  const hasActiveFilters = genres || minRating || fromYear || toYear;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {(fromYear || toYear) && (
        <Button variant="secondary" size="sm" onClick={() => { onUpdateParams('from_year', ''); onUpdateParams('to_year', ''); }}>
          {fromYear || '—'} — {toYear || '—'}
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
      {minRating && (
        <Button variant="secondary" size="sm" onClick={() => onUpdateParams('rating', '')}>
          Рейтинг: {minRating}+
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
      {genres && (
        <Button variant="secondary" size="sm" onClick={() => onUpdateParams('genres', '')}>
          Жанры: {genres.split(',').length}
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
      {hasActiveFilters && (
        <Button variant="secondary" size="sm" onClick={onClearFilters}>
          Очистить фильтры
        </Button>
      )}
    </div>
  );
}