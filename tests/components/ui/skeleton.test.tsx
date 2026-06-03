import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('renders skeleton element', () => {
    render(<Skeleton />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    expect(container.firstChild).toHaveClass('custom-skeleton');
  });

  it('renders with default rounded class', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('rounded-md');
  });
});