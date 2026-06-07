import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';

const mockRegisterMutate = vi.fn();
vi.mock('@/hooks', () => ({
  useAuth: () => ({
    register: mockRegisterMutate,
    isRegistering: false,
  }),
  useUser: () => ({ data: null, isLoading: false }),
}));

describe('RegisterPage vertical centering', () => {
  it('wrapper uses dvh-based min-height (not 60vh)', () => {
    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-[calc(100dvh');
    expect(wrapper.className).not.toContain('min-h-[60vh]');
  });

  it('wrapper has flex centering classes', () => {
    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
  });

  it('subtracts at least 6rem for header/padding', () => {
    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const wrapper = container.firstChild as HTMLElement;
    const match = wrapper.className.match(/min-h-\[calc\(100dvh-(\d+)rem\)\]/);
    expect(match).not.toBeNull();
    if (match) {
      const rems = parseInt(match[1] ?? '0', 10);
      expect(rems).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('RegisterPage', () => {
  it('renders title', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });
});
