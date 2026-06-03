import { AnimeCard } from './AnimeCard';
import type { AnimeCatalogItem, YummyUserAnimeRate } from '@/types';
import { mapListIdToStatus } from '@/types';

interface AnimeGridProps {
  anime: AnimeCatalogItem[];
  userAnimeList?: YummyUserAnimeRate[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function AnimeGrid({ anime, userAnimeList, isLoading, skeletonCount }: AnimeGridProps) {
  if (isLoading) {
    const skeletonItems = skeletonCount ?? 10;

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