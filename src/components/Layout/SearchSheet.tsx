import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Loader2, Calendar, Star } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useAnimeSearch, useDebounce } from '@/hooks';
import { getImageUrl, getPosterUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';
import type { AnimeCatalogItem } from '@/types';

const MIN_QUERY_LENGTH = 3;

function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active || typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    const update = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(keyboardHeight);
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);

  return inset;
}

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardInset(open);

  const trimmedDebounced = debouncedQuery.trim();
  const searchQuery = trimmedDebounced.length >= MIN_QUERY_LENGTH ? trimmedDebounced : '';
  const { data: results, isLoading } = useAnimeSearch(searchQuery, 10);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    setQuery('');
    inputRef.current?.blur();
  }, [open]);

  const list: AnimeCatalogItem[] = results && 'data' in results ? results.data : [];
  const trimmedQuery = query.trim();
  const isTooShort = trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH;
  const showEmpty = !trimmedQuery;
  const showNoResults =
    trimmedQuery.length >= MIN_QUERY_LENGTH && !isLoading && list.length === 0;

  const sheetStyle = keyboardInset > 0
    ? {
        bottom: keyboardInset,
        maxHeight: `calc(100dvh - ${keyboardInset}px)`,
      }
    : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl max-h-[85dvh] p-0"
        style={sheetStyle}
      >
        <SheetHeader className="p-4 pb-2">
          <SheetTitle>Поиск аниме</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Введите название..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-11"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Очистить"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            ) : isLoading ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            ) : null}
          </div>
        </div>

        <div
          className="overflow-y-auto px-2 pb-6 pt-2"
          style={{ maxHeight: 'calc(85dvh - 130px)' }}
        >
          {showEmpty && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Начните вводить название аниме
            </p>
          )}

          {isTooShort && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Введите минимум {MIN_QUERY_LENGTH} символа для поиска
            </p>
          )}

          {showNoResults && (
            <p className="text-sm text-muted-foreground text-center py-8">
              По запросу «{trimmedQuery}» ничего не найдено
            </p>
          )}

          {list.length > 0 && (
            <ul className="space-y-1">
              {list.map((anime) => (
                <li key={anime.anime_id}>
                  <Link
                    to={`/anime/${anime.anime_url || anime.anime_id}`}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg',
                      'hover:bg-accent active:bg-accent/80 transition-colors'
                    )}
                  >
                    <img
                      src={getImageUrl(getPosterUrl(anime))}
                      alt=""
                      className="w-12 h-16 object-cover rounded shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate text-sm">{anime.title}</p>
                      {(anime.year || anime.rating?.average) ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {anime.year ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {anime.year}
                            </span>
                          ) : null}
                          {anime.rating?.average ? (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {anime.rating.average.toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
