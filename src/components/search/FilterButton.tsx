import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { FilterDialogContent } from '@/components/search/FilterDialog';

interface FilterButtonProps {
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

export function FilterButton({
  hasActiveFilters,
  genresData,
  selectedGenres,
  selectedRating,
  toYear,
  fromYear,
  onToggleGenre,
  onUpdateParams,
  onClearFilters,
}: FilterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        className="relative cursor-pointer text-foreground"
        onClick={() => setOpen(true)}
      >
        <Filter className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Фильтры</span>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </Button>
      <DialogContent 
        className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto"
        style={{ maxWidth: '42rem' }}
        showCloseButton={false}
      >
        <div className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold">Фильтры</DialogTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <FilterDialogContent
          open={open}
          onOpenChange={setOpen}
          genresData={genresData}
          selectedGenres={selectedGenres}
          selectedRating={selectedRating}
          toYear={toYear}
          fromYear={fromYear}
          onToggleGenre={onToggleGenre}
          onUpdateParams={onUpdateParams}
          onClearFilters={onClearFilters}
        />
      </DialogContent>
    </Dialog>
  );
}