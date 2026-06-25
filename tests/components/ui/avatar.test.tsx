import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarBadge, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';

describe('Avatar', () => {
  it('renders avatar container', () => {
    render(<Avatar />);
    expect(document.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
  });

  it('renders avatar with sizes', () => {
    const sizes = ['default', 'sm', 'lg'] as const;
    sizes.forEach(size => {
      const { container } = render(<Avatar size={size} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('renders avatar group', () => {
    render(<AvatarGroup><Avatar /></AvatarGroup>);
    expect(document.querySelector('[data-slot="avatar-group"]')).toBeInTheDocument();
  });

  it('renders avatar group count', () => {
    render(<AvatarGroupCount>+3</AvatarGroupCount>);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('renders avatar badge', () => {
    render(<AvatarBadge />);
    expect(document.querySelector('[data-slot="avatar-badge"]')).toBeInTheDocument();
  });
});