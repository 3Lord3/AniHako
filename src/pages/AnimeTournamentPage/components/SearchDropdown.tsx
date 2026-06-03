import { useRef, useEffect } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getImageUrl } from '@/lib/imageUrl';
import type { AnimeListItem } from '@/types';
import { cn } from '@/lib/utils';

interface SearchDropdownProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  results: AnimeListItem[];
  isLoading: boolean;
  onSelect: (anime: AnimeListItem) => void;
  onClose: () => void;
  highlightedIndex: number;
  onHighlightChange: (index: number) => void;
}

export function SearchDropdown({
  searchQuery,
  onSearchChange,
  results,
  isLoading,
  onSelect,
  onClose,
  highlightedIndex,
  onHighlightChange,
}: SearchDropdownProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onHighlightChange(
          highlightedIndex < results.length - 1 ? highlightedIndex + 1 : highlightedIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        onHighlightChange(highlightedIndex > 0 ? highlightedIndex - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          onSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Поиск аниме..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          onFocus={() => {
            if (searchQuery.trim()) {
              onClose(); // Let parent handle opening
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-sm">Поиск...</span>
          </div>
        ) : results.length > 0 ? (
          <ul className="py-1">
            {results.map((anime, index) => (
              <li key={anime.id}>
                <button
                  onClick={() => onSelect(anime)}
                  className={cn(
                    "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2 hover:bg-accent transition-colors text-left active:bg-accent/80",
                    index === highlightedIndex ? 'bg-accent' : ''
                  )}
                >
                  <img
                    src={getImageUrl(anime.poster.small)}
                    alt={anime.title}
                    className="w-8 h-11 sm:w-10 sm:h-14 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-sm text-foreground truncate">
                      {anime.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {anime.year || '—'} • {anime.genres?.slice(0, 2).map((g) => g.title).join(', ') || '—'}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        ) : searchQuery ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Ничего не найдено
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Введите название аниме
          </div>
        )}
      </div>
    </div>
  );
}