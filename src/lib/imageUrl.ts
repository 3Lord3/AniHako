/**
 * Image URL utilities for YummyAnime API.
 *
 * The API returns image URLs as-is (poster, cover, screenshots).
 * This file provides utilities for image optimization and fallbacks.
 */

export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url || typeof url !== 'string') return fallback || '/placeholder-anime.png';

  if (url.startsWith('//')) {
    return 'https:' + url;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return url;
}

export type PosterSize = 'mega' | 'huge' | 'fullsize' | 'big' | 'medium' | 'small';

type PosterObject = Partial<Record<PosterSize, string>>;

interface PosterSource {
  poster?: PosterObject | string | null;
  cover?: string | null;
}

export function getPosterUrl(anime: PosterSource, size: PosterSize = 'mega'): string {
  const poster = anime.poster;

  if (typeof poster === 'string') {
    return getImageUrl(poster, '/placeholder-anime.png');
  }

  if (poster && typeof poster === 'object') {
    const order: PosterSize[] = [size, 'mega', 'huge', 'fullsize', 'big', 'medium', 'small'];
    for (const s of order) {
      const url = poster[s];
      if (url) return getImageUrl(url, '/placeholder-anime.png');
    }
  }

  return getImageUrl(anime.cover, '/placeholder-anime.png');
}

export function getCoverUrl(anime: { cover?: string | null; poster?: string | null }): string {
  return getImageUrl(anime.cover || anime.poster, '/placeholder-anime.png');
}

export function getHeroPosterUrl(anime: { poster?: PosterObject | string | null }, fallback = '/placeholder-anime.png'): string {
  const poster = anime.poster;

  if (poster && typeof poster === 'object') {
    const order: PosterSize[] = ['mega', 'huge', 'fullsize', 'big'];
    for (const s of order) {
      const url = poster[s];
      if (url) return getImageUrl(url, fallback);
    }
  }

  return fallback;
}

export function getScreenshotUrl(screenshot: string): string {
  return getImageUrl(screenshot, '/placeholder-screenshot.png');
}

export function buildImageProxyUrl(url: string): string {
  return url;
}

export function getFallbackPoster(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect fill="%23333" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-size="24" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
}
