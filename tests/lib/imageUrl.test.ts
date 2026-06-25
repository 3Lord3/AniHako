import { describe, it, expect } from 'vitest';
import { getPosterUrl, getCoverUrl, getHeroPosterUrl, getScreenshotUrl, buildImageProxyUrl, getFallbackPoster } from '@/lib/imageUrl';

describe('imageUrl', () => {
  describe('getPosterUrl', () => {
    it('returns mega poster from poster object', () => {
      const anime = { poster: { mega: '/posters/mega.jpg', huge: '/posters/huge.jpg' } };
      expect(getPosterUrl(anime)).toBe('/posters/mega.jpg');
    });

    it('returns huge poster when mega not available', () => {
      const anime = { poster: { huge: '/posters/huge.jpg', big: '/posters/big.jpg' } };
      expect(getPosterUrl(anime)).toBe('/posters/huge.jpg');
    });

    it('returns big poster when huge and mega not available', () => {
      const anime = { poster: { big: '/posters/big.jpg', medium: '/posters/medium.jpg' } };
      expect(getPosterUrl(anime)).toBe('/posters/big.jpg');
    });

    it('returns fallback when poster is string', () => {
      const anime = { poster: '/posters/string.jpg' };
      expect(getPosterUrl(anime)).toBe('/posters/string.jpg');
    });

    it('returns fallback when poster is null', () => {
      const anime = { poster: null, cover: '/cover.jpg' };
      expect(getPosterUrl(anime)).toBe('/cover.jpg');
    });

    it('returns placeholder when no poster or cover', () => {
      const anime = { poster: null };
      expect(getPosterUrl(anime)).toBe('/placeholder-anime.png');
    });
  });

  describe('getCoverUrl', () => {
    it('returns cover URL when available', () => {
      const anime = { cover: '/covers/cover.jpg' };
      expect(getCoverUrl(anime)).toBe('/covers/cover.jpg');
    });

    it('returns poster when cover not available', () => {
      const anime = { cover: null, poster: '/posters/poster.jpg' };
      expect(getCoverUrl(anime)).toBe('/posters/poster.jpg');
    });

    it('returns placeholder when neither cover nor poster', () => {
      const anime = { cover: null, poster: null };
      expect(getCoverUrl(anime)).toBe('/placeholder-anime.png');
    });
  });

  describe('getHeroPosterUrl', () => {
    it('returns mega poster from poster object', () => {
      const anime = { poster: { mega: '/posters/mega.jpg' } };
      expect(getHeroPosterUrl(anime)).toBe('/posters/mega.jpg');
    });

    it('returns huge poster when mega not available', () => {
      const anime = { poster: { huge: '/posters/huge.jpg' } };
      expect(getHeroPosterUrl(anime)).toBe('/posters/huge.jpg');
    });

    it('returns fullsize poster when huge and mega not available', () => {
      const anime = { poster: { fullsize: '/posters/fullsize.jpg' } };
      expect(getHeroPosterUrl(anime)).toBe('/posters/fullsize.jpg');
    });

    it('returns big poster when fullsize not available', () => {
      const anime = { poster: { big: '/posters/big.jpg' } };
      expect(getHeroPosterUrl(anime)).toBe('/posters/big.jpg');
    });

    it('returns custom fallback when no poster', () => {
      const anime = { poster: null };
      expect(getHeroPosterUrl(anime, '/custom-fallback.png')).toBe('/custom-fallback.png');
    });

    it('returns default fallback when no poster and no custom fallback', () => {
      const anime = { poster: null };
      expect(getHeroPosterUrl(anime)).toBe('/placeholder-anime.png');
    });
  });

  describe('getScreenshotUrl', () => {
    it('returns screenshot URL as-is', () => {
      expect(getScreenshotUrl('/screenshots/1.png')).toBe('/screenshots/1.png');
    });

    it('returns placeholder for null', () => {
      expect(getScreenshotUrl(null as unknown as string)).toBe('/placeholder-screenshot.png');
    });
  });

  describe('buildImageProxyUrl', () => {
    it('returns URL as-is (no proxy needed)', () => {
      expect(buildImageProxyUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });
  });

  describe('getFallbackPoster', () => {
    it('returns an SVG data URL', () => {
      const result = getFallbackPoster();
      expect(result).toBe('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect fill="%23333" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-size="24" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E');
    });
  });
});