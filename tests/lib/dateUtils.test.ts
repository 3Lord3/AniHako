import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatLastOnline, formatDateShort } from '@/lib/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('returns "Неизвестно" for null', () => {
      expect(formatDate(null)).toBe('Неизвестно');
    });

    it('returns "Неизвестно" for undefined', () => {
      expect(formatDate(undefined)).toBe('Неизвестно');
    });

    it('formats timestamp to Russian date format', () => {
      const timestamp = 1704067200;
      const result = formatDate(timestamp);
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it('returns "Неизвестно" for 0', () => {
      expect(formatDate(0)).toBe('Неизвестно');
    });
  });

  describe('formatLastOnline', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Был(а) давно" for null', () => {
      expect(formatLastOnline(null)).toBe('Был(а) давно');
    });

    it('returns "Был(а) давно" for undefined', () => {
      expect(formatLastOnline(undefined)).toBe('Был(а) давно');
    });

    it('returns "только что" for recent timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now)).toBe('только что');
    });

    it('returns minutes ago for timestamps less than an hour', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now - 300)).toBe('5 мин. назад');
      expect(formatLastOnline(now - 60)).toBe('1 мин. назад');
      expect(formatLastOnline(now - 3599)).toBe('59 мин. назад');
    });

    it('returns hours ago for timestamps less than a day', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now - 3600)).toBe('1 ч. назад');
      expect(formatLastOnline(now - 7200)).toBe('2 ч. назад');
      expect(formatLastOnline(now - 86399)).toBe('23 ч. назад');
    });

    it('returns days ago for timestamps less than a week', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now - 86400)).toBe('1 дн. назад');
      expect(formatLastOnline(now - 172800)).toBe('2 дн. назад');
      expect(formatLastOnline(now - 604799)).toBe('6 дн. назад');
    });

    it('returns formatted date for timestamps older than a week', () => {
      const now = Math.floor(Date.now() / 1000);
      const oldTimestamp = now - 604800;
      const result = formatLastOnline(oldTimestamp);
      expect(result).not.toMatch(/мин\.|ч\.|дн\./);
    });
  });

  describe('formatDateShort', () => {
    it('returns empty string for null', () => {
      expect(formatDateShort(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatDateShort(undefined)).toBe('');
    });

    it('formats timestamp to short Russian date format', () => {
      const timestamp = 1704067200;
      const result = formatDateShort(timestamp);
      expect(result).toMatch(/\d{2}\.\d{2}/);
    });
  });
});