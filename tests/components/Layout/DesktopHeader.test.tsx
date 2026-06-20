import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DesktopHeader } from '@/components/Layout/DesktopHeader';

vi.mock('@/components/Layout/LogoButton', () => ({
  LogoButton: () => <button data-testid="logo-btn">Logo</button>,
}));

vi.mock('@/components/Layout/ProfileDropdown', () => ({
  ProfileDropdown: ({ variant }: { variant: string }) => (
    <div data-testid={`profile-${variant}`} />
  ),
}));

const renderComponent = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <DesktopHeader pathname={pathname} />
    </MemoryRouter>
  );

describe('DesktopHeader', () => {
  it('renders logo button', () => {
    renderComponent('/');
    expect(screen.getByTestId('logo-btn')).toBeInTheDocument();
  });

  it('renders profile dropdown (desktop variant)', () => {
    renderComponent('/');
    expect(screen.getByTestId('profile-desktop')).toBeInTheDocument();
  });

  it('renders main nav links: Главная, Каталог', () => {
    renderComponent('/');
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Каталог')).toBeInTheDocument();
  });

  it('renders services nav links: AniMatch, AniTour', () => {
    renderComponent('/');
    expect(screen.getByText('AniMatch')).toBeInTheDocument();
    expect(screen.getByText('AniTour')).toBeInTheDocument();
  });

  it('marks "Главная" as active on /', () => {
    renderComponent('/');
    const link = screen.getByText('Главная').closest('a');
    expect(link?.className).toContain('text-primary');
    expect(link?.className).toContain('font-medium');
  });

  it('marks "Каталог" as active on /catalog', () => {
    renderComponent('/catalog');
    const link = screen.getByText('Каталог').closest('a');
    expect(link?.className).toContain('text-primary');
    expect(link?.className).toContain('font-medium');
  });

  it('marks "AniMatch" as active on /matcher', () => {
    renderComponent('/matcher');
    const link = screen.getByText('AniMatch').closest('a');
    expect(link?.className).toContain('text-primary');
    expect(link?.className).toContain('font-medium');
  });

  it('marks "AniTour" as active on /tournament', () => {
    renderComponent('/tournament');
    const link = screen.getByText('AniTour').closest('a');
    expect(link?.className).toContain('text-primary');
    expect(link?.className).toContain('font-medium');
  });

  it('does not mark inactive links as font-medium (the active marker)', () => {
    renderComponent('/catalog');
    const home = screen.getByText('Главная').closest('a');
    // hover:text-primary is always present, but font-medium only when active
    expect(home?.className).not.toContain('font-medium');
  });

  it('hides header on mobile (md:block responsive class)', () => {
    const { container } = renderComponent('/');
    const header = container.querySelector('header');
    expect(header?.className).toContain('hidden');
    expect(header?.className).toContain('md:block');
  });
});
