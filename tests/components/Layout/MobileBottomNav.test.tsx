import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';

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
    <MemoryRouter>
      <MobileBottomNav pathname={pathname} />
    </MemoryRouter>
  );

describe('MobileBottomNav', () => {
  it('renders logo button in the center', () => {
    renderComponent('/');
    expect(screen.getByTestId('logo-btn')).toBeInTheDocument();
  });

  it('renders profile dropdown (mobile variant)', () => {
    renderComponent('/');
    expect(screen.getByTestId('profile-mobile')).toBeInTheDocument();
  });

  it('renders "Главная" and "Каталог" links', () => {
    renderComponent('/');
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Каталог')).toBeInTheDocument();
  });

  it('renders "Сервисы" trigger', () => {
    renderComponent('/');
    expect(screen.getByText('Сервисы')).toBeInTheDocument();
  });

  it('marks "Главная" active on /', () => {
    renderComponent('/');
    const link = screen.getByText('Главная').closest('a');
    expect(link?.className).toContain('text-primary');
  });

  it('marks "Сервисы" active on /matcher', () => {
    renderComponent('/matcher');
    const trigger = screen.getByText('Сервисы').closest('button');
    expect(trigger?.className).toContain('text-primary');
  });

  it('marks "Сервисы" active on /tournament', () => {
    renderComponent('/tournament');
    const trigger = screen.getByText('Сервисы').closest('button');
    expect(trigger?.className).toContain('text-primary');
  });

  it('does not mark "Сервисы" active on unrelated paths', () => {
    renderComponent('/profile');
    const trigger = screen.getByText('Сервисы').closest('button');
    expect(trigger?.className).not.toContain('text-primary');
  });

  it('uses 5-column grid layout', () => {
    const { container } = renderComponent('/');
    const grid = container.querySelector('.grid-cols-5');
    expect(grid).toBeInTheDocument();
  });

  it('hides on desktop (md:hidden responsive class)', () => {
    const { container } = renderComponent('/');
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('md:hidden');
  });
});
