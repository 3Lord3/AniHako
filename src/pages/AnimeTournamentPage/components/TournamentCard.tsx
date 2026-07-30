import { useState } from 'react';
import { Star, Calendar, Film, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimeTitle } from '@/components/anime/AnimeTitle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import type { AnimeCatalogItem } from '@/types';
import { getImageUrl, getHeroPosterUrl } from '@/lib/imageUrl';
import { getAnimeUrlSlug } from '@/lib/animeUrl';
import { cn } from '@/lib/utils';
import { useAnimeDetail } from '@/hooks';

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
  const [infoOpen, setInfoOpen] = useState(false);
  // Tournament participants are built from the user's anime list, which
  // doesn't include the description — fetch full details lazily once the
  // info modal is actually opened.
  const { data: animeDetail, isLoading: isDetailLoading, isError: isDetailError } = useAnimeDetail(
    infoOpen ? getAnimeUrlSlug(anime) : ''
  );
  const description = animeDetail?.description || anime.description;
  const genres = animeDetail?.genres?.length ? animeDetail.genres : anime.genres;
  const ratingValue = animeDetail?.rating?.average ?? anime.rating?.average;
  const rating = ratingValue != null ? Number(ratingValue) : null;
  const validRating = rating !== null && !isNaN(rating);
  const year = animeDetail?.year || anime.year;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300 bg-card",
        onClick && !isEliminated && "cursor-pointer hover:scale-[1.02] hover:shadow-2xl",
        isWinner && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-background",
        isSelected && !isWinner && "relative z-20",
        isEliminated && "opacity-50 grayscale",
        compact ? "h-full max-h-full aspect-[2/3] w-auto" : "aspect-[2/3]",
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

        {showDetails && genres && genres.length > 0 && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-wrap gap-1 z-10 max-w-[60%] justify-end">
            {genres.slice(0, 2).map((g) => (
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
          <AnimeTitle
            title={anime.title}
            className={cn(
              "font-bold",
              compact ? "text-sm sm:text-base md:text-lg" : "text-lg mb-1"
            )}
          />
        </div>

        {showDetails && !isWinner && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen(true);
            }}
            aria-label="Информация об аниме"
            className={cn(
              "absolute z-30 flex items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80",
              compact ? "top-2 left-2 w-9 h-9 sm:top-3 sm:left-3 sm:w-11 sm:h-11" : "top-3 left-3 w-10 h-10"
            )}
          >
            <Info className={compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-5 h-5"} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isSelected && !isWinner && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 bg-green-500/30 rounded-xl z-20 flex items-center justify-center"
          >
            <span className="text-white font-bold text-2xl sm:text-4xl drop-shadow-lg">✓</span>
          </motion.div>
        )}
      </AnimatePresence>

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

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-lg sm:max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{anime.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {(validRating || year) && (
              <div className="flex items-center gap-4 text-sm">
                {validRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                  </div>
                )}
                {year ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{year}</span>
                  </div>
                ) : null}
              </div>
            )}

            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <Badge key={g.id} variant="outline" className="text-xs">
                    {g.title}
                  </Badge>
                ))}
              </div>
            )}

            {description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            ) : isDetailLoading ? (
              <p className="text-sm text-muted-foreground">Загрузка описания…</p>
            ) : isDetailError ? (
              <p className="text-sm text-muted-foreground">Не удалось загрузить описание</p>
            ) : (
              <p className="text-sm text-muted-foreground">Описание отсутствует</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
