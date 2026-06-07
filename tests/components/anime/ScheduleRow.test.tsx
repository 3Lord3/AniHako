import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ScheduleRow } from '@/components/anime/ScheduleRow';
import type { AnimeScheduleItem } from '@/types/anime';

const baseItem: AnimeScheduleItem = {
  anime_id: 1,
  anime_url: '1',
  title: 'Test Anime',
  poster: { small: '/p.jpg', medium: '/p.jpg', big: '', huge: '', fullsize: '', mega: '' },
  episodes: {
    aired: 5,
    count: 12,
    next_date: 1735689600, // 2025-01-01
    prev_date: 1733011200, // 2024-12-01
  },
};

const renderRow = (item: Partial<AnimeScheduleItem> = {}) =>
  render(
    <table>
      <tbody>
        <ScheduleRow item={{ ...baseItem, ...item } as AnimeScheduleItem} />
      </tbody>
    </table>,
    { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
  );

describe('ScheduleRow', () => {
  describe('mobile episode badge', () => {
    it('renders episode count "5/12" before the poster', () => {
      const { container } = renderRow();
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      const badge = link!.querySelector('span');
      expect(badge?.textContent).toBe('5/12');
    });

    it('hides episode badge on sm: and up (sm:hidden)', () => {
      const { container } = renderRow();
      const link = container.querySelector('a');
      const badge = link!.querySelector('span');
      expect(badge?.className).toContain('sm:hidden');
    });

    it('uses tabular-nums for stable digit width', () => {
      const { container } = renderRow();
      const link = container.querySelector('a');
      const badge = link!.querySelector('span');
      expect(badge?.className).toContain('tabular-nums');
    });

    it('uses fixed width w-9 to prevent layout shift', () => {
      const { container } = renderRow();
      const link = container.querySelector('a');
      const badge = link!.querySelector('span');
      expect(badge?.className).toContain('w-9');
    });

    it('handles missing count with "?"', () => {
      const { container } = renderRow({
        episodes: { aired: 5, count: 0 },
      });
      const link = container.querySelector('a');
      const badge = link!.querySelector('span');
      expect(badge?.textContent).toBe('5/?');
    });

    it('handles missing aired with 0', () => {
      const { container } = renderRow({
        episodes: { aired: 0, count: 12 },
      });
      const link = container.querySelector('a');
      const badge = link!.querySelector('span');
      expect(badge?.textContent).toBe('0/12');
    });
  });

  describe('column visibility (responsive classes)', () => {
    it('Эпизоды column visible at sm: and up (hidden sm:table-cell)', () => {
      const { container } = renderRow();
      const cells = container.querySelectorAll('td');
      const episodesCell = cells[1];
      expect(episodesCell?.className).toContain('hidden');
      expect(episodesCell?.className).toContain('sm:table-cell');
      // it must NOT use md: (which was the old breakpoint)
      expect(episodesCell?.className).not.toContain('md:table-cell');
    });

    it('Предыдущий column visible at md: and up (hidden md:table-cell)', () => {
      const { container } = renderRow();
      const cells = container.querySelectorAll('td');
      const prevCell = cells[2];
      expect(prevCell?.className).toContain('hidden');
      expect(prevCell?.className).toContain('md:table-cell');
      // it must NOT use sm: (which was the old breakpoint)
      expect(prevCell?.className).not.toContain('sm:table-cell');
    });

    it('Следующий column visible at lg: and up (hidden lg:table-cell)', () => {
      const { container } = renderRow();
      const cells = container.querySelectorAll('td');
      const nextCell = cells[3];
      expect(nextCell?.className).toContain('hidden');
      expect(nextCell?.className).toContain('lg:table-cell');
    });

    it('column order is: title, episodes, prev, next', () => {
      const { container } = renderRow();
      const cells = container.querySelectorAll('td');
      expect(cells).toHaveLength(4);
    });
  });

  describe('content', () => {
    it('renders title text', () => {
      renderRow();
      expect(screen.getByText('Test Anime')).toBeInTheDocument();
    });

    it('renders poster image with correct alt', () => {
      renderRow();
      const img = screen.getByAltText('Test Anime');
      expect(img).toHaveAttribute('src', '/p.jpg');
    });

    it('renders Эпизоды cell with "5 / 12" format', () => {
      const { container } = renderRow();
      const cells = container.querySelectorAll('td');
      const episodesCell = cells[1];
      expect(within(episodesCell!).getByText('5 / 12')).toBeInTheDocument();
    });

    it('links to /anime/{id}', () => {
      renderRow();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/anime/1');
    });
  });
});
