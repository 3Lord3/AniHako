import type { AnimeCatalogItem, AnimeReleaseStatus, YummyUserAnimeRate } from '@/types';

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
