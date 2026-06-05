import { Eye, CheckCircle, XCircle, CalendarClock, Heart, Pause, Star } from 'lucide-react';
import type { AnimeStatus } from '@/types';

export type StatusType = AnimeStatus;

// YummyAnime API lists: watch_now=0, will=1, watched=2, lost=3, favourite=4, postpone=5
export const STATUS_ICONS: Record<StatusType, React.ReactNode> = {
  watching: <Eye size={24} strokeWidth={2.5} />,
  completed: <CheckCircle size={24} strokeWidth={2.5} />,
  paused: <Pause size={24} strokeWidth={2.5} />,
  dropped: <XCircle size={24} strokeWidth={2.5} />,
  planned: <CalendarClock size={24} strokeWidth={2.5} />,
  favourite: <Star size={24} strokeWidth={2.5} />,
};

export const STATUS_LABELS: Record<StatusType, string> = {
  watching: 'Смотрю',
  completed: 'Просмотрено',
  paused: 'Отложено',
  dropped: 'Брошено',
  planned: 'В планах',
  favourite: 'Любимое',
};

// Theme-adaptive status colors
export const STATUS_COLORS: Record<StatusType, string> = {
  watching: 'bg-blue-500 text-white dark:bg-blue-600',
  completed: 'bg-green-500 text-white dark:bg-green-600',
  paused: 'bg-yellow-500 text-gray-900 dark:bg-yellow-600 dark:text-gray-900',
  dropped: 'bg-red-500 text-white dark:bg-red-600',
  planned: 'bg-yellow-500 text-white dark:bg-yellow-600',
  favourite: 'bg-pink-500 text-white dark:bg-pink-600',
};

// статусы которые есть в YummyAnime API (id списка)
export const YUMMY_LIST_STATUSES: StatusType[] = ['watching', 'planned', 'completed', 'paused', 'dropped'];

// OLDStatuses - статусы без соответствующего списка в YummyAnime API
export const OLDStatuses: StatusType[] = [];

// All statuses for UI display
export const ALL_STATUSES: StatusType[] = [...YUMMY_LIST_STATUSES, ...OLDStatuses];

export const FAVORITE_ICON = <Heart size={24} strokeWidth={2.5} />;

export const SEASON_LABELS: Record<string, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

export const KIND_LABELS: Record<string, string> = {
  tv: 'TV сериал',
  movie: 'Фильм',
  ova: 'OVA',
  onu: 'ONA',
  special: 'Спешл',
  music: 'Клип',
};

export function getRatingColor(rating: number | string | null): string {
  if (rating === null || rating === undefined) return 'bg-gray-500 text-white dark:bg-gray-600';
  const r = typeof rating === 'number' ? rating : parseFloat(rating);
  if (isNaN(r)) return 'bg-gray-500 text-white dark:bg-gray-600';
  if (r >= 8) return 'bg-green-500 text-white dark:bg-green-600';
  if (r >= 6) return 'bg-yellow-500 text-black dark:bg-yellow-500 dark:text-black';
  return 'bg-red-500 text-white dark:bg-red-600';
}

export function getKindIcon(kind: string | null): string {
  const kindMap: Record<string, string> = {
    tv: '📺',
    movie: '🎬',
    ova: '💿',
    onu: '🌐',
    special: '⭐',
    music: '🎵',
  };
  return kindMap[kind || ''] || '📺';
}