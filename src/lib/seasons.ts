/**
 * Сезоны аниме.
 *
 * `Season` — числовой код, используемый в API (`1..4`).
 * `SeasonAlias` — строковый алиас (`winter|spring|summer|autumn`).
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
export type SeasonAlias = (typeof SEASONS)[Season]['alias'];

const SEASON_ALIAS_MAP: Record<string, Season> = {
  winter: 1,
  spring: 2,
  summer: 3,
  autumn: 4,
};

export function aliasToSeason(alias: string): Season | null {
  return SEASON_ALIAS_MAP[alias] ?? null;
}

export function getCurrentSeason(): Season {
  const m = new Date().getMonth();
  if (m <= 1) return 1;
  if (m <= 4) return 2;
  if (m <= 7) return 3;
  return 4;
}
