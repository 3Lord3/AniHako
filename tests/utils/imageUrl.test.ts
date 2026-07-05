import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getImageUrl } from '@/lib/imageUrl';

describe('getImageUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:8000');
  });

  it('returns full URL when input is already a full URL', () => {
    const fullUrl = 'http://example.com/image.jpg';
    const result = getImageUrl(fullUrl);
    expect(result).toBe(fullUrl);
  });

  it('returns full URL with https', () => {
    const fullUrl = 'https://example.com/image.jpg';
    const result = getImageUrl(fullUrl);
    expect(result).toBe(fullUrl);
  });

  it('returns protocol-relative URL with https', () => {
    const protocolRelativeUrl = '//example.com/image.jpg';
    const result = getImageUrl(protocolRelativeUrl);
    expect(result).toBe('https:' + protocolRelativeUrl);
  });

  it('returns relative URL as-is', () => {
    const relativePath = '/media/posters/123.jpg';
    const result = getImageUrl(relativePath);
    expect(result).toBe('/media/posters/123.jpg');
  });

  it('returns static path as-is', () => {
    const path = 'static/screenshots/1_01.png';
    const result = getImageUrl(path);
    expect(result).toBe('static/screenshots/1_01.png');
  });

  it('returns placeholder for null input', () => {
    const result = getImageUrl(null);
    expect(result).toBe('/placeholder-anime.png');
  });

  it('returns placeholder for undefined input', () => {
    const result = getImageUrl(undefined);
    expect(result).toBe('/placeholder-anime.png');
  });

  it('returns placeholder for empty string input', () => {
    const result = getImageUrl('');
    expect(result).toBe('/placeholder-anime.png');
  });

  it('returns path without leading slash as-is', () => {
    const path = 'posters/123.jpg';
    const result = getImageUrl(path);
    expect(result).toBe('posters/123.jpg');
  });

  it('returns placeholder for falsy input', () => {
    const result = getImageUrl(null, '/fallback.png');
    expect(result).toBe('/fallback.png');
  });

  it('returns placeholder for non-string input', () => {
    const result = getImageUrl(undefined as unknown as string, '/fallback.png');
    expect(result).toBe('/fallback.png');
  });
});