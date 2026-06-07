import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileDropdown } from '@/components/Layout/ProfileDropdown';
import type { YummyUser } from '@/types/user';

const mockUser: YummyUser = {
  id: 42,
  nickname: 'Tester',
  avatars: { big: 'https://example.com/avatar.jpg' },
};

const mockLogout = vi.fn();

vi.mock('@/hooks', () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(() => ({ logout: mockLogout })),
}));

vi.mock('../ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

import { useUser } from '@/hooks';

describe('ProfileDropdown', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReset();
  });

  const setUser = (data: YummyUser | null) => {
    vi.mocked(useUser).mockImplementation(
      () =>
        ({
          data,
          isLoading: false,
        }) as ReturnType<typeof useUser>
    );
  };

  describe('desktop variant', () => {
    it('renders avatar slot for logged in user', () => {
      setUser(mockUser);
      const { container } = render(<ProfileDropdown variant="desktop" />);
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar?.className).toContain('h-10');
      expect(avatar?.className).toContain('w-10');
    });

    it('shows User icon when not logged in', () => {
      setUser(null);
      const { container } = render(<ProfileDropdown variant="desktop" />);
      const trigger = screen.getByRole('button');
      expect(trigger.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="avatar"]')).not.toBeInTheDocument();
    });

    it('shows fallback initial when avatar URL is missing', () => {
      setUser({ id: 1, nickname: 'Z' });
      render(<ProfileDropdown variant="desktop" />);
      expect(screen.getByText('Z')).toBeInTheDocument();
    });
  });

  describe('mobile variant', () => {
    it('shows "Профиль" label for logged in user', () => {
      setUser(mockUser);
      render(<ProfileDropdown variant="mobile" />);
      expect(screen.getByText('Профиль')).toBeInTheDocument();
    });

    it('shows "Войти" label for anonymous user', () => {
      setUser(null);
      render(<ProfileDropdown variant="mobile" />);
      expect(screen.getByText('Войти')).toBeInTheDocument();
    });

    it('uses small avatar (h-6 w-6) on mobile', () => {
      setUser(mockUser);
      const { container } = render(<ProfileDropdown variant="mobile" />);
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar?.className).toContain('h-6');
      expect(avatar?.className).toContain('w-6');
    });

    it('desktop uses default cursor (not grid layout)', () => {
      setUser(mockUser);
      const { container } = render(<ProfileDropdown variant="desktop" />);
      const trigger = screen.getByRole('button');
      expect(trigger.className).not.toContain('grid-cols-5');
      const innerAvatar = container.querySelector('[data-slot="avatar"]');
      expect(innerAvatar?.className).toContain('h-10');
    });
  });
});
