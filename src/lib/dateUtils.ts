import type { Translator } from '@/i18n';
import i18n from '@/i18n';

const locale = () => i18n.resolvedLanguage ?? 'ru-RU';

export function formatDate(timestamp: number | undefined | null, t?: Translator): string {
  if (!timestamp) return t ? t('date.unknown') : '';
  return new Date(timestamp * 1000).toLocaleDateString(locale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatLastOnline(timestamp: number | undefined | null, t: Translator): string {
  if (!timestamp) return t('date.longAgo');

  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return t('date.justNow');
  if (diff < 3600) return t('date.minutesAgo', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('date.hoursAgo', { count: Math.floor(diff / 3600) });
  if (diff < 604800) return t('date.daysAgo', { count: Math.floor(diff / 86400) });

  return formatDate(timestamp);
}

export function formatDateShort(timestamp: number | undefined | null): string {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleDateString(locale(), {
    day: '2-digit',
    month: '2-digit',
  });
}
