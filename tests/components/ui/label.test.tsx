import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label', () => {
  it('renders label element', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('renders label with htmlFor', () => {
    render(<Label htmlFor="test-input">Label Text</Label>);
    const label = screen.getByText('Label Text');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('applies custom className', () => {
    const { container } = render(<Label className="custom-label">Label</Label>);
    expect(container.firstChild).toHaveClass('custom-label');
  });

  it('forwards props to underlying label element', () => {
    render(<Label data-testid="test-label">Label</Label>);
    expect(screen.getByTestId('test-label')).toBeInTheDocument();
  });
});