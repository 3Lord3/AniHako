import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const variants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>{variant}</Button>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const;
    sizes.forEach(size => {
      const { container } = render(<Button size={size}>{size}</Button>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles click events', () => {
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    screen.getByRole('button').click();
    expect(clicked).toBe(true);
  });
});