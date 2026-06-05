import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { GenreResponse, TagResponse } from '@/types';

interface FilterDialogContentProps {
  genresData?: { genres: GenreResponse[] };
  tagsData?: TagResponse[];
  genres: string;
  yearParam: string;
  rating: number | undefined;
  tags: string;
  allYears: number[];
  ratingOptions: number[];
  tagSearchInput: string;
  genreSearchInput: string;
  onToggleGenre: (genre: string) => void;
  onToggleYear: (year: number) => void;
  onToggleTag: (tag: string) => void;
  onUpdateRating: (rating: string) => void;
  onClearFilters: () => void;
  onClose: () => void;
  onTagSearchChange: (value: string) => void;
  onGenreSearchChange: (value: string) => void;
}

export function FilterDialogContent({
  genresData,
  tagsData,
  genres,
  yearParam,
  rating,
  tags,
  allYears,
  ratingOptions,
  tagSearchInput,
  genreSearchInput,
  onToggleGenre,
  onToggleYear,
  onToggleTag,
  onUpdateRating,
  onClearFilters,
  onClose,
  onTagSearchChange,
  onGenreSearchChange,
}: FilterDialogContentProps) {
  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!tagsData) return [];
    if (!tagSearchInput) return tagsData;
    const searchLower = tagSearchInput.toLowerCase();
    return tagsData.filter((tag) => tag.name.toLowerCase().includes(searchLower));
  }, [tagsData, tagSearchInput]);

  // Filter genres by search
  const filteredGenres = useMemo(() => {
    if (!genresData?.genres) return [];
    if (!genreSearchInput) return genresData.genres;
    const searchLower = genreSearchInput.toLowerCase();
    return genresData.genres.filter((genre) => 
      genre.title.toLowerCase().includes(searchLower)
    );
  }, [genresData, genreSearchInput]);

  return (
    <div className="space-y-6">
      {/* Rating filter */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Минимальный рейтинг</h4>
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((r) => (
            <Badge
              key={r}
              variant={rating === r ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onUpdateRating(rating === r ? '' : String(r))}
            >
              <Star className="w-3 h-3 mr-1" />
              {r}+
            </Badge>
          ))}
        </div>
      </div>

      {/* Year filter */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Год выпуска</h4>
        <div className="flex flex-wrap gap-2">
          {allYears.map((y) => (
            <Badge
              key={y}
              variant={yearParam.split(',').includes(String(y)) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onToggleYear(y)}
            >
              {y}
            </Badge>
          ))}
        </div>
      </div>

      {/* Genres filter with search */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Жанры</h4>
        <Input
          placeholder="Поиск жанров..."
          value={genreSearchInput}
          onChange={(e) => onGenreSearchChange(e.target.value)}
          className="mb-2"
        />
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredGenres.map((genre) => (
            <Badge
              key={genre.value}
              variant={genres.split(',').includes(genre.href) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onToggleGenre(genre.href)}
            >
              {genre.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags filter with search */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Теги</h4>
        <Input
          placeholder="Поиск тегов..."
          value={tagSearchInput}
          onChange={(e) => onTagSearchChange(e.target.value)}
          className="mb-2"
        />
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredTags.slice(0, 50).map((tag) => (
            <Badge
              key={tag.id}
              variant={tags.split(',').includes(tag.name) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onToggleTag(tag.name)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear and apply buttons */}
      <div className="flex gap-2 pt-4 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onClearFilters}
        >
          Сбросить
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={onClose}
        >
          Применить
        </Button>
      </div>
    </div>
  );
}