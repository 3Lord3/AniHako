import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sparkles, Trophy } from 'lucide-react';
import { ServicesDropdown } from '@/components/Layout/ServicesDropdown';
import type { NavItem } from '@/components/Layout/navConfig';

const items: readonly NavItem[] = [
  { to: '/matcher', label: 'AniMatch', icon: Sparkles },
  { to: '/tournament', label: 'AniTour', icon: Trophy },
];

const renderComponent = (active: boolean) =>
  render(
    <MemoryRouter>
      <ServicesDropdown items={items} active={active} />
    </MemoryRouter>
  );

describe('ServicesDropdown', () => {
  it('renders trigger label "Сервисы"', () => {
    renderComponent(false);
    expect(screen.getByText('Сервисы')).toBeInTheDocument();
  });

  it('uses muted color when inactive', () => {
    renderComponent(false);
    const trigger = screen.getByRole('button');
    expect(trigger.className).toContain('text-muted-foreground');
    expect(trigger.className).not.toContain('text-primary');
  });

  it('uses primary color when active', () => {
    renderComponent(true);
    const trigger = screen.getByRole('button');
    expect(trigger.className).toContain('text-primary');
  });
});
