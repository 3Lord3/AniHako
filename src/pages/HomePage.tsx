import { useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useSchedule, useAnimeList } from '@/hooks';
import { ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnimeScheduleItem, AnimeCatalogItem } from '@/types/anime';
import { getRatingColor } from '@/types/constants';

const SEASON_NAMES: Record<string, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'autumn';
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function formatDayMonth(timestamp: number): string {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function groupByDate(items: AnimeScheduleItem[]): Map<string, AnimeScheduleItem[]> {
  const groups = new Map<string, AnimeScheduleItem[]>();
  for (const item of items) {
    const nextDate = item.episodes?.next_date;
    if (!nextDate) continue;
    const dateKey = new Date(nextDate * 1000).toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  }
  return groups;
}

interface CarouselCardProps {
  anime: AnimeCatalogItem;
}

function CarouselCard({ anime }: CarouselCardProps) {
  const displayTitle = anime.title || 'Unknown';
  const rating = anime.rating?.average ?? null;
  const isAnnouncement = anime.anime_status?.alias === 'announcement';
  const validRating = rating !== null && !isNaN(rating) && !isAnnouncement;

  const url = anime.anime_url?.startsWith('/anime/')
    ? anime.anime_url
    : `/anime/${anime.anime_url || anime.anime_id}`;

  return (
    <Link to={url} className="group block flex-shrink-0 w-[160px]">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <img
          src={anime.poster?.huge || anime.poster?.big || anime.poster?.medium}
          alt={displayTitle}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
          <h3 className="font-semibold text-sm text-white line-clamp-2">
            {displayTitle}
          </h3>
        </div>
        {validRating && (
          <div
            title={`Рейтинг: ${rating.toFixed(1)}`}
            className={cn(
              'absolute top-2 right-2 h-8 px-1.5 rounded flex items-center gap-0.5',
              getRatingColor(rating)
            )}
          >
            <Star className="w-4 h-4 fill-white text-white" />
            <span className="text-sm font-bold text-white">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function AnimeCarousel({ anime }: { anime: AnimeCatalogItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (!anime.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {anime.map((item) => (
            <CarouselCard key={item.anime_id} anime={item} />
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer hidden md:flex"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-pointer hidden md:flex"
        onClick={scrollNext}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface ScheduleRowProps {
  item: AnimeScheduleItem;
}

function ScheduleRow({ item }: ScheduleRowProps) {
  const url = item.anime_url?.startsWith('/anime/')
    ? item.anime_url
    : `/anime/${item.anime_url || item.anime_id}`;

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-3 px-4">
        <Link to={url} className="flex items-center gap-3 group">
          <img
            src={item.poster?.small || item.poster?.medium}
            alt={item.title}
            className="w-10 h-14 object-cover rounded"
          />
          <span className="group-hover:text-primary transition-colors line-clamp-2 text-foreground">
            {item.title}
          </span>
        </Link>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <span className="text-sm text-muted-foreground">
          {item.episodes?.aired || 0} / {item.episodes?.count || '?'}
        </span>
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <Calendar className="w-3 h-3" />
          {formatDate(item.episodes?.next_date)}
        </div>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="text-sm text-muted-foreground">
          {formatDate(item.episodes?.prev_date)}
        </span>
      </td>
    </tr>
  );
}

export function HomePage() {
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();
  const seasonName = SEASON_NAMES[currentSeason];

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(new Date().toDateString());

  const { data: scheduleData, isLoading: scheduleLoading } = useSchedule();
  const { data: seasonalData, isLoading: seasonalLoading } = useAnimeList({
    season: currentSeason,
    status: ['released', 'ongoing'],
    from_year: currentYear,
    sort_forward: true,
    offset: 0,
    limit: 20,
  });

  const dateGroups = scheduleData ? groupByDate(scheduleData) : new Map();
  const sortedDates = Array.from(dateGroups.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const displayItems: AnimeScheduleItem[] = selectedDateKey
    ? dateGroups.get(selectedDateKey) || []
    : scheduleData || [];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {seasonName} {currentYear}
        </h2>
        {seasonalLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-[160px] aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : !seasonalData?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">Нет аниме</div>
        ) : (
          <AnimeCarousel anime={seasonalData.data} />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Расписание онгоингов</h2>
        {scheduleLoading ? (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-hidden pb-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-md shrink-0" />
              ))}
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20 hidden md:block" />
                <Skeleton className="h-4 w-24 hidden lg:block" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-3 border-b last:border-0">
                  <Skeleton className="w-10 h-14 rounded" />
                  <Skeleton className="h-4 w-40 flex-1" />
                  <Skeleton className="h-4 w-16 hidden md:block" />
                  <Skeleton className="h-4 w-20 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        ) : !scheduleData?.length ? (
          <div className="text-center py-8 text-muted-foreground">Нет данных</div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {sortedDates.map((dateKey) => {
                const date = new Date(dateKey);
                const isToday = dateKey === new Date().toDateString();
                return (
                  <Button
                    key={dateKey}
                    variant={selectedDateKey === dateKey ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={cn(
                      'cursor-pointer shrink-0 dark:text-foreground',
                      isToday && 'border-primary dark:border-primary dark:text-primary-foreground'
                    )}
                  >
                    {formatDayMonth(date.getTime() / 1000)}
                  </Button>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Название</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Эпизоды</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Следующий</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Предыдущий</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item) => (
                    <ScheduleRow key={item.anime_id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}