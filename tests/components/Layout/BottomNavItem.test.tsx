import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home } from 'lucide-react';
import { BottomNavItem } from '@/components/Layout/BottomNavItem';

const baseItem = {
  to: '/catalog',
  label: 'Каталог',
  icon: Home,
};

const renderComponent = (active: boolean, to = '/catalog') =>
  render(
    <MemoryRouter>
      <BottomNavItem
        item={{ ...baseItem, to }}
        active={active}
      />
    </MemoryRouter>
  );

describe('BottomNavItem', () => {
  it('renders label text', () => {
    renderComponent(false);
    expect(screen.getByText('Каталог')).toBeInTheDocument();
  });

  it('renders link with correct href', () => {
    renderComponent(false, '/profile');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile');
  });

  it('applies muted foreground when inactive', () => {
    renderComponent(false);
    const link = screen.getByRole('link');
    expect(link.className).toContain('text-muted-foreground');
    expect(link.className).not.toContain('text-primary');
  });

  it('applies primary color when active', () => {
    renderComponent(true);
    const link = screen.getByRole('link');
    expect(link.className).toContain('text-primary');
  });

  it('icon stroke is bolded when active', () => {
    const { container } = render(
      <MemoryRouter>
        <BottomNavItem item={baseItem} active={true} />
      </MemoryRouter>
    );
    const icon = container.querySelector('svg');
    expect(icon?.className.baseVal || icon?.getAttribute('class')).toContain('stroke-[2.5]');
  });
});
