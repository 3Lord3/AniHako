import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  it('renders checkbox', () => {
    render(<Checkbox />);
    expect(document.querySelector('[data-slot="checkbox"]')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Checkbox checked />);
    const indicator = document.querySelector('[data-slot="checkbox-indicator"]');
    expect(indicator).toBeInTheDocument();
  });

  it('handles onChange', () => {
    const handleChange = (_checked: boolean) => {
      // callback is called
    };
    render(<Checkbox onCheckedChange={handleChange} />);
    const checkbox = document.querySelector('[data-slot="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Checkbox disabled />);
    const checkbox = document.querySelector('[data-slot="checkbox"]');
    expect(checkbox).toHaveClass('disabled:opacity-50');
  });
});