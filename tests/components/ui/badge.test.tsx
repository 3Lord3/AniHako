import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const;
    variants.forEach(variant => {
      const { container } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders span element by default', () => {
    const { container } = render(<Badge>Default Badge</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});