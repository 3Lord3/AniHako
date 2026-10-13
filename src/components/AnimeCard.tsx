import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TooltipWrap } from '@/components/ui/tooltip';
import { AnimeTitle } from '@/components/anime/AnimeTitle';
import type { AnimeCatalogItem } from '@/types';
import { getImageUrl, getPosterUrl } from '@/lib/imageUrl';
import { buildAnimeUrl } from '@/lib/animeUrl';
import { STATUS_ICONS, STATUS_COLORS, STATUS_LABELS, FAVORITE_ICON, getRatingColor, type StatusType } from '@/types/constants';
import { useT, type TranslationKey } from '@/i18n';

interface AnimeCardProps {
  anime: AnimeCatalogItem;
  showRating?: boolean;
  userStatus?: StatusType | null;
  isFavorite?: boolean;
}

export function AnimeCard({ anime, showRating = true, userStatus, isFavorite }: AnimeCardProps) {
  const { t } = useT();
  const displayTitle = anime.title || t('common.unknown');

  const rating = anime.rating?.average ?? null;
  const isAnnouncement = anime.anime_status?.alias === 'announcement';
  const validRating = rating !== null && !isNaN(rating) && !isAnnouncement;

  const url = buildAnimeUrl(anime);

  const statusLabel = userStatus ? t(STATUS_LABELS[userStatus] as TranslationKey) : '';
  const ratingLabel = validRating ? t('animeCard.rating', { rating: rating.toFixed(1) }) : '';

  return (
    <Link to={url} className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-xl ring-1 ring-border/60 bg-muted">
        <img
          src={getImageUrl(getPosterUrl(anime))}
          alt={displayTitle}
          className="object-cover w-full h-full transition-opacity duration-200 group-hover:opacity-95"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
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
              <TooltipWrap content={t('animeCard.favorite')}>
                <Badge aria-label={t('animeCard.favorite')} className="bg-pink-500 h-9 w-9 p-0 rounded-full cursor-pointer">
                  <span className="flex items-center justify-center w-full h-full text-white">
                    {FAVORITE_ICON}
                  </span>
                </Badge>
              </TooltipWrap>
            )}
          </div>
          {showRating && validRating && (
            <TooltipWrap content={ratingLabel}>
              <div aria-label={ratingLabel} className={`${getRatingColor(rating)} h-7 px-1.5 rounded-md flex items-center gap-0.5 cursor-pointer`}>
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span className="text-xs font-bold text-white">
                  {rating.toFixed(1)}
                </span>
              </div>
            </TooltipWrap>
          )}
        </div>
        {/* Gradient overlay for title */}
        <div className="absolute inset-x-0 bottom-0 p-3 pt-12">
          <AnimeTitle title={displayTitle} className="font-semibold text-sm text-white" />
        </div>
      </div>
    </Link>
  );
}
