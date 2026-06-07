import { describe, it, expect } from 'vitest';
import { mainNavItems, servicesItems, isPathActive } from '@/components/Layout/navConfig';

describe('navConfig', () => {
  describe('mainNavItems', () => {
    it('contains Главная and Каталог', () => {
      const labels = mainNavItems.map((i) => i.label);
      expect(labels).toEqual(['Главная', 'Каталог']);
    });

    it('routes are / and /catalog', () => {
      const routes = mainNavItems.map((i) => i.to);
      expect(routes).toEqual(['/', '/catalog']);
    });

    it('every item has an icon component', () => {
      mainNavItems.forEach((item) => {
        expect(item.icon).toBeDefined();
        // lucide-react icons are forwardRef objects (function or { $$typeof, render })
        expect(['function', 'object']).toContain(typeof item.icon);
      });
    });
  });

  describe('servicesItems', () => {
    it('contains AniMatch and AniTour', () => {
      const labels = servicesItems.map((i) => i.label);
      expect(labels).toEqual(['AniMatch', 'AniTour']);
    });

    it('routes are /matcher and /tournament', () => {
      const routes = servicesItems.map((i) => i.to);
      expect(routes).toEqual(['/matcher', '/tournament']);
    });
  });

  describe('isPathActive', () => {
    it('returns true for exact / match', () => {
      expect(isPathActive('/', '/')).toBe(true);
    });

    it('returns false for other paths when target is /', () => {
      expect(isPathActive('/catalog', '/')).toBe(false);
      expect(isPathActive('/anime/123', '/')).toBe(false);
    });

    it('returns true for nested paths when target is a prefix', () => {
      expect(isPathActive('/anime/123', '/anime')).toBe(true);
      expect(isPathActive('/catalog?page=2', '/catalog')).toBe(true);
    });

    it('returns false for unrelated paths', () => {
      expect(isPathActive('/profile', '/catalog')).toBe(false);
    });

    it('treats / as exact match only (not a prefix)', () => {
      expect(isPathActive('/catalog', '/')).toBe(false);
      expect(isPathActive('/random', '/')).toBe(false);
    });
  });
});
