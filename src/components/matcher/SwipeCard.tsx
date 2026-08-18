import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Film } from 'lucide-react';
import { getImageUrl, getPosterUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import type { AnimeDetail } from '@/types';

interface SwipeCardProps {
  anime: AnimeDetail;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

export function SwipeCard({ anime, onSwipe, isActive }: SwipeCardProps) {
  const { cardRef, translateX, translateY, rotation, isDragging, swipeDirection, swipeOpacity, handlers } =
    useSwipeGesture(onSwipe, isActive);

  const isAnnouncement = anime.anime_status?.alias === 'announcement';
  const hasRating = !isAnnouncement && anime.rating?.average != null && anime.rating.average > 0;
  const hasYear = !isAnnouncement && anime.year != null && anime.year > 0;

  return (
    <div
      ref={cardRef}
      className={cn(
        "w-full max-w-[360px] mx-auto touch-none select-text rounded-xl overflow-hidden shadow-2xl relative",
        isActive ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      )}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        touchAction: 'none',
      }}
      {...handlers}
    >
      <div className="relative bg-muted aspect-[2/3]">
        {anime.poster ? (
          <img
            src={getImageUrl(getPosterUrl(anime))}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="w-20 h-20 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {swipeDirection && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center z-20",
              swipeDirection === 'right' ? "bg-green-500/60" : "bg-red-500/60"
            )}
            style={{ opacity: swipeOpacity }}
          >
            <span className="text-white text-2xl font-bold text-center px-4">
              {swipeDirection === 'right' ? 'БУДУ СМОТРЕТЬ' : 'ПРОПУСК'}
            </span>
          </div>
        )}

        {anime.genres && anime.genres.length > 0 && (
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 z-10">
            {anime.genres.slice(0, 3).map((genre) => (
              <Badge
                key={genre.id}
                variant="secondary"
                className="text-sm px-2 py-1 bg-black/60 backdrop-blur-sm text-white border-0 font-medium"
              >
                {genre.title}
              </Badge>
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white select-text">
          <h2 className="text-2xl font-bold mb-1">{anime.title}</h2>
          <div className="flex items-center gap-4 text-sm">
            {hasRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{anime.rating.average.toFixed(1)}</span>
              </div>
            )}
            {hasYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{anime.year}</span>
              </div>
            )}
            {anime.episodes?.count && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{anime.episodes.count} эп.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
