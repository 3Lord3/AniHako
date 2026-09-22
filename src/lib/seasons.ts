/**
 * Сезоны аниме.
 *
 * `Season` — числовой код, используемый в API (`1..4`).
 *
 * `SEASONS[season].label` — человекочитаемая подпись на русском.
 */

export const SEASONS = {
  1: { alias: 'winter', labelKey: 'seasons.winter' },
  2: { alias: 'spring', labelKey: 'seasons.spring' },
  3: { alias: 'summer', labelKey: 'seasons.summer' },
  4: { alias: 'autumn', labelKey: 'seasons.autumn' },
} as const;

export type Season = keyof typeof SEASONS;

export function getCurrentSeason(): Season {
  const m = new Date().getMonth();
  if (m <= 1) return 1;
  if (m <= 4) return 2;
  if (m <= 7) return 3;
  return 4;
}
