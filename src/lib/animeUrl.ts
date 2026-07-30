/**
 * Anime URL helpers.
 *
 * The API returns `anime_url` either as a slug (e.g. `"frieren"`) or as
 * a full path (e.g. `"/anime/frieren"`). For client-side navigation we
 * always want a path of the shape `/anime/{slug-or-id}`.
 */

export function getAnimeUrlSlug(anime: { anime_url?: string; anime_id: number }): string {
  if (anime.anime_url?.startsWith('/anime/')) return anime.anime_url.slice('/anime/'.length);
  return anime.anime_url || String(anime.anime_id);
}

export function buildAnimeUrl(anime: { anime_url?: string; anime_id: number }): string {
  return `/anime/${getAnimeUrlSlug(anime)}`;
}
