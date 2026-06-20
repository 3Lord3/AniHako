import { describe, it, expect } from 'vitest';
import {
  mapStatusToApi,
  mapStatusFromApi,
  mapListIdToStatus,
  mapStatusToListId,
  YUMMY_LIST_IDS,
  API_STATUS_VALUES,
} from '@/types/list';
import type { AnimeStatus } from '@/types/list';

describe('types/list', () => {
  describe('mapStatusToApi', () => {
    it('maps watching to watching', () => {
      expect(mapStatusToApi('watching')).toBe('watching');
    });

    it('maps completed to completed', () => {
      expect(mapStatusToApi('completed')).toBe('completed');
    });

    it('maps paused to paused', () => {
      expect(mapStatusToApi('paused')).toBe('paused');
    });

    it('maps dropped to dropped', () => {
      expect(mapStatusToApi('dropped')).toBe('dropped');
    });

    it('maps planned to planned', () => {
      expect(mapStatusToApi('planned')).toBe('planned');
    });

    it('maps favourite to favourite', () => {
      expect(mapStatusToApi('favourite')).toBe('favourite');
    });

    it('returns unknown status as-is', () => {
      expect(mapStatusToApi('unknown' as AnimeStatus)).toBe('unknown');
    });
  });

  describe('mapStatusFromApi', () => {
    it('maps watching to watching', () => {
      expect(mapStatusFromApi('watching')).toBe('watching');
    });

    it('maps completed to completed', () => {
      expect(mapStatusFromApi('completed')).toBe('completed');
    });

    it('maps paused to paused', () => {
      expect(mapStatusFromApi('paused')).toBe('paused');
    });

    it('maps dropped to dropped', () => {
      expect(mapStatusFromApi('dropped')).toBe('dropped');
    });

    it('maps planned to planned', () => {
      expect(mapStatusFromApi('planned')).toBe('planned');
    });

    it('maps favourite to favourite', () => {
      expect(mapStatusFromApi('favourite')).toBe('favourite');
    });

    it('returns planned for unknown status', () => {
      expect(mapStatusFromApi('unknown')).toBe('planned');
    });
  });

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

    it('maps 4 to favourite', () => {
      expect(mapListIdToStatus(4)).toBe('favourite');
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

    it('maps favourite to 4', () => {
      expect(mapStatusToListId('favourite')).toBe(4);
    });

    it('maps paused to 5', () => {
      expect(mapStatusToListId('paused')).toBe(5);
    });

    it('returns 1 for unknown status', () => {
      expect(mapStatusToListId('unknown' as AnimeStatus)).toBe(1);
    });
  });

  describe('YUMMY_LIST_IDS', () => {
    it('has correct watch_now value', () => {
      expect(YUMMY_LIST_IDS.watch_now).toBe(0);
    });

    it('has correct will value', () => {
      expect(YUMMY_LIST_IDS.will).toBe(1);
    });

    it('has correct watched value', () => {
      expect(YUMMY_LIST_IDS.watched).toBe(2);
    });

    it('has correct lost value', () => {
      expect(YUMMY_LIST_IDS.lost).toBe(3);
    });

    it('has correct postpone value', () => {
      expect(YUMMY_LIST_IDS.postpone).toBe(5);
    });
  });

  describe('API_STATUS_VALUES', () => {
    it('has all status mappings', () => {
      expect(API_STATUS_VALUES.watching).toBe('watching');
      expect(API_STATUS_VALUES.completed).toBe('completed');
      expect(API_STATUS_VALUES.paused).toBe('paused');
      expect(API_STATUS_VALUES.dropped).toBe('dropped');
      expect(API_STATUS_VALUES.planned).toBe('planned');
      expect(API_STATUS_VALUES.favourite).toBe('favourite');
    });
  });
});