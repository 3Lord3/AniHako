import { Star, Calendar, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AnimeCatalogItem } from '@/types';
import { getImageUrl, getHeroPosterUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';

interface TournamentCardProps {
  anime: AnimeCatalogItem;
  isWinner?: boolean;
  isEliminated?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function TournamentCard({
  anime,
  isWinner = false,
  isEliminated = false,
  isSelected = false,
  onClick,
  showDetails = true,
  compact = false,
  className = ''
}: TournamentCardProps) {
  const posterUrl = getHeroPosterUrl(anime);
  const rating = anime.rating?.average ? Number(anime.rating.average) : null;
  const validRating = rating !== null && !isNaN(rating);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300 bg-card",
        onClick && !isEliminated && "cursor-pointer hover:scale-[1.02] hover:shadow-2xl",
        isWinner && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-background",
        isSelected && !isWinner && "relative z-20",
        isEliminated && "opacity-50 grayscale",
        compact ? "w-[58%] sm:w-4/5 lg:w-3/4 aspect-[2/3] max-h-full" : "aspect-[2/3]",
        className
      )}
    >
      <div className={cn("relative w-full h-full", compact ? "h-full" : "aspect-[2/3]")}>
        {posterUrl ? (
          <img
            src={getImageUrl(posterUrl)}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className={cn("text-muted-foreground", compact ? "w-16 h-16 sm:w-24 sm:h-24" : "w-20 h-20")} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {isWinner && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <Badge className={cn(
              "bg-yellow-500 text-black font-bold",
              compact ? "px-2 py-1 text-xs sm:text-sm" : "px-3 py-1 text-sm"
            )}>
              🏆 Победитель
            </Badge>
          </div>
        )}

        {showDetails && anime.genres && anime.genres.length > 0 && (
          <div className="absolute top-3 left-3 sm:top-4 sm:right-4 sm:left-auto right-3 flex flex-wrap gap-1 z-10 w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-[60%] justify-start sm:justify-end">
            {anime.genres.slice(0, 2).map((g) => (
              <Badge
                key={g.id}
                className={cn(
                  "text-white font-semibold border-0 backdrop-blur-sm",
                  compact ? "text-xs sm:text-sm px-2 py-1 bg-black/70" : "text-xs sm:text-sm px-2.5 py-1 bg-black/70"
                )}
              >
                {g.title}
              </Badge>
            ))}
          </div>
        )}

        <div className={cn("absolute bottom-0 left-0 right-0 text-white", compact ? "p-3 sm:p-4 md:p-6" : "p-4")}>
          <h3 className={cn(
            "font-bold line-clamp-2",
            compact ? "text-sm sm:text-base md:text-lg" : "text-lg mb-1"
          )}>{anime.title}</h3>

          {showDetails && (
            <div className={cn("flex items-center gap-2 sm:gap-3", compact ? "text-xs sm:text-sm md:text-base" : "text-sm")}>
              {validRating && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Star className={cn("text-yellow-400 fill-yellow-400", compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4")} />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Calendar className={compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"} />
                  <span>{anime.year}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isSelected && !isWinner && (
        <div className="absolute inset-0 bg-green-500/30 rounded-xl z-20 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white font-bold text-2xl sm:text-4xl drop-shadow-lg">✓</span>
        </div>
      )}

      {onClick && !isEliminated && !isSelected && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className={cn(
            "bg-white/90 text-black rounded-full font-semibold",
            compact ? "px-4 py-2 text-sm sm:text-base" : "px-4 py-2 text-sm"
          )}>
            Выбрать
          </div>
        </div>
      )}
    </div>
  );
}
