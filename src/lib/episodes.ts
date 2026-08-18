import type { AnimeTranslate, AnimeVideo } from '@/types';

export const PLAYER_PRIORITY = ['Kodik', 'CVH', 'Alloha'];

export const GENERIC_TRANSLATE_TITLES = new Set(['Многоголосый', 'Одноголосый', 'Двухголосый', 'Субтитры']);

export function filterVideosByTranslate(videos: AnimeVideo[], translate: AnimeTranslate | undefined): AnimeVideo[] {
  if (!translate) return videos;
  const filtered = videos.filter((v) => v.data?.dubbing === translate.title);
  return filtered.length > 0 ? filtered : videos;
}

export function synthesizeTranslatesFromVideos(videos: AnimeVideo[]): AnimeTranslate[] {
  const seen = new Set<string>();
  const result: AnimeTranslate[] = [];
  for (const v of videos) {
    const dubbing = v.data?.dubbing;
    if (!dubbing || seen.has(dubbing)) continue;
    seen.add(dubbing);
    result.push({ title: dubbing, href: dubbing.toLowerCase().replace(/\s+/g, '-'), value: result.length + 1 });
  }
  return result;
}

export function isGenericTranslateTitle(title: string): boolean {
  return GENERIC_TRANSLATE_TITLES.has(title);
}

export function filterGenericTranslates(translates: AnimeTranslate[]): AnimeTranslate[] {
  return translates.filter((t) => !isGenericTranslateTitle(t.title));
}

export function comparePlayersByPriority(a: string, b: string): number {
  const ia = PLAYER_PRIORITY.findIndex((p) => a.toLowerCase().includes(p.toLowerCase()));
  const ib = PLAYER_PRIORITY.findIndex((p) => b.toLowerCase().includes(p.toLowerCase()));
  const ra = ia === -1 ? PLAYER_PRIORITY.length : ia;
  const rb = ib === -1 ? PLAYER_PRIORITY.length : ib;
  if (ra !== rb) return ra - rb;
  return a.localeCompare(b);
}

export function getUniquePlayers(videos: AnimeVideo[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of videos) {
    const player = v.data?.player;
    if (!player || seen.has(player)) continue;
    seen.add(player);
    result.push(player);
  }
  return result.sort(comparePlayersByPriority);
}

const ENDED_EVENT_PATTERN = /ended|finish|complete/i;

export function isPlayerEndedEvent(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const payload = data as Record<string, unknown>;
  const event = payload.event;
  const type = payload.type;
  if (typeof event === 'string' && ENDED_EVENT_PATTERN.test(event)) return true;
  if (typeof type === 'string' && ENDED_EVENT_PATTERN.test(type)) return true;
  return false;
}
