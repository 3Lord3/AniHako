import { describe, it, expect } from 'vitest';
import { getRatingColor, STATUS_COLORS, STATUS_LABELS, ALL_STATUSES } from '@/types/constants';

describe('constants', () => {
  describe('getRatingColor', () => {
    it('returns green for rating >= 8', () => {
      expect(getRatingColor(8)).toBe('bg-green-500 text-white');
      expect(getRatingColor(8.5)).toBe('bg-green-500 text-white');
      expect(getRatingColor(10)).toBe('bg-green-500 text-white');
    });

    it('returns yellow for rating >= 6 and < 8', () => {
      expect(getRatingColor(6)).toBe('bg-yellow-500 text-black');
      expect(getRatingColor(7)).toBe('bg-yellow-500 text-black');
      expect(getRatingColor(7.9)).toBe('bg-yellow-500 text-black');
    });

    it('returns red for rating < 6', () => {
      expect(getRatingColor(5)).toBe('bg-red-500 text-white');
      expect(getRatingColor(3)).toBe('bg-red-500 text-white');
      expect(getRatingColor(0)).toBe('bg-red-500 text-white');
    });

    it('handles string input', () => {
      expect(getRatingColor('8')).toBe('bg-green-500 text-white');
      expect(getRatingColor('6.5')).toBe('bg-yellow-500 text-black');
      expect(getRatingColor('4')).toBe('bg-red-500 text-white');
    });
  });

  describe('STATUS_COLORS', () => {
    it('has correct colors for all status types', () => {
      expect(STATUS_COLORS.watching).toBe('bg-blue-500 text-white dark:bg-blue-600');
      expect(STATUS_COLORS.completed).toBe('bg-green-500 text-white dark:bg-green-600');
      expect(STATUS_COLORS.dropped).toBe('bg-red-500 text-white dark:bg-red-600');
      expect(STATUS_COLORS.planned).toBe('bg-yellow-500 text-white dark:bg-yellow-600');
      expect(STATUS_COLORS.paused).toBe('bg-yellow-500 text-gray-900 dark:bg-yellow-600 dark:text-gray-900');
      expect(STATUS_COLORS.favourite).toBe('bg-pink-500 text-white dark:bg-pink-600');
    });
  });

  describe('STATUS_LABELS', () => {
    it('has correct labels for all status types', () => {
      expect(STATUS_LABELS.watching).toBe('Смотрю');
      expect(STATUS_LABELS.completed).toBe('Просмотрено');
      expect(STATUS_LABELS.dropped).toBe('Брошено');
      expect(STATUS_LABELS.planned).toBe('В планах');
      expect(STATUS_LABELS.paused).toBe('Отложено');
      expect(STATUS_LABELS.favourite).toBe('Любимое');
    });
  });

  describe('ALL_STATUSES', () => {
    it('contains all status types', () => {
      expect(ALL_STATUSES).toContain('watching');
      expect(ALL_STATUSES).toContain('completed');
      expect(ALL_STATUSES).toContain('dropped');
      expect(ALL_STATUSES).toContain('planned');
      expect(ALL_STATUSES).toContain('paused');
      expect(ALL_STATUSES.length).toBe(5);
    });
  });
});