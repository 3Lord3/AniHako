import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// We need to hoist the mock
vi.mock('@/hooks', () => {
  return {
    useTheme: vi.fn(() => ({
      theme: 'system',
      setTheme: vi.fn(),
    })),
  };
});

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme switcher with system theme label', () => {
    render(<ThemeSwitcher />);
    expect(screen.getByText('Системная')).toBeInTheDocument();
  });

  it('renders three theme buttons', () => {
    render(<ThemeSwitcher />);
    const buttons = document.querySelectorAll('button[aria-pressed]');
    expect(buttons.length).toBe(3);
  });

  it('marks the current theme as pressed', () => {
    render(<ThemeSwitcher />);
    const systemBtn = screen.getByRole('button', { name: 'Системная' });
    expect(systemBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders theme icons for each option', () => {
    render(<ThemeSwitcher />);
    const icons = document.querySelectorAll('button[aria-pressed] svg');
    expect(icons.length).toBe(3);
  });
});