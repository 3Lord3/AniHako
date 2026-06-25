import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles type prop', () => {
    render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('handles value and onChange', () => {
    const handleChange = () => {};
    render(<Input value="test" onChange={handleChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});