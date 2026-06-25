import { useState } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAnimeList } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { YummyUserAnimeRate } from '@/types';
import { cn } from '@/lib/utils';
import { getPosterUrl } from '@/lib/imageUrl';

interface TournamentParticipantSelectorProps {
  completedAnime: YummyUserAnimeRate[];
  selectedAnime: YummyUserAnimeRate[];
  onSelectionChange: (anime: YummyUserAnimeRate[]) => void;
}

export function TournamentParticipantSelector({
  completedAnime,
  selectedAnime,
  onSelectionChange,
}: TournamentParticipantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const minQueryLength = 3;
  const isQueryLongEnough = debouncedSearch.trim().length >= minQueryLength;

  const { data: searchResults, isLoading: isSearching } = useAnimeList(
    { search: debouncedSearch, limit: 10 },
    { enabled: isQueryLongEnough }
  );

  const availableResults = (searchResults?.data || []).filter(
    (anime) => !selectedAnime.some((a) => a.anime_id === anime.anime_id)
  );

  const handleAddAllCompleted = () => {
    const remaining = completedAnime.filter(
      (anime) => !selectedAnime.some((a) => a.anime_id === anime.anime_id)
    );
    onSelectionChange([...selectedAnime, ...remaining]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleAddFromSearch = (anime: { anime_id: number; title: string; year?: number; poster?: { small?: string; medium?: string; big?: string; huge?: string; fullsize?: string; mega?: string }; anime_url?: string; rating?: { average?: number }; type?: { name: string; value: number; shortname: string; alias: string } }) => {
    const emptyPoster = { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' };
    const poster = anime.poster
      ? { ...emptyPoster, ...anime.poster }
      : emptyPoster;
    const rate: YummyUserAnimeRate = {
      anime_id: anime.anime_id,
      anime_url: anime.anime_url || String(anime.anime_id),
      title: anime.title,
      poster,
      rating: anime.rating?.average || 0,
      type: anime.type || { name: '', value: 0, shortname: '', alias: '' },
      year: anime.year,
      user: undefined,
      // Captured at click time inside an event handler, not at render.
      // eslint-disable-next-line react-hooks/purity
      date: Math.floor(Date.now() / 1000),
    };
    onSelectionChange([...selectedAnime, rate]);
    setSearchQuery('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleRemove = (animeId: number) => {
    onSelectionChange(selectedAnime.filter((a) => a.anime_id !== animeId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const remaining = completedAnime.filter(
    (anime) => !selectedAnime.some((a) => a.anime_id === anime.anime_id)
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск аниме..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border-border rounded-lg shadow-lg overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Поиск...</span>
              </div>
            ) : availableResults.length > 0 ? (
              <ul className="py-1">
                {availableResults.map((anime, index) => (
                  <li key={anime.anime_id}>
                    <button
                      onClick={() => handleAddFromSearch(anime)}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2 hover:bg-accent transition-colors text-left active:bg-accent/80",
                        index === highlightedIndex ? 'bg-accent' : ''
                      )}
                    >
                      <img
                        src={getPosterUrl(anime)}
                        alt={anime.title}
                        className="w-8 h-11 sm:w-10 sm:h-14 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-sm text-foreground truncate">
                          {anime.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {anime.year || '—'} • {anime.genres?.slice(0, 2).map((g: { title: string }) => g.title).join(', ') || '—'}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchQuery.trim().length > 0 && searchQuery.trim().length < minQueryLength ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Введите минимум {minQueryLength} символа
              </div>
            ) : debouncedSearch ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Введите название аниме
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
        <div className="flex flex-wrap items-center gap-2">
          {remaining.length > 0 && (
            <button
              onClick={handleAddAllCompleted}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-input bg-background text-foreground hover:bg-accent rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Просмотренные ({remaining.length})
            </button>
          )}
          {selectedAnime.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              Очистить
            </button>
          )}
        </div>
        {selectedAnime.length > 0 && (
          <span className="text-sm text-muted-foreground">
            Выбрано: {selectedAnime.length}
          </span>
        )}
      </div>

      {selectedAnime.length > 0 && (
        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {selectedAnime.map((anime) => (
            <div
              key={anime.anime_id}
              onClick={() => handleRemove(anime.anime_id)}
              className="relative group aspect-[2/3] rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={getPosterUrl(anime)}
                alt={anime.title}
                className="object-cover w-full h-full transition-all duration-200 group-hover:brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2">
                <p className="text-[10px] sm:text-xs font-medium text-white truncate leading-tight">
                  {anime.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAnime.length === 0 && completedAnime.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">У вас пока нет просмотренных аниме</p>
        </div>
      )}
    </div>
  );
}
