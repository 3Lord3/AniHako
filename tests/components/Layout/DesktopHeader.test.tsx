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

vi.mock('@/components/Layout/SearchSheet', () => ({
  SearchSheet: () => <div data-testid="search-sheet" />,
}));

vi.mock('@/components/Layout/ServicesDropdown', () => ({
  ServicesDropdown: ({ variant, active }: { variant?: string; active: boolean }) => (
    <div data-testid={`services-${variant}`} data-active={String(active)} />
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

  it('renders services dropdown (desktop variant, inactive by default)', () => {
    renderComponent('/');
    const services = screen.getByTestId('services-desktop');
    expect(services).toBeInTheDocument();
    expect(services.getAttribute('data-active')).toBe('false');
  });

  it('marks services dropdown as active on /matcher', () => {
    renderComponent('/matcher');
    expect(screen.getByTestId('services-desktop').getAttribute('data-active')).toBe('true');
  });

  it('marks services dropdown as active on /tournament', () => {
    renderComponent('/tournament');
    expect(screen.getByTestId('services-desktop').getAttribute('data-active')).toBe('true');
  });

  it('marks services dropdown as active on /tier', () => {
    renderComponent('/tier');
    expect(screen.getByTestId('services-desktop').getAttribute('data-active')).toBe('true');
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
