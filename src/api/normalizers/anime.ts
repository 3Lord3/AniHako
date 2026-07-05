import type {
  AnimeCatalogItem,
  AnimePoster,
  AnimeRating,
  AnimeReleaseStatus,
  AnimeType,
  AnimeEpisodes,
  AnimeGenre,
  AnimeStudio,
  AnimeScreenshot,
  AnimeVideo,
  AnimeTranslate,
  AnimeViewingOrder,
  AnimeUser,
  AnimeRemoteIds,
  AnimeTop,
  AnimeMinAge,
} from '@/types/anime';

export interface PaginatedAnimeList {
  data: AnimeCatalogItem[];
  page: number;
  totalPages: number;
  total: number;
}

interface RawPoster {
  small?: string;
  medium?: string;
  big?: string;
  huge?: string;
  fullsize?: string;
  mega?: string;
}

interface RawRating {
  average?: number;
  counters?: number;
}

interface RawType {
  name?: string;
  value?: number;
  shortname?: string;
  alias?: string;
}

interface RawReleaseStatus {
  title?: string;
  class?: string;
  alias?: 'released' | 'ongoing' | 'announcement';
  value?: 0 | 1 | 2;
}

interface RawEpisodes {
  aired?: number;
  count?: number;
  next_date?: number;
  prev_date?: number;
}

interface RawGenre {
  title?: string;
  id?: number;
  alias?: string;
  url?: string;
}

interface RawStudio {
  title?: string;
  id?: number;
  url?: string;
}

interface RawUser {
  list?: { is_fav?: boolean; list?: { title?: string; href?: string; id?: 0 | 1 | 2 | 3 | 5 } };
  rating?: number;
}

interface RawScreenshot {
  sizes?: { small?: string; full?: string };
  id?: number;
  time?: number;
  episode?: string;
}

interface RawVideo {
  video_id?: number;
  iframe_url?: string;
  data?: { dubbing?: string; player?: string; player_id?: number };
  number?: string;
  date?: number;
  index?: number;
  skips?: { ending?: { time: number; length: number }; opening?: { time: number; length: number } };
  views?: number;
  duration?: number;
}

interface RawTranslate {
  title?: string;
  href?: string;
  value?: number;
}

interface RawViewingOrder {
  title?: string;
  anime_id?: number;
  type?: RawType;
  anime_url?: string;
  anime_status?: RawReleaseStatus;
  description?: string;
  poster?: RawPoster;
  user?: { list?: { list?: { title?: string; href?: string; id?: 0 | 1 | 2 | 3 | 5 }; is_fav?: boolean }; rating?: number };
  year?: number;
  data?: { id?: number; index?: number; text?: string };
}

interface RawRemoteIds {
  worldart_id?: number;
  worldart_type?: 'animation' | 'cinema';
  kp_id?: number;
  anidub_id?: number;
  sr_id?: number;
  anilibria_alias?: string;
  shikimori_id?: number;
  myanimelist_id?: number;
}

interface RawTop {
  category?: number;
  global?: number;
}

interface RawMinAge {
  value?: 0 | 1 | 2 | 3 | 4 | 5;
  title?: string;
  title_long?: string;
}

export interface RawAnimeItem {
  anime_id: number;
  anime_status?: RawReleaseStatus;
  anime_url?: string;
  poster?: RawPoster | string;
  rating?: RawRating;
  title: string;
  type?: RawType;
  year?: number;
  description?: string;
  views?: number;
  season?: 1 | 2 | 3 | 4;
  min_age?: RawMinAge;
  user?: RawUser;
  remote_ids?: RawRemoteIds;
  top?: RawTop;
  blocked_in?: string[];
  original?: string;
  duration?: number;
  trailers_count?: number;
  lists_count?: number;
  other_titles?: string[];
  creators?: RawStudio[];
  studios?: RawStudio[];
  videos?: RawVideo[];
  genres?: RawGenre[];
  viewing_order?: RawViewingOrder[];
  translates?: RawTranslate[];
  episodes?: RawEpisodes;
  comments_count?: number;
  reviews_count?: number;
  random_screenshots?: RawScreenshot[];
  posts_count?: number;
  partner_videos_count?: number;
}

function normalizePoster(poster: RawPoster | string | undefined | null): AnimePoster {
  if (typeof poster === 'string' || poster == null) {
    return { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' };
  }
  return {
    small: poster.small ?? '',
    medium: poster.medium ?? '',
    big: poster.big ?? '',
    huge: poster.huge ?? '',
    fullsize: poster.fullsize ?? '',
    mega: poster.mega ?? '',
  };
}

function normalizeRating(rating: RawRating | undefined | null): { average: number; counters: number } {
  if (!rating) return { average: 0, counters: 0 };
  return {
    average: Number(rating.average ?? 0),
    counters: Number(rating.counters ?? 0),
  };
}

function normalizeType(type: RawType | undefined | null): AnimeType {
  return {
    name: type?.name ?? '',
    value: type?.value ?? 0,
    shortname: type?.shortname ?? '',
    alias: type?.alias ?? '',
  };
}

function normalizeAnimeStatus(s: RawReleaseStatus | undefined | null): AnimeReleaseStatus {
  return {
    title: s?.title ?? '',
    class: s?.class,
    alias: s?.alias ?? 'announcement',
    value: s?.value ?? 2,
  };
}

function normalizeEpisodes(e: RawEpisodes | undefined | null): AnimeEpisodes {
  return {
    aired: e?.aired ?? 0,
    count: e?.count ?? 0,
    next_date: e?.next_date,
    prev_date: e?.prev_date,
  };
}

function normalizeGenre(g: RawGenre): AnimeGenre {
  return {
    title: g.title ?? '',
    id: g.id ?? 0,
    alias: g.alias ?? '',
    url: g.url ?? '',
  };
}

function normalizeStudio(s: RawStudio): AnimeStudio {
  return {
    title: s.title ?? '',
    id: s.id ?? 0,
    url: s.url ?? '',
  };
}

function normalizeUser(u: RawUser | undefined | null): AnimeUser | undefined {
  if (!u) return undefined;
  const result: AnimeUser = { rating: u.rating };
  if (u.list) {
    result.list = {
      is_fav: u.list.is_fav ?? false,
    };
    if (u.list.list) {
      result.list.list = {
        title: u.list.list.title ?? '',
        href: u.list.list.href ?? '',
        id: u.list.list.id ?? 1,
      };
    }
  }
  return result;
}

function normalizeScreenshot(s: RawScreenshot | undefined): AnimeScreenshot | null {
  if (!s) return null;
  return {
    sizes: { small: s.sizes?.small ?? '', full: s.sizes?.full ?? '' },
    id: s.id ?? 0,
    time: s.time ?? 0,
    episode: s.episode ?? '',
  };
}

function normalizeVideo(v: RawVideo | undefined): AnimeVideo | null {
  if (!v) return null;
  return {
    video_id: v.video_id ?? 0,
    iframe_url: v.iframe_url ?? '',
    data: {
      dubbing: v.data?.dubbing ?? '',
      player: v.data?.player ?? '',
      player_id: v.data?.player_id ?? 0,
    },
    number: v.number ?? '',
    date: v.date ?? 0,
    index: v.index ?? 0,
    skips: v.skips,
    views: v.views ?? 0,
    duration: v.duration ?? 0,
  };
}

function normalizeTranslate(t: RawTranslate | undefined): AnimeTranslate | null {
  if (!t) return null;
  return {
    title: t.title ?? '',
    href: t.href ?? '',
    value: t.value ?? 0,
  };
}

function normalizeViewingOrder(v: RawViewingOrder | undefined): AnimeViewingOrder | null {
  if (!v) return null;
  return {
    title: v.title ?? '',
    anime_id: v.anime_id ?? 0,
    type: normalizeType(v.type),
    anime_url: v.anime_url ?? '',
    anime_status: normalizeAnimeStatus(v.anime_status),
    description: v.description,
    poster: normalizePoster(v.poster),
    user: v.user
      ? {
          ...(v.user.list
            ? {
                list: {
                  is_fav: v.user.list.is_fav ?? false,
                  ...(v.user.list.list
                    ? {
                        list: {
                          title: v.user.list.list.title ?? '',
                          href: v.user.list.list.href ?? '',
                          id: v.user.list.list.id ?? 1,
                        },
                      }
                    : {}),
                },
              }
            : {}),
          rating: v.user.rating,
        }
      : undefined,
    year: v.year ?? 0,
    data: v.data
      ? { id: v.data.id ?? 0, index: v.data.index ?? 0, text: v.data.text ?? '' }
      : undefined,
  };
}

function normalizeRemoteIds(r: RawRemoteIds | undefined): AnimeRemoteIds | undefined {
  if (!r) return undefined;
  return {
    worldart_id: r.worldart_id,
    worldart_type: r.worldart_type,
    kp_id: r.kp_id,
    anidub_id: r.anidub_id,
    sr_id: r.sr_id,
    anilibria_alias: r.anilibria_alias,
    shikimori_id: r.shikimori_id,
    myanimelist_id: r.myanimelist_id,
  };
}

function normalizeTop(t: RawTop | undefined): AnimeTop | undefined {
  if (!t) return undefined;
  return { category: t.category, global: t.global };
}

function normalizeMinAge(m: RawMinAge | undefined): AnimeMinAge | undefined {
  if (!m) return undefined;
  return {
    value: m.value ?? 0,
    title: m.title ?? '',
    title_long: m.title_long,
  };
}

export function normalizeAnimeItem(item: RawAnimeItem): AnimeCatalogItem {
  return {
    anime_id: item.anime_id,
    anime_status: normalizeAnimeStatus(item.anime_status),
    anime_url: item.anime_url ?? String(item.anime_id),
    poster: normalizePoster(item.poster),
    rating: normalizeRating(item.rating),
    title: item.title,
    type: normalizeType(item.type),
    year: item.year ?? 0,
    description: item.description ?? '',
    views: item.views ?? 0,
    season: item.season ?? 1,
    min_age: normalizeMinAge(item.min_age),
    user: normalizeUser(item.user),
    remote_ids: normalizeRemoteIds(item.remote_ids),
    top: normalizeTop(item.top),
    blocked_in: item.blocked_in,
    original: item.original,
    duration: item.duration,
    trailers_count: item.trailers_count,
    lists_count: item.lists_count,
    other_titles: item.other_titles,
    creators: item.creators?.map(normalizeStudio),
    studios: item.studios?.map(normalizeStudio),
    videos: item.videos?.map((v) => normalizeVideo(v)).filter((v): v is AnimeVideo => v !== null),
    genres: item.genres?.map(normalizeGenre),
    viewing_order: item.viewing_order
      ?.map((v) => normalizeViewingOrder(v))
      .filter((v): v is AnimeViewingOrder => v !== null),
    translates: item.translates
      ?.map((t) => normalizeTranslate(t))
      .filter((t): t is AnimeTranslate => t !== null),
    episodes: normalizeEpisodes(item.episodes),
    comments_count: item.comments_count,
    reviews_count: item.reviews_count,
    random_screenshots: item.random_screenshots
      ?.map((s) => normalizeScreenshot(s))
      .filter((s): s is AnimeScreenshot => s !== null),
    posts_count: item.posts_count,
    partner_videos_count: item.partner_videos_count,
  };
}

function isNumericKeyObject(value: unknown): value is Record<string, RawAnimeItem> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => !Number.isNaN(Number(k)));
}

export function normalizeAnimeResponse(response: unknown): AnimeCatalogItem[] {
  let items: RawAnimeItem[] = [];

  if (response && typeof response === 'object' && !Array.isArray(response)) {
    if (isNumericKeyObject(response)) {
      items = Object.values(response);
    }
  } else if (Array.isArray(response)) {
    items = response as RawAnimeItem[];
  }

  return items
    .filter((item): item is RawAnimeItem => item != null)
    .map(normalizeAnimeItem);
}

export function formatAnimeListResponse(
  data: AnimeCatalogItem[],
  meta?: { page?: number; totalPages?: number; total?: number },
): PaginatedAnimeList {
  return {
    data,
    page: meta?.page ?? 1,
    totalPages: meta?.totalPages ?? 1,
    total: meta?.total ?? data.length,
  };
}

// Re-exports for `re-exported as AnimeRating` consumers.
export type { AnimePoster, AnimeRating };
