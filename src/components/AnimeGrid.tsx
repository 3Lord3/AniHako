import { Link } from 'react-router-dom';
import { Star, Calendar, Film } from 'lucide-react';
import { AnimeCard } from './AnimeCard';
import type { AnimeCatalogItem, YummyUserAnimeRate } from '@/types';
import { mapListIdToStatus } from '@/types';
import { getImageUrl, getPosterUrl } from '@/lib/imageUrl';
import { STATUS_ICONS, STATUS_COLORS, FAVORITE_ICON, getRatingColor } from '@/types/constants';

interface AnimeGridProps {
  anime: AnimeCatalogItem[];
  userAnimeList?: YummyUserAnimeRate[];
  isLoading?: boolean;
  skeletonCount?: number;
  view?: 'grid' | 'list';
}

function getStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'watching': return 'Смотрю';
    case 'completed': return 'Просмотрено';
    case 'dropped': return 'Брошено';
    case 'planned': return 'Запланировано';
    case 'paused': return 'На паузе';
    default: return '';
  }
}

function formatDuration(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 1) {
    return `${hours.toFixed(1).replace('.', ',')}ч`;
  }
  return `${minutes}м`;
}

function AnimeListItem({ anime, userAnime }: { anime: AnimeCatalogItem; userAnime?: YummyUserAnimeRate }) {
  const displayTitle = anime.title || 'Unknown';
  const rating = anime.rating?.average ?? null;
  const isAnnouncement = anime.anime_status?.alias === 'announcement';
  const validRating = rating !== null && !isNaN(rating) && !isAnnouncement;
  const userStatus = userAnime ? mapListIdToStatus(userAnime.user?.list?.list?.id) : undefined;
  const isFavorite = userAnime?.user?.list?.is_fav || false;

  const url = anime.anime_url?.startsWith('/anime/') 
    ? anime.anime_url 
    : `/anime/${anime.anime_url || anime.anime_id}`;

  const airedEpisodes = anime.episodes?.aired ?? 0;
  const totalEpisodes = anime.episodes?.count ?? 0;
  const isMovie = anime.type?.alias === 'movie';
  
  const episodeText = (() => {
    if (isMovie && anime.duration) {
      return formatDuration(anime.duration);
    }
    if (totalEpisodes > 0) {
      return `${airedEpisodes}/${totalEpisodes}`;
    }
    if (airedEpisodes > 0) {
      return `${airedEpisodes} из ${totalEpisodes}`;
    }
    return '';
  })();

  return (
    <Link to={url} className="group flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-16 h-24 sm:w-20 sm:h-28 shrink-0 relative overflow-hidden rounded-lg">
        <img
          src={getImageUrl(getPosterUrl(anime))}
          alt={displayTitle}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 flex-1">
            {displayTitle}
          </h3>
          {validRating && (
            <span 
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs shrink-0 ${getRatingColor(rating)}`}
              title={`Рейтинг: ${rating.toFixed(1)}`}
            >
              <Star className="w-3 h-3 fill-white text-white" />
              <span className="font-bold text-white">{rating.toFixed(1)}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {anime.year}
          </span>
          {episodeText && (
            <span 
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/50 text-foreground"
              title={isMovie ? 'Длительность' : 'Серии'}
            >
              <Film className="w-3 h-3" />
              <span>{episodeText}</span>
            </span>
          )}
        </div>
        {anime.genres && anime.genres.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {anime.genres.slice(0, 3).map(g => g.title).join(', ')}
          </p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {userStatus && STATUS_COLORS[userStatus] && (
            <span 
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${STATUS_COLORS[userStatus]}`}
              title={getStatusLabel(userStatus)}
            >
              {STATUS_ICONS[userStatus]}
              <span className="hidden sm:inline">{getStatusLabel(userStatus)}</span>
            </span>
          )}
          {isFavorite && (
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-pink-500 text-white"
              title="Избранное"
            >
              <span>{FAVORITE_ICON}</span>
              <span className="hidden sm:inline">Избранное</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function AnimeGrid({ anime, userAnimeList, isLoading, skeletonCount, view = 'grid' }: AnimeGridProps) {
  if (isLoading) {
    const skeletonItems = skeletonCount ?? 10;

    if (view === 'list') {
      return (
        <div className="space-y-2">
          {Array.from({ length: skeletonItems }).map((_, i) => (
            <div key={i} className="flex gap-3 p-2">
              <div className="w-16 h-24 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: skeletonItems }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!anime.length) {
    return null;
  }

  const userAnimeMap = userAnimeList && Array.isArray(userAnimeList)
    ? new Map(userAnimeList.map(ua => [ua.anime_id, ua]))
    : new Map();

  if (view === 'list') {
    return (
      <div className="space-y-1">
        {anime.map((item) => {
          const userAnime = userAnimeMap.get(item.anime_id);
          return (
            <AnimeListItem key={item.anime_id} anime={item} userAnime={userAnime} />
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {anime.map((item) => {
        const userAnime = userAnimeMap.get(item.anime_id);
        return (
          <div key={item.anime_id}>
            <AnimeCard
              anime={item}
              userStatus={userAnime ? mapListIdToStatus(userAnime.user?.list?.list?.id) : undefined}
              isFavorite={userAnime?.user?.list?.is_fav || false}
            />
          </div>
        );
      })}
    </div>
  );
}