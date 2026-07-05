import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TooltipWrap } from '@/components/ui/tooltip';
import { AnimeTitle } from '@/components/anime/AnimeTitle';
import type { AnimeCatalogItem } from '@/types';
import { getImageUrl, getPosterUrl } from '@/lib/imageUrl';
import { buildAnimeUrl } from '@/lib/animeUrl';
import { STATUS_ICONS, STATUS_COLORS, STATUS_LABELS, FAVORITE_ICON, getRatingColor, type StatusType } from '@/types/constants';

interface AnimeCardProps {
  anime: AnimeCatalogItem;
  showRating?: boolean;
  userStatus?: StatusType | null;
  isFavorite?: boolean;
}

export function AnimeCard({ anime, showRating = true, userStatus, isFavorite }: AnimeCardProps) {
  const displayTitle = anime.title || 'Unknown';

  const rating = anime.rating?.average ?? null;
  const isAnnouncement = anime.anime_status?.alias === 'announcement';
  const validRating = rating !== null && !isNaN(rating) && !isAnnouncement;

  const url = buildAnimeUrl(anime);

  const statusLabel = userStatus ? STATUS_LABELS[userStatus] : '';
  const ratingLabel = validRating ? `Рейтинг: ${rating.toFixed(1)}` : '';

  return (
    <Link to={url} className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <img
          src={getImageUrl(getPosterUrl(anime))}
          alt={displayTitle}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges row - left top */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-1">
          <div className="flex gap-1">
            {userStatus && STATUS_COLORS[userStatus] && (
              <TooltipWrap content={statusLabel}>
                <Badge aria-label={statusLabel} className={`${STATUS_COLORS[userStatus]} h-9 w-9 p-0 rounded-full cursor-pointer`}>
                  <span className="flex items-center justify-center w-full h-full">
                    {STATUS_ICONS[userStatus]}
                  </span>
                </Badge>
              </TooltipWrap>
            )}
            {isFavorite && (
              <TooltipWrap content="Избранное">
                <Badge aria-label="Избранное" className="bg-pink-500 h-9 w-9 p-0 rounded-full cursor-pointer">
                  <span className="flex items-center justify-center w-full h-full text-white">
                    {FAVORITE_ICON}
                  </span>
                </Badge>
              </TooltipWrap>
            )}
          </div>
          {showRating && validRating && (
            <TooltipWrap content={ratingLabel}>
              <div aria-label={ratingLabel} className={`${getRatingColor(rating)} h-9 px-1.5 rounded flex items-center gap-0.5 cursor-pointer`}>
                <Star className="w-4 h-4 fill-white text-white" />
                <span className="text-sm font-bold text-white">
                  {rating.toFixed(1)}
                </span>
              </div>
            </TooltipWrap>
          )}
        </div>
        {/* Gradient overlay for title */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
          <AnimeTitle title={displayTitle} className="font-semibold text-sm text-white" />
        </div>
      </div>
    </Link>
  );
}
