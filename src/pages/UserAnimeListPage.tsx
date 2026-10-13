import { Link } from 'react-router-dom';
import { useUserAnimeListPage, usePageTitle } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipWrap } from '@/components/ui/tooltip';
import { AnimeTitle } from '@/components/anime/AnimeTitle';
import { EmptyState } from '@/components/States';
import { ListChecks } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { buildAnimeUrl } from '@/lib/animeUrl';
import { getRateStatus, isRateFavorite } from '@/lib/listRate';
import { STATUS_ICONS, STATUS_COLORS, STATUS_LABELS, FAVORITE_ICON, ALL_STATUSES, type StatusType } from '@/types/constants';
import { useT, type TranslationKey } from '@/i18n';
import type { YummyUserAnimeRate } from '@/types';

export function UserAnimeListPage() {
  const { statusParam, isFavorites, isLoading, stats, displayList, selectStatus, selectFavorites } = useUserAnimeListPage();
  const { t } = useT();
  usePageTitle(t('profileMenu.myList'));

  const statCards = [
    { label: t(STATUS_LABELS.watching as TranslationKey) as string, count: stats.watching, color: 'bg-blue-500' },
    { label: t(STATUS_LABELS.planned as TranslationKey) as string, count: stats.planned, color: 'bg-yellow-500' },
    { label: t(STATUS_LABELS.completed as TranslationKey) as string, count: stats.completed, color: 'bg-green-500' },
    { label: t(STATUS_LABELS.paused as TranslationKey) as string, count: stats.paused, color: 'bg-yellow-600' },
    { label: t(STATUS_LABELS.dropped as TranslationKey) as string, count: stats.dropped, color: 'bg-red-500' },
    { label: t('userAnimeList.favorites'), count: stats.favorites, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics - always show, skeleton or real data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 ${stat.color}`} />
              <CardContent className="text-center pt-5">
                <p className="text-3xl font-bold tracking-tight">{stat.count}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {isLoading ? (
          <>
            <Skeleton className="w-24 h-9 rounded-xl" />
            <Skeleton className="w-28 h-9 rounded-xl" />
            <Skeleton className="w-20 h-9 rounded-xl" />
            <Skeleton className="w-28 h-9 rounded-xl" />
            <Skeleton className="w-20 h-9 rounded-xl" />
            <Skeleton className="w-20 h-9 rounded-xl" />
          </>
        ) : (
          <>
            {ALL_STATUSES.map((s) => (
              <Button
                key={s}
                variant={statusParam === s ? 'default' : 'outline'}
                onClick={() => selectStatus(s)}
                className="rounded-xl"
              >
                {t(STATUS_LABELS[s as keyof typeof STATUS_LABELS] as TranslationKey) || s}
              </Button>
            ))}
            <Button
              variant={isFavorites ? 'default' : 'outline'}
              onClick={selectFavorites}
              className="rounded-xl"
            >
              {t('userAnimeList.favorites')}
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <EmptyState
          title={t('userAnimeList.empty')}
          icon={<ListChecks className="w-5 h-5" aria-hidden />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayList.map((item: YummyUserAnimeRate) => {
            const rate = item as YummyUserAnimeRate;
            const displayTitle = rate.title || t('common.unknown');
            const isFavorite = isRateFavorite(rate);
            const status = getRateStatus(rate);

            return (
              <Link
                key={rate.anime_id}
                to={buildAnimeUrl(rate)}
                className="group block relative rounded-xl overflow-hidden shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-0.5 motion-reduce:transform-none"
              >
                <img
                  src={getImageUrl(rate.poster?.medium || rate.poster?.small)}
                  alt={displayTitle}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-1">
                  <TooltipWrap content={t(STATUS_LABELS[status as keyof typeof STATUS_LABELS] as TranslationKey) || status}>
                    <Badge
                      aria-label={t(STATUS_LABELS[status as keyof typeof STATUS_LABELS] as TranslationKey) || status}
                      className={`h-9 w-9 p-0 rounded-full cursor-pointer shadow-soft ${status ? STATUS_COLORS[status as StatusType] : 'bg-gray-500'}`}
                    >
                      <span className="flex items-center justify-center w-full h-full">
                        {STATUS_ICONS[status as StatusType] || STATUS_ICONS.watching}
                      </span>
                    </Badge>
                  </TooltipWrap>
                  {isFavorite && (
                    <TooltipWrap content={t('userAnimeList.favoriteBadge')}>
                      <Badge aria-label={t('userAnimeList.favoriteBadge')} className="bg-pink-500 text-white h-9 w-9 p-0 rounded-full cursor-pointer shadow-soft">
                        <span className="flex items-center justify-center w-full h-full text-white">
                          {FAVORITE_ICON}
                        </span>
                      </Badge>
                    </TooltipWrap>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-12">
                  <AnimeTitle title={displayTitle} className="font-semibold text-sm text-white" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
