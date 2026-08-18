import type { AnimeScheduleItem } from '@/types/anime';

export function formatDayMonth(timestamp: number | undefined): string {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function groupByDate(items: AnimeScheduleItem[]): Map<string, AnimeScheduleItem[]> {
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
