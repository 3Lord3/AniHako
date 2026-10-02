import type { AnimeTranslate, AnimeVideo } from '@/types';

const PLAYER_PRIORITY = ['Kodik', 'CVH', 'Alloha'];

const GENERIC_TRANSLATE_TITLES = new Set(['Многоголосый', 'Одноголосый', 'Двухголосый', 'Субтитры']);

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

function isGenericTranslateTitle(title: string): boolean {
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

function eventStrings(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  return [payload.event, payload.type].filter((v): v is string => typeof v === 'string');
}

const ENDED_EVENT_PATTERN = /ended|finish|complete/i;

export function isPlayerEndedEvent(data: unknown): boolean {
  return eventStrings(data).some((s) => ENDED_EVENT_PATTERN.test(s));
}

// Playback position in seconds, or null when the message doesn't report one.
export function getPlayerProgressSeconds(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const payload = data as Record<string, unknown>;
  const raw = payload.currentTime ?? payload.position;
  if (typeof raw !== 'number' && typeof raw !== 'string') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
