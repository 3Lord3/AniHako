import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipWrap } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getImageUrl, getPosterUrl } from '@/lib/imageUrl';
import { buildAnimeUrl } from '@/lib/animeUrl';
import { KIND_LABELS, STATUS_LABELS, STATUS_COLORS, STATUS_ICONS, getRatingColor } from '@/types/constants';
import { mapListIdToStatus } from '@/types';
import { isRateFavorite } from '@/lib/listRate';
import type { AnimeStatus, AnimeViewingOrder } from '@/types';

interface ViewingOrderProps {
  items: AnimeViewingOrder[];
  currentAnimeId: number;
}

interface OrderItem {
  item: AnimeViewingOrder;
  isCurrent: boolean;
  index: number;
}

function isAnnouncement(item: AnimeViewingOrder): boolean {
  return item.anime_status?.alias === 'announcement';
}

function getValidRating(item: AnimeViewingOrder): number | null {
  const r = item.user?.rating;
  if (typeof r !== 'number' || isNaN(r) || r <= 0) return null;
  return r;
}

function getValidYear(item: AnimeViewingOrder): number | null {
  const y = item.year;
  if (typeof y !== 'number' || isNaN(y) || y <= 0) return null;
  return y;
}

function getKindLabel(item: AnimeViewingOrder): string {
  const shortname = item.type?.shortname;
  if (shortname && KIND_LABELS[shortname]) return KIND_LABELS[shortname];
  const name = item.type?.name?.trim();
  if (!name || name.toLowerCase() === 'неизвестно') return '';
  return name;
}

function getValidTitle(item: AnimeViewingOrder): string {
  const title = item.title?.trim();
  if (!title || title.toLowerCase() === 'неизвестно') return '';
  return title;
}

function pluralizeTitles(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} тайтл`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} тайтла`;
  return `${n} тайтлов`;
}

function buildOrderItems(items: AnimeViewingOrder[], currentAnimeId: number): OrderItem[] {
  const withIndex = items.map((item, idx) => ({
    item,
    isCurrent: item.anime_id === currentAnimeId,
    index: item.data?.index ?? idx + 1,
  }));
  return withIndex.sort((a, b) => a.index - b.index);
}

function StatusBadge({ status }: { status: AnimeStatus }) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  if (!color || !label) return null;
  const isFav = status === 'favourite';
  return (
    <Badge
      variant="default"
      className={cn('text-[10px] gap-1 pr-1.5 pl-1.5 text-white border-transparent', color)}
    >
      <span className="w-3 h-3 flex items-center justify-center [&_svg]:!w-3 [&_svg]:!h-3">
        {isFav ? <Heart className="fill-white text-white" /> : STATUS_ICONS[status]}
      </span>
      {label}
    </Badge>
  );
}

function UserStatusBadges({ item }: { item: AnimeViewingOrder }) {
  const listId = item.user?.list?.list?.id;
  const isFav = isRateFavorite(item);

  const listStatus = listId !== undefined ? mapListIdToStatus(listId) : null;

  return (
    <>
      {listStatus && <StatusBadge status={listStatus} />}
      {isFav && <StatusBadge status="favourite" />}
    </>
  );
}

function OrderRow({ order }: { order: OrderItem }) {
  const { item, isCurrent, index } = order;
  const url = buildAnimeUrl(item);
  const rating = getValidRating(item);
  const year = getValidYear(item);
  const kindLabel = getKindLabel(item);
  const relation = item.data?.text?.trim() || null;
  const announcement = isAnnouncement(item);
  const title = getValidTitle(item);

  const inner = (
    <div
      className={cn(
        'flex items-stretch gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg transition-colors',
        isCurrent
          ? 'bg-primary/10 ring-1 ring-primary/40'
          : 'hover:bg-muted/60'
      )}
    >
      <div className="relative w-16 sm:w-20 aspect-[3/4] rounded-md overflow-hidden bg-muted shrink-0">
        <img
          src={getImageUrl(getPosterUrl({ poster: item.poster }, 'medium'))}
          alt={title || 'Аниме'}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {kindLabel && (
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px]">
              {kindLabel}
            </Badge>
          )}
          {year !== null && (
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
              {year}
            </Badge>
          )}
          {rating !== null && (
            <TooltipWrap content={`Оценка: ${rating.toFixed(1)}`}>
              <Badge
                variant="default"
                className={cn(
                  'text-[10px] gap-0.5 pr-1.5 pl-1.5 text-white border-transparent',
                  getRatingColor(rating)
                )}
              >
                <Star className="w-3 h-3 fill-white text-white" />
                {rating.toFixed(1)}
              </Badge>
            </TooltipWrap>
          )}
          {announcement && (
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
              Анонс
            </Badge>
          )}
          <UserStatusBadges item={item} />
        </div>
        {title && (
          <div
            className={cn(
              'font-medium leading-snug line-clamp-2 select-text',
              isCurrent ? 'text-primary' : 'text-foreground'
            )}
          >
            <span className="text-muted-foreground mr-1">{index}.</span>
            {title}
          </div>
        )}
        {relation && (
          <div className="text-xs text-muted-foreground select-text line-clamp-2">
            {relation}
          </div>
        )}
      </div>
    </div>
  );

  if (isCurrent) {
    return <div className="block" aria-current="page">{inner}</div>;
  }

  return (
    <Link to={url} className="block cursor-pointer">
      {inner}
    </Link>
  );
}

export function ViewingOrder({ items, currentAnimeId }: ViewingOrderProps) {
  if (!items || items.length === 0) return null;

  const ordered = buildOrderItems(items, currentAnimeId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <CardTitle className="select-text">Порядок просмотра</CardTitle>
          <span className="text-xs text-muted-foreground select-text">
            Всего {pluralizeTitles(ordered.length)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {ordered.map((order) => (
          <OrderRow key={order.item.anime_id} order={order} />
        ))}
      </CardContent>
    </Card>
  );
}
