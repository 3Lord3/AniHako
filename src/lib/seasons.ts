/**
 * Сезоны аниме.
 *
 * `Season` — числовой код, используемый в API (`1..4`).
 *
 * `SEASONS[season].label` — человекочитаемая подпись на русском.
 */

export const SEASONS = {
  1: { alias: 'winter', label: 'Зима' },
  2: { alias: 'spring', label: 'Весна' },
  3: { alias: 'summer', label: 'Лето' },
  4: { alias: 'autumn', label: 'Осень' },
} as const;

export type Season = keyof typeof SEASONS;

export function getCurrentSeason(): Season {
  const m = new Date().getMonth();
  if (m <= 1) return 1;
  if (m <= 4) return 2;
  if (m <= 7) return 3;
  return 4;
}
