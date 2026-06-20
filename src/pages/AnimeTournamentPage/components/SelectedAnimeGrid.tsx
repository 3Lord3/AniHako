import { X } from 'lucide-react';

import { getImageUrl } from '@/lib/imageUrl';
import type { AnimeListItem } from '@/types';

interface SelectedAnimeGridProps {
  selectedAnime: AnimeListItem[];
  onRemove: (animeId: number) => void;
  onClearAll: () => void;
}

export function SelectedAnimeGrid({
  selectedAnime,
  onRemove,
}: SelectedAnimeGridProps) {
  if (selectedAnime.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Выберите аниме для участия в турнире</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
        {selectedAnime.map((anime) => (
          <div
            key={anime.anime_id}
            onClick={() => onRemove(anime.anime_id)}
            className="relative group aspect-[2/3] rounded-lg overflow-hidden cursor-pointer"
          >
            <img
              src={getImageUrl(anime.poster.small)}
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
    </>
  );
}
