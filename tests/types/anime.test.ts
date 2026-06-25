import { describe, it, expect } from 'vitest';
import { formatEpisodeCount } from '@/types/anime';

describe('types/anime', () => {
  describe('formatEpisodeCount', () => {
    it('returns empty string when episodes is undefined', () => {
      expect(formatEpisodeCount(undefined)).toBe('');
    });

    it('returns ? when count is 0', () => {
      expect(formatEpisodeCount({ aired: 0, count: 0 })).toBe('?');
    });

    it('returns count when all episodes aired', () => {
      expect(formatEpisodeCount({ aired: 12, count: 12 })).toBe('12');
    });

    it('returns "aired / count" when partially aired', () => {
      expect(formatEpisodeCount({ aired: 6, count: 12 })).toBe('6 / 12');
    });
  });
});
