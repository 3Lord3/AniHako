import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatLastOnline, formatDateShort } from '@/lib/dateUtils';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('returns "Неизвестно" for null', () => {
      expect(formatDate(null, t)).toBe('Неизвестно');
    });

    it('returns "Неизвестно" for undefined', () => {
      expect(formatDate(undefined, t)).toBe('Неизвестно');
    });

    it('formats timestamp to Russian date format', () => {
      const timestamp = 1704067200;
      const result = formatDate(timestamp, t);
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it('returns "Неизвестно" for 0', () => {
      expect(formatDate(0, t)).toBe('Неизвестно');
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
      expect(formatLastOnline(null, t)).toBe('Был(а) давно');
    });

    it('returns "Был(а) давно" for undefined', () => {
      expect(formatLastOnline(undefined, t)).toBe('Был(а) давно');
    });

    it('returns "только что" for recent timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now, t)).toBe('только что');
    });

    it('returns minutes ago for timestamps less than an hour', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now - 300, t)).toBe('5 мин. назад');
      expect(formatLastOnline(now - 60, t)).toBe('1 мин. назад');
      expect(formatLastOnline(now - 3599, t)).toBe('59 мин. назад');
    });

    it('returns hours ago for timestamps less than a day', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now - 3600, t)).toBe('1 ч. назад');
      expect(formatLastOnline(now - 7200, t)).toBe('2 ч. назад');
      expect(formatLastOnline(now - 86399, t)).toBe('23 ч. назад');
    });

    it('returns days ago for timestamps less than a week', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatLastOnline(now - 86400, t)).toBe('1 дн. назад');
      expect(formatLastOnline(now - 172800, t)).toBe('2 дн. назад');
      expect(formatLastOnline(now - 604799, t)).toBe('6 дн. назад');
    });

    it('returns formatted date for timestamps older than a week', () => {
      const now = Math.floor(Date.now() / 1000);
      const oldTimestamp = now - 604800;
      const result = formatLastOnline(oldTimestamp, t);
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