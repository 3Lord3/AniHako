import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { useAnimeList } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { toTierAnimeItem } from '@/lib/tierAnimeMapper';
import { getPosterUrl } from '@/lib/imageUrl';
import type { AnimeCatalogItem } from '@/types/anime';
import type { TierAnimeItem } from '@/types/tier';

interface AddAnimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAnimeIds: Set<number>;
  onSelect: (item: TierAnimeItem) => void;
}

const MIN_QUERY_LENGTH = 2;

export function AddAnimeDialog({ open, onOpenChange, existingAnimeIds, onSelect }: AddAnimeDialogProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const isQueryLongEnough = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  const { data, isLoading } = useAnimeList(
    { search: debouncedQuery, limit: 20 },
    { enabled: open && isQueryLongEnough }
  );

  const results: AnimeCatalogItem[] = (data?.data ?? []).filter(
    (anime) => !existingAnimeIds.has(anime.anime_id)
  );

  const handleSelect = (anime: AnimeCatalogItem) => {
    onSelect(toTierAnimeItem(anime));
    setQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Добавить аниме в тир-лист</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Название аниме..." value={query} onValueChange={setQuery} />
          <CommandList>
            {!isQueryLongEnough && <CommandEmpty>Введите минимум {MIN_QUERY_LENGTH} символа</CommandEmpty>}
            {isQueryLongEnough && isLoading && <CommandEmpty>Поиск...</CommandEmpty>}
            {isQueryLongEnough && !isLoading && results.length === 0 && (
              <CommandEmpty>Ничего не найдено</CommandEmpty>
            )}
            {results.map((anime) => (
              <CommandItem
                key={anime.anime_id}
                value={String(anime.anime_id)}
                onSelect={() => handleSelect(anime)}
              >
                <img src={getPosterUrl(anime, 'small')} alt="" className="size-8 rounded object-cover" />
                <span className="truncate">{anime.title}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
