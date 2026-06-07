import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';

vi.mock('@/components/Layout/DesktopHeader', () => ({
  DesktopHeader: () => <header data-testid="desktop-header" />,
}));

vi.mock('@/components/Layout/MobileBottomNav', () => ({
  MobileBottomNav: () => <nav data-testid="mobile-nav" />,
}));

const renderLayout = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>home content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('Layout', () => {
  it('renders desktop header', () => {
    renderLayout('/');
    expect(screen.getByTestId('desktop-header')).toBeInTheDocument();
  });

  it('renders mobile bottom nav', () => {
    renderLayout('/');
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('renders child route content via Outlet', () => {
    renderLayout('/');
    expect(screen.getByText('home content')).toBeInTheDocument();
  });

  it('main has bottom padding for mobile bottom nav (pb-24)', () => {
    renderLayout('/');
    const main = screen.getByRole('main');
    expect(main.className).toContain('pb-24');
  });
});
