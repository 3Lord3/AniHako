import { describe, it, expect } from 'vitest';
import {
  mapListIdToStatus,
  mapStatusToListId,
  API_STATUS_IDS,
} from '@/types/list';
import type { AnimeStatus } from '@/types/list';

describe('types/list', () => {
  describe('mapListIdToStatus', () => {
    it('maps 0 to watching', () => {
      expect(mapListIdToStatus(0)).toBe('watching');
    });

    it('maps 1 to planned', () => {
      expect(mapListIdToStatus(1)).toBe('planned');
    });

    it('maps 2 to completed', () => {
      expect(mapListIdToStatus(2)).toBe('completed');
    });

    it('maps 3 to dropped', () => {
      expect(mapListIdToStatus(3)).toBe('dropped');
    });

    it('maps 5 to paused', () => {
      expect(mapListIdToStatus(5)).toBe('paused');
    });

    it('returns planned for unknown list id', () => {
      expect(mapListIdToStatus(999)).toBe('planned');
      expect(mapListIdToStatus(undefined)).toBe('planned');
    });
  });

  describe('mapStatusToListId', () => {
    it('maps watching to 0', () => {
      expect(mapStatusToListId('watching')).toBe(0);
    });

    it('maps planned to 1', () => {
      expect(mapStatusToListId('planned')).toBe(1);
    });

    it('maps completed to 2', () => {
      expect(mapStatusToListId('completed')).toBe(2);
    });

    it('maps dropped to 3', () => {
      expect(mapStatusToListId('dropped')).toBe(3);
    });

    it('maps paused to 5', () => {
      expect(mapStatusToListId('paused')).toBe(5);
    });

    it('falls back to planned for favourite (UI-only status)', () => {
      expect(mapStatusToListId('favourite')).toBe(1);
    });

    it('returns 1 for unknown status', () => {
      expect(mapStatusToListId('unknown' as AnimeStatus)).toBe(1);
    });
  });

  describe('API_STATUS_IDS', () => {
    it('exposes a complete status -> id mapping', () => {
      expect(API_STATUS_IDS.watching).toBe(0);
      expect(API_STATUS_IDS.planned).toBe(1);
      expect(API_STATUS_IDS.completed).toBe(2);
      expect(API_STATUS_IDS.dropped).toBe(3);
      expect(API_STATUS_IDS.paused).toBe(5);
    });
  });
});
