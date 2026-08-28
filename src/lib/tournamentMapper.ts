import type { AnimeCatalogItem, AnimeReleaseStatus, YummyUserAnimeRate } from '@/types';

const EMPTY_POSTER = { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' };

/** Строит запись просмотра из результата поиска — участник до попадания в список зарегистрирован как просмотренный "сейчас". */
export function toParticipantRate(anime: AnimeCatalogItem, date: number): YummyUserAnimeRate {
  return {
    anime_id: anime.anime_id,
    anime_url: anime.anime_url || String(anime.anime_id),
    title: anime.title,
    poster: anime.poster ? { ...EMPTY_POSTER, ...anime.poster } : EMPTY_POSTER,
    rating: anime.rating?.average || 0,
    type: anime.type || { name: '', value: 0, shortname: '', alias: '' },
    year: anime.year,
    user: undefined,
    date,
  };
}

export function toTournamentParticipant(rate: YummyUserAnimeRate): AnimeCatalogItem {
  return {
    anime_id: rate.anime_id,
    anime_status: rate.anime_status as AnimeReleaseStatus,
    anime_url: rate.anime_url,
    poster: rate.poster,
    rating: { average: rate.rating, counters: 0 },
    user: rate.user,
    title: rate.title,
    type: rate.type,
    year: rate.year || 0,
    description: '',
    views: 0,
    season: 1 as const,
    episodes: { aired: 0, count: 0 },
  };
}
