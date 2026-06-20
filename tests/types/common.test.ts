import { describe, it, expect } from 'vitest';
import type { PaginatedResponse } from '@/types/common';

describe('types/common', () => {
  describe('PaginatedResponse', () => {
    it('accepts valid paginated response', () => {
      const response: PaginatedResponse<{ id: number }> = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: {
          last: 10,
          page: 1,
          items: 20,
        },
      };
      expect(response.data).toHaveLength(2);
      expect(response.pagination.last).toBe(10);
    });

    it('accepts empty data', () => {
      const response: PaginatedResponse<string> = {
        data: [],
        pagination: {
          last: 0,
          page: 1,
          items: 0,
        },
      };
      expect(response.data).toHaveLength(0);
    });
  });
});