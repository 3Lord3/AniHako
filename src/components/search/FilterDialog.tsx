import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { ALL_YEARS_RANGE, RATING_OPTIONS } from '@/lib/constants';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genresData: { genres: Array<{ title: string; href: string; value: number }> } | undefined;
  selectedGenres: string;
  selectedRating: number | undefined;
  toYear?: string;
  fromYear?: string;
  onToggleGenre: (genreName: string) => void;
  onUpdateParams: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function FilterDialogContent({
  onOpenChange,
  genresData,
  selectedGenres,
  selectedRating,
  toYear,
  fromYear,
  onToggleGenre,
  onUpdateParams,
  onClearFilters,
}: FilterDialogProps) {
  const [genreSearchInput, setGenreSearchInput] = useState('');

  const filteredGenres = useMemo(() => {
    if (!genresData?.genres) return [];
    if (!genreSearchInput) return genresData.genres;
    const searchLower = genreSearchInput.toLowerCase();
    return genresData.genres.filter((genre) =>
      genre.title.toLowerCase().includes(searchLower)
    );
  }, [genresData, genreSearchInput]);

  const handleYearChange = (type: 'from' | 'to', value: string) => {
    onUpdateParams(type === 'from' ? 'from_year' : 'to_year', value);
  };

  const yearError = fromYear && toYear && parseInt(fromYear) > parseInt(toYear)
    ? 'Год "От" должен быть меньше чем "До"'
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Минимальный рейтинг</h4>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <Badge
              key={r.value}
              variant={selectedRating === r.value ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onUpdateParams('rating', selectedRating === r.value ? '' : String(r.value))}
            >
              <Star className="w-3 h-3 mr-1" />
              {r.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Год выпуска</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={fromYear}
            onChange={(e) => handleYearChange('from', e.target.value)}
          >
            <option value="">От года</option>
            {ALL_YEARS_RANGE.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">—</span>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={toYear}
            onChange={(e) => handleYearChange('to', e.target.value)}
          >
            <option value="">До года</option>
            {ALL_YEARS_RANGE.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {yearError && (
          <p className="text-sm text-destructive">{yearError}</p>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Жанры</h4>
        <Input
          placeholder="Поиск жанров..."
          value={genreSearchInput}
          onChange={(e) => setGenreSearchInput(e.target.value)}
          className="mb-2"
        />
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredGenres.map((genre) => (
            <Badge
              key={genre.value}
              variant={selectedGenres.split(',').includes(genre.href) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onToggleGenre(genre.href)}
            >
              {genre.title}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onClearFilters}
        >
          Очистить
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => onOpenChange(false)}
          disabled={!!yearError}
        >
          Применить
        </Button>
      </div>
    </div>
  );
}