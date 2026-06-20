import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LogoButton } from '@/components/Layout/LogoButton';

vi.mock('@/components/Layout/SearchSheet', () => ({
  SearchSheet: ({ open }: { open: boolean; onOpenChange: (v: boolean) => void }) => (
    <div data-testid="search-sheet" data-open={open} />
  ),
}));

const setSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), setSearchParams],
    useLocation: () => ({ pathname: '/', search: '' }),
  };
});

describe('LogoButton', () => {
  beforeEach(() => {
    setSearchParams.mockClear();
  });

  describe('desktop variant', () => {
    it('renders brand text', () => {
      render(
        <MemoryRouter>
          <LogoButton variant="desktop" />
        </MemoryRouter>
      );
      expect(screen.getByText('Ani')).toBeInTheDocument();
      expect(screen.getByText('Hako')).toBeInTheDocument();
    });

    it('renders favicon image', () => {
      const { container } = render(
        <MemoryRouter>
          <LogoButton variant="desktop" />
        </MemoryRouter>
      );
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/favicon.svg');
    });

    it('is a link to /', () => {
      render(
        <MemoryRouter>
          <LogoButton variant="desktop" />
        </MemoryRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });

    it('does NOT render SearchSheet (no search trigger on desktop)', () => {
      const { container } = render(
        <MemoryRouter>
          <LogoButton variant="desktop" />
        </MemoryRouter>
      );
      expect(container.querySelector('[data-testid="search-sheet"]')).not.toBeInTheDocument();
    });
  });

  describe('mobile variant', () => {
    it('renders favicon only (no text)', () => {
      const { container } = render(
        <MemoryRouter>
          <LogoButton variant="mobile" />
        </MemoryRouter>
      );
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/favicon.svg');
      expect(container.textContent).not.toContain('Hako');
    });

    it('has circular shape and primary border', () => {
      render(
        <MemoryRouter>
          <LogoButton variant="mobile" />
        </MemoryRouter>
      );
      const button = screen.getByRole('button', { name: 'Поиск' });
      expect(button.className).toContain('rounded-full');
      expect(button.className).toContain('border-primary');
    });

    it('opens search sheet on click', () => {
      render(
        <MemoryRouter>
          <LogoButton variant="mobile" />
        </MemoryRouter>
      );
      const button = screen.getByRole('button', { name: 'Поиск' });
      fireEvent.click(button);
      const sheet = screen.getByTestId('search-sheet');
      expect(sheet.dataset.open).toBe('true');
    });
  });
});
