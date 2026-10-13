import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useHomePage, usePageTitle } from '@/hooks';
import { ChevronLeft, ChevronRight, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TooltipWrap } from '@/components/ui/tooltip';
import { AnimeTitle } from '@/components/anime/AnimeTitle';
import { ScheduleRow } from '@/components/anime/ScheduleRow';
import { CarouselSkeleton, ScheduleSkeleton } from '@/components/loaders/AnimeCardSkeleton';
import { EmptyState } from '@/components/States';
import type { AnimeCatalogItem } from '@/types/anime';
import { getRatingColor } from '@/types/constants';
import { buildAnimeUrl } from '@/lib/animeUrl';
import { formatDayMonth } from '@/lib/schedule';
import { useT } from '@/i18n';

interface CarouselCardProps {
  anime: AnimeCatalogItem;
}

function CarouselCard({ anime }: CarouselCardProps) {
  const { t } = useT();
  const displayTitle = anime.title || t('common.unknown');
  const rating = anime.rating?.average ?? null;
  const isAnnouncement = anime.anime_status?.alias === 'announcement';
  const validRating = rating !== null && !isNaN(rating) && !isAnnouncement;

  const url = buildAnimeUrl(anime);

  return (
    <Link to={url} className="group block flex-shrink-0 w-[160px]">
      <div className="aspect-[3/4] relative overflow-hidden rounded-xl ring-1 ring-border/60 bg-muted">
        <img
          src={anime.poster?.huge || anime.poster?.big || anime.poster?.medium}
          alt={displayTitle}
          className="object-cover w-full h-full transition-opacity duration-200 group-hover:opacity-95"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-12">
          <AnimeTitle title={displayTitle} className="font-semibold text-sm text-white" />
        </div>
        {validRating && (
          <TooltipWrap content={t('animeCard.rating', { rating: rating.toFixed(1) })}>
            <div
              aria-label={t('animeCard.rating', { rating: rating.toFixed(1) })}
              className={cn(
                'absolute top-2 right-2 h-7 px-1.5 rounded-md flex items-center gap-0.5',
                getRatingColor(rating)
              )}
            >
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              <span className="text-xs font-bold text-white">
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
  const { t } = useT();
  usePageTitle();
  const {
    currentYear,
    seasonName,
    seasonalData,
    seasonalLoading,
    scheduleData,
    scheduleLoading,
    sortedDates,
    selectedDateKey,
    selectDate,
    displayItems,
  } = useHomePage();

  return (
    <div className="space-y-12 md:space-y-16">
      <section>
        <h2 className="heading-brand text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight">
          {seasonName} {currentYear}
        </h2>
        {seasonalLoading ? (
          <CarouselSkeleton />
        ) : !seasonalData?.data?.length ? (
          <EmptyState
            title={t('home.noAnime')}
            icon={<Calendar className="w-5 h-5" aria-hidden />}
          />
        ) : (
          <AnimeCarousel anime={seasonalData.data} />
        )}
      </section>

      <section>
        <h2 className="heading-brand text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight">
          {t('home.scheduleTitle')}
        </h2>
        {scheduleLoading ? (
          <ScheduleSkeleton />
        ) : !scheduleData?.length ? (
          <EmptyState
            title={t('home.noData')}
            icon={<Calendar className="w-5 h-5" aria-hidden />}
          />
        ) : (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto px-1 pt-1 pb-2 -mx-1">
              {sortedDates.map((dateKey) => {
                const date = new Date(dateKey);
                const isToday = dateKey === new Date().toDateString();
                return (
                  <Button
                    key={dateKey}
                    variant={selectedDateKey === dateKey ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectDate(dateKey)}
                    className={cn(
                      'cursor-pointer shrink-0',
                      isToday && 'ring-2 ring-primary/40'
                    )}
                  >
                    {formatDayMonth(date.getTime() / 1000)}
                  </Button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('home.colTitle')}</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">{t('home.colEpisodes')}</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">{t('home.colPrevious')}</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">{t('home.colNext')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item) => (
                      <ScheduleRow key={item.anime_id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
