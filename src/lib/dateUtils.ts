export function formatDate(timestamp: number | undefined | null): string {
  if (!timestamp) return 'Неизвестно';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatLastOnline(timestamp: number | undefined | null): string {
  if (!timestamp) return 'Был(а) давно';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн. назад`;
  
  return formatDate(timestamp);
}

export function formatDateShort(timestamp: number | undefined | null): string {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
}
