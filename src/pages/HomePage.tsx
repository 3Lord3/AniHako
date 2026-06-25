import { useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useSchedule, useAnimeList } from '@/hooks';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TooltipWrap } from '@/components/ui/tooltip';
import { AnimeTitle } from '@/components/anime/AnimeTitle';
import { ScheduleRow } from '@/components/anime/ScheduleRow';
import { CarouselSkeleton, ScheduleSkeleton } from '@/components/loaders/AnimeCardSkeleton';
import type { AnimeScheduleItem, AnimeCatalogItem } from '@/types/anime';
import { getRatingColor } from '@/types/constants';
import { buildAnimeUrl } from '@/lib/animeUrl';
import { SEASONS, getCurrentSeason } from '@/lib/seasons';

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

  const url = buildAnimeUrl(anime);

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
          <AnimeTitle title={displayTitle} className="font-semibold text-sm text-white" />
        </div>
        {validRating && (
          <TooltipWrap content={`Рейтинг: ${rating.toFixed(1)}`}>
            <div
              aria-label={`Рейтинг: ${rating.toFixed(1)}`}
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
          </TooltipWrap>
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

export function HomePage() {
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();
  const seasonName = SEASONS[currentSeason].label;

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(new Date().toDateString());

  const { data: scheduleData, isLoading: scheduleLoading } = useSchedule();
  const { data: seasonalData, isLoading: seasonalLoading } = useAnimeList({
    season: SEASONS[currentSeason].alias,
    status: ['released', 'ongoing', 'announcement'],
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
          <CarouselSkeleton />
        ) : !seasonalData?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">Нет аниме</div>
        ) : (
          <AnimeCarousel anime={seasonalData.data} />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Расписание онгоингов</h2>
        {scheduleLoading ? (
          <ScheduleSkeleton />
        ) : !scheduleData?.length ? (
          <div className="text-center py-8 text-muted-foreground">Нет данных</div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto px-1 pt-1 pb-2">
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
                      'cursor-pointer shrink-0',
                      isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
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
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Эпизоды</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Предыдущий</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Следующий</th>
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
