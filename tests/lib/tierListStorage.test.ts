import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadTierList, saveTierList } from '@/lib/tierListStorage';
import { createEmptyTierList } from '@/types/tier';

describe('tierListStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadTierList', () => {
    it('returns an empty default list when there is no userId', () => {
      expect(loadTierList(undefined)).toEqual(createEmptyTierList());
      expect(localStorage.getItem).not.toHaveBeenCalled();
    });

    it('returns an empty default list when nothing is stored', () => {
      vi.mocked(localStorage.getItem).mockReturnValueOnce(null);
      expect(loadTierList(42)).toEqual(createEmptyTierList());
      expect(localStorage.getItem).toHaveBeenCalledWith('anitier:v1:42');
    });

    it('parses a previously stored list', () => {
      const stored = createEmptyTierList();
      stored.items[1] = { animeId: 1, title: 'A', posterUrl: 'p.jpg', url: 'a' };
      vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(stored));

      expect(loadTierList(42)).toEqual(stored);
    });

    it('upgrades previously stored low-res poster URLs to the big size', () => {
      const stored = createEmptyTierList();
      stored.items[1] = {
        animeId: 1,
        title: 'A',
        posterUrl: 'https://static.yani.tv/posters/small/123.webp',
        url: 'a',
      };
      stored.items[2] = {
        animeId: 2,
        title: 'B',
        posterUrl: 'https://static.yani.tv/posters/medium/456.webp',
        url: 'b',
      };
      vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(stored));

      const result = loadTierList(42);
      expect(result.items[1].posterUrl).toBe('https://static.yani.tv/posters/big/123.webp');
      expect(result.items[2].posterUrl).toBe('https://static.yani.tv/posters/big/456.webp');
    });

    it('leaves already-big poster URLs untouched', () => {
      const stored = createEmptyTierList();
      stored.items[1] = {
        animeId: 1,
        title: 'A',
        posterUrl: 'https://static.yani.tv/posters/big/123.webp',
        url: 'a',
      };
      vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(stored));

      expect(loadTierList(42).items[1].posterUrl).toBe('https://static.yani.tv/posters/big/123.webp');
    });

    it('falls back to the default list on malformed JSON', () => {
      vi.mocked(localStorage.getItem).mockReturnValueOnce('{not json');
      expect(loadTierList(42)).toEqual(createEmptyTierList());
    });

    it('falls back to the default list when the shape is unrecognized', () => {
      vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify({ version: 2 }));
      expect(loadTierList(42)).toEqual(createEmptyTierList());
    });
  });

  describe('saveTierList', () => {
    it('does nothing when there is no userId', () => {
      saveTierList(undefined, createEmptyTierList());
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('persists the state under a per-user key', () => {
      const state = createEmptyTierList();
      saveTierList(7, state);
      expect(localStorage.setItem).toHaveBeenCalledWith('anitier:v1:7', JSON.stringify(state));
    });
  });
});
