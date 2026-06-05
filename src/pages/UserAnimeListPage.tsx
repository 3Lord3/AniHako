import { Link, useSearchParams } from 'react-router-dom';
import { useUserAnimeList } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/imageUrl';
import { STATUS_ICONS, STATUS_COLORS, FAVORITE_ICON, ALL_STATUSES, type StatusType } from '@/types/constants';
import type { YummyUserAnimeRate } from '@/types';
import { mapListIdToStatus } from '@/types';

export function UserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || undefined;
  const isFavorites = searchParams.get('favorites') === 'true';
  const { data: userAnimeList, isLoading } = useUserAnimeList(statusParam as StatusType | undefined, isFavorites);
  const { data: allListsData } = useUserAnimeList();
  
  const allListsRaw = (() => {
    if (allListsData == null) return [];
    if (Array.isArray(allListsData)) return allListsData;
    return [];
  })();
  const allLists = allListsRaw;

  const statusLabels: Record<string, string> = {
    watching: 'Смотрю',
    completed: 'Просмотрено',
    paused: 'Отложено',
    dropped: 'Брошено',
    planned: 'В планах',
  };

  // Helper to get status from YummyAnime rate
  const getRateStatus = (rate: YummyUserAnimeRate): string => {
    const listId = rate.user?.list?.list?.id;
    return mapListIdToStatus(listId);
  };

  // Helper to check if rate is favorite
  const isRateFavorite = (rate: YummyUserAnimeRate): boolean => {
    return rate.user?.list?.is_fav === true;
  };

  // Count by status from all lists
  const watching = allLists.filter((a: YummyUserAnimeRate) => getRateStatus(a) === 'watching').length || 0;
  const planned = allLists.filter((a: YummyUserAnimeRate) => getRateStatus(a) === 'planned').length || 0;
  const completed = allLists.filter((a: YummyUserAnimeRate) => getRateStatus(a) === 'completed').length || 0;
  const paused = allLists.filter((a: YummyUserAnimeRate) => getRateStatus(a) === 'paused').length || 0;
  const dropped = allLists.filter((a: YummyUserAnimeRate) => getRateStatus(a) === 'dropped').length || 0;
  const favoritesCount = allLists.filter((a: YummyUserAnimeRate) => isRateFavorite(a)).length || 0;

  const stats = [
    { label: 'Смотрю', count: watching },
    { label: 'В планах', count: planned },
    { label: 'Просмотрено', count: completed },
    { label: 'Отложено', count: paused },
    { label: 'Брошено', count: dropped },
    { label: 'Любимое', count: favoritesCount },
  ];

  const userAnimeListRaw = (() => {
    if (userAnimeList == null) return [];
    if (Array.isArray(userAnimeList)) return userAnimeList;
    return [];
  })();
  const displayList = !statusParam && !isFavorites
    ? allLists
    : userAnimeListRaw;

  return (
    <div className="space-y-6">
      {/* Statistics - always show, skeleton or real data */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 border-border border rounded-lg">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">{stat.count}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {isLoading ? (
          <>
            <Skeleton className="w-24 h-10" />
            <Skeleton className="w-28 h-10" />
            <Skeleton className="w-20 h-10" />
            <Skeleton className="w-28 h-10" />
            <Skeleton className="w-20 h-10" />
            <Skeleton className="w-20 h-10" />
          </>
        ) : (
          <>
            {ALL_STATUSES.map((s) => (
              <Button
                key={s}
                variant={statusParam === s ? 'default' : 'outline'}
                onClick={() =>
                  setSearchParams(statusParam === s ? {} : { status: s })
                }
              >
                {statusLabels[s]}
              </Button>
            ))}
            <Button
              variant={isFavorites ? 'default' : 'outline'}
              onClick={() => setSearchParams(isFavorites ? {} : { favorites: 'true' })}
            >
              Любимое
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Список пуст
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayList.map((item: YummyUserAnimeRate) => {
            const rate = item as YummyUserAnimeRate;
            const displayTitle = rate.title || 'Unknown';
            const isFavorite = isRateFavorite(rate);
            const status = getRateStatus(rate);
            
            return (
              <Link key={rate.anime_id} to={`/anime/${rate.anime_id}`} className="group block relative rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(rate.poster?.medium || rate.poster?.small)}
                  alt={displayTitle}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-1">
                  <Badge 
                    title={statusLabels[status] || status}
                    className={`h-9 w-9 p-0 rounded-full cursor-pointer ${status ? STATUS_COLORS[status as StatusType] : 'bg-gray-500'}`}
                  >
                    <span className="flex items-center justify-center w-full h-full">
                      {STATUS_ICONS[status as StatusType] || STATUS_ICONS.watching}
                    </span>
                  </Badge>
                  {isFavorite && (
                    <Badge title="Избранное" className="bg-pink-500 text-white h-9 w-9 p-0 rounded-full cursor-pointer">
                      <span className="flex items-center justify-center w-full h-full text-white">
                        {FAVORITE_ICON}
                      </span>
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
                  <h3 className="font-semibold text-sm text-white line-clamp-2">
                    {displayTitle}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}