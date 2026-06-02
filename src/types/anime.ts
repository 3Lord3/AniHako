export interface AnimePoster {
  small: string;
  medium: string;
  big: string;
  huge: string;
  fullsize: string;
  mega: string;
}

export interface AnimeRating {
  average: number;
  kp_rating?: number;
  anidub_rating?: number;
  counters: number;
  myanimelist_rating?: number;
  shikimori_rating?: number;
  worldart_rating?: number;
}

export interface AnimeType {
  name: string;
  value: number;
  shortname: string;
  alias: string;
}

export interface AnimeReleaseStatus {
  title: string;
  class?: string;
  alias: 'released' | 'ongoing' | 'announcement';
  value: 0 | 1 | 2;
}

export interface AnimeEpisodes {
  aired: number;
  count: number;
  next_date?: number;
  prev_date?: number;
}

export interface AnimeStudio {
  title: string;
  id: number;
  url: string;
}

export interface AnimeGenre {
  title: string;
  id: number;
  alias: string;
  url: string;
}

export interface AnimeUserList {
  title: string;
  href: string;
  id: 0 | 1 | 2 | 3 | 5;
}

export interface AnimeUser {
  list?: {
    is_fav: boolean;
    list?: AnimeUserList;
  };
  rating?: number;
}

export interface AnimeScreenshot {
  sizes: {
    small: string;
    full: string;
  };
  id: number;
  time: number;
  episode: string;
}

export interface AnimeVideo {
  video_id: number;
  iframe_url: string;
  data: {
    dubbing: string;
    player: string;
    player_id: number;
  };
  number: string;
  date: number;
  index: number;
  skips?: {
    ending?: { time: number; length: number };
    opening?: { time: number; length: number };
  };
  views: number;
  duration: number;
}

export interface AnimeTranslate {
  title: string;
  href: string;
  value: number;
}

export interface AnimeViewingOrder {
  title: string;
  anime_id: number;
  type: AnimeType;
  anime_url: string;
  anime_status: AnimeReleaseStatus;
  description?: string;
  poster: AnimePoster;
  user?: {
    list?: { list: AnimeUserList; is_fav: boolean };
    rating?: number;
  };
  year: number;
  data?: { id: number; index: number; text: string };
}

export interface AnimeRemoteIds {
  worldart_id?: number;
  worldart_type?: 'animation' | 'cinema';
  kp_id?: number;
  anidub_id?: number;
  sr_id?: number;
  anilibria_alias?: string;
  shikimori_id?: number;
  myanimelist_id?: number;
}

export interface AnimeTop {
  category?: number;
  global?: number;
}

export interface AnimeMinAge {
  value: 0 | 1 | 2 | 3 | 4 | 5;
  title: string;
  title_long?: string;
}

export interface AnimeCatalogItem {
  anime_id: number;
  anime_status: AnimeReleaseStatus;
  anime_url: string;
  poster: AnimePoster;
  rating: {
    average: number;
    counters: number;
  };
  title: string;
  type: AnimeType;
  year: number;
  description: string;
  views: number;
  season: 1 | 2 | 3 | 4;
  min_age?: AnimeMinAge;
  user?: AnimeUser;
  remote_ids?: AnimeRemoteIds;
  top?: AnimeTop;
  blocked_in?: string[];
  original?: string;
  duration?: number;
  trailers_count?: number;
  lists_count?: number;
  other_titles?: string[];
  creators?: AnimeStudio[];
  studios?: AnimeStudio[];
  videos?: AnimeVideo[];
  genres?: AnimeGenre[];
  viewing_order?: AnimeViewingOrder[];
  translates?: AnimeTranslate[];
  episodes: AnimeEpisodes;
  comments_count?: number;
  reviews_count?: number;
  random_screenshots?: AnimeScreenshot[];
  posts_count?: number;
  partner_videos_count?: number;
  [key: string]: any;
}

export type AnimeListItem = AnimeCatalogItem;

export interface AnimeDetailResponse extends AnimeCatalogItem {}

export type AnimeDetail = AnimeDetailResponse;

export type YummyAnimeDetailResponse = AnimeCatalogItem;

export function getDisplayTitle(anime: { title: string; other_titles?: string[] }): string {
  return anime.title || 'Unknown';
}

export function getSeasonName(season: 1 | 2 | 3 | 4 | undefined): string {
  switch (season) {
    case 1: return 'Зима';
    case 2: return 'Весна';
    case 3: return 'Лето';
    case 4: return 'Осень';
    default: return '';
  }
}

export function formatEpisodeCount(episodes: AnimeEpisodes | undefined): string {
  if (!episodes) return '';
  if (episodes.count === 0) return '?';
  if (episodes.aired === episodes.count) return `${episodes.count}`;
  return `${episodes.aired} / ${episodes.count}`;
}

export function isAnimeAiring(anime: AnimeCatalogItem): boolean {
  return anime.anime_status?.alias === 'ongoing';
}

export function getPosterUrl(anime: AnimeCatalogItem, size: keyof AnimePoster = 'huge'): string {
  return anime.poster?.[size] || anime.poster?.medium || anime.poster?.big || '';
}

export function getRatingDisplay(rating: { average: number; counters?: number } | undefined): string {
  if (!rating) return '0.00';
  return rating.average.toFixed(2);
}
