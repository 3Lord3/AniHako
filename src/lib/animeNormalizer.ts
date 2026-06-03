export function extractPosterUrl(poster: any): string | null {
  if (!poster) return null;
  if (typeof poster === 'string') return poster;
  if (poster.huge) return poster.huge;
  if (poster.mega) return poster.mega;
  if (poster.big) return poster.big;
  if (poster.medium) return poster.medium;
  if (poster.small) return poster.small;
  return null;
}

export function extractRating(rating: any): string | null {
  if (rating?.average != null) {
    return String(rating.average.toFixed(2));
  }
  return null;
}

export function extractAnimeKind(type: any): string | null {
  return type?.alias ?? null;
}

export function extractAnimeStatus(animeStatus: any): string | null {
  return animeStatus?.title || null;
}

export function normalizeAnimeItem(item: any) {
  const id = item.anime_id;
  const scoreStr = extractRating(item.rating);
  const kind = extractAnimeKind(item.type);
  const status = extractAnimeStatus(item.anime_status);
  const year = item.year || null;
  const description = item.description || null;

  return {
    anime_id: id,
    name: item.title || '',
    russian: item.title || null,
    cover: null,
    url: item.anime_url || String(id),
    anime_url: item.anime_url || String(id),
    kind: kind,
    score: scoreStr,
    status: status,
    episodes: item.episodes || null,
    episodes_aired: item.episodes_aired || null,
    aired_on: item.aired_on || null,
    released_on: item.released_on || null,
    title: item.title,
    description: description,
    duration: item.duration,
    rating: item.rating,
    genres: item.genres,
    year: year,
    poster: item.poster,
  };
}

export function normalizeAnimeResponse(response: any): any[] {
  let animeArray: any[] = [];

  if (response && typeof response === 'object' && !Array.isArray(response)) {
    const keys = Object.keys(response);
    if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
      animeArray = Object.values(response);
    }
  } else if (response && response.data && Array.isArray(response.data.response)) {
    animeArray = response.data.response;
  } else if (Array.isArray(response)) {
    animeArray = response;
  }

  return (animeArray || [])
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map(normalizeAnimeItem);
}

export function formatAnimeListResponse(data: any[]) {
  return {
    data,
    page: 1,
    total_pages: 1,
    total: data.length,
  };
}
