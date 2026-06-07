import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { AnimeScheduleItem } from '@/types/anime';

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

interface ScheduleRowProps {
  item: AnimeScheduleItem;
}

export function ScheduleRow({ item }: ScheduleRowProps) {
  const url = item.anime_url?.startsWith('/anime/')
    ? item.anime_url
    : `/anime/${item.anime_url || item.anime_id}`;

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-3 px-4">
        <Link to={url} className="flex items-center gap-3 group">
          <span className="sm:hidden shrink-0 text-xs font-semibold tabular-nums text-muted-foreground w-9 text-right">
            {item.episodes?.aired || 0}/{item.episodes?.count || '?'}
          </span>
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
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="text-sm text-muted-foreground">
          {item.episodes?.aired || 0} / {item.episodes?.count || '?'}
        </span>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <span className="text-sm text-muted-foreground">
          {formatDate(item.episodes?.prev_date)}
        </span>
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <Calendar className="w-3 h-3" />
          {formatDate(item.episodes?.next_date)}
        </div>
      </td>
    </tr>
  );
}
